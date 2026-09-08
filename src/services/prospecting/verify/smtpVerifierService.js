/**
 * LilyPad ERP - In-House SMTP Email Verifier
 * Replaces Apollo's bulk_match email reveal (and the ZeroBounce/
 * MillionVerifier paid hooks in emailVerificationService.js) with a
 * direct DNS MX lookup + raw SMTP handshake, using only Node's built-in
 * `dns` and `net` modules - no API key, no per-lookup fee.
 *
 * IMPORTANT OPERATIONAL CAVEAT: this speaks plaintext SMTP on port 25.
 * Render, AWS, GCP, and most mainstream PaaS/cloud providers block
 * outbound port 25 by default to stop their platforms being used for
 * spam - so this will very likely fail with ECONNREFUSED/ETIMEDOUT when
 * run from this app's current Render service. It works correctly from
 * any network that actually permits outbound 25 (a VPS with the block
 * lifted, an on-prem box, a residential/business connection). Every
 * function below fails soft into 'unverified' rather than throwing, so
 * a blocked network degrades gracefully instead of crashing a batch.
 *
 * Verification is inherently probabilistic, not a guarantee:
 *   - Some servers greylist first-time senders (temporary 4xx - retry later).
 *   - Some servers accept-all (catch-all) and will say "yes" to anything,
 *     which is why checkCatchAll() runs before trusting any RCPT result.
 *   - Aggressive probing can get your source IP added to real-time
 *     blackhole lists - keep volume/rate low per domain.
 */

const dns = require('dns').promises
const net = require('net')
const winston = require('../../../logger')
const { generateCandidateEmails } = require('./emailPatternService')

const SMTP_PORT = 25
const COMMAND_TIMEOUT_MS = 10000
const HELO_DOMAIN = process.env.SMTP_VERIFIER_HELO_DOMAIN || 'lilypad-erp.local'
const PROBE_FROM_ADDRESS = process.env.SMTP_VERIFIER_FROM_ADDRESS || `verify-probe@${HELO_DOMAIN}`
const MAX_CANDIDATES_PER_DOMAIN = 9

/**
 * Circuit breaker for a network-level port 25 block. A connection-phase
 * failure (refused/timed out before any SMTP bytes were exchanged) is a
 * property of the network, not the target domain - if it happens twice
 * in a row, every other domain will fail the exact same way, so it's
 * wasteful to keep retrying per-MX-host and per-person (each retry costs
 * a full COMMAND_TIMEOUT_MS). Once tripped, verification short-circuits
 * to 'unverified' immediately for a cooldown period instead of stalling
 * a deep run for minutes on end.
 */
const PORT_25_BLOCK_COOLDOWN_MS = 30 * 60 * 1000
const CONSECUTIVE_FAILURES_TO_TRIP_BREAKER = 2

let consecutiveConnectFailures = 0
let port25BlockedUntil = 0

function isPort25CircuitOpen () {
  return Date.now() < port25BlockedUntil
}

function recordConnectFailure () {
  consecutiveConnectFailures++
  if (consecutiveConnectFailures >= CONSECUTIVE_FAILURES_TO_TRIP_BREAKER && !isPort25CircuitOpen()) {
    port25BlockedUntil = Date.now() + PORT_25_BLOCK_COOLDOWN_MS
    winston.warn(`SMTP verifier: outbound port 25 appears blocked on this network (${consecutiveConnectFailures} consecutive connection failures) - pausing SMTP verification for ${PORT_25_BLOCK_COOLDOWN_MS / 60000} minutes rather than retrying every lookup.`)
  }
}

function recordConnectSuccess () {
  consecutiveConnectFailures = 0
  port25BlockedUntil = 0
}

/** Exposed so the worker/UI can surface "SMTP verification is currently disabled - port 25 appears blocked" instead of silently returning 'unverified' for everything. */
function getCircuitStatus () {
  return { open: isPort25CircuitOpen(), reopensAt: port25BlockedUntil ? new Date(port25BlockedUntil) : null }
}

/**
 * Looks up MX records for a domain, sorted by priority (lowest first,
 * per RFC 5321 - lower preference value = more preferred). Falls back
 * to the domain itself (an implicit MX per RFC 5321 5.1) if no MX
 * records are published, which is common for smaller company domains.
 *
 * Distinguishes "no MX published" from an RFC 7505 null MX record (a
 * lone record with an empty or "." exchange) - the latter is a domain
 * explicitly declaring it accepts no mail at all (common for parked
 * domains and some corporate apex domains that route mail elsewhere),
 * so it returns [] rather than falling back to guessing the domain
 * itself is a mail server.
 */
async function resolveMxHosts (domain) {
  try {
    const records = await dns.resolveMx(domain)
    const realRecords = records.filter((r) => r.exchange && r.exchange !== '.')
    if (records.length && !realRecords.length) return []
    if (realRecords.length) {
      return realRecords.sort((a, b) => a.priority - b.priority).map((r) => r.exchange)
    }
  } catch (err) {
    winston.warn(`SMTP verifier: MX lookup failed for ${domain}: ${err.message}`)
  }
  return [domain]
}

/**
 * Reads one complete SMTP response off the socket, correctly handling
 * multi-line responses (continuation lines are "250-text", the final
 * line of a response is "250 text" - note the space, not a dash).
 */
function readSmtpResponse (socket) {
  return new Promise((resolve, reject) => {
    let buffer = ''

    const onData = (chunk) => {
      buffer += chunk.toString('utf8')
      const lines = buffer.split('\r\n').filter(Boolean)
      const lastLine = lines[lines.length - 1] || ''
      if (/^\d{3} /.test(lastLine)) {
        cleanup()
        resolve({ code: Number(lastLine.slice(0, 3)), message: buffer })
      }
    }
    const onError = (err) => { cleanup(); reject(err) }
    const onTimeout = () => { cleanup(); reject(new Error('SMTP response timed out')) }

    function cleanup () {
      socket.removeListener('data', onData)
      socket.removeListener('error', onError)
      socket.removeListener('timeout', onTimeout)
    }

    socket.on('data', onData)
    socket.once('error', onError)
    socket.once('timeout', onTimeout)
  })
}

function sendSmtpCommand (socket, command) {
  return new Promise((resolve, reject) => {
    socket.write(command + '\r\n', (err) => { if (err) reject(err) })
  }).then(() => readSmtpResponse(socket))
}

/**
 * Opens one SMTP session against a domain's mail server and runs a
 * caller-supplied sequence of RCPT TO probes over it, reusing the same
 * connection (RSET between attempts) rather than reconnecting per
 * candidate - both faster and less likely to look like a connection
 * flood to the receiving server.
 */
async function withSmtpSession (domain, fn) {
  if (isPort25CircuitOpen()) return null

  const mxHosts = await resolveMxHosts(domain)

  for (const mxHost of mxHosts) {
    const socket = new net.Socket()
    socket.setTimeout(COMMAND_TIMEOUT_MS)
    let connected = false

    try {
      await new Promise((resolve, reject) => {
        socket.once('error', reject)
        socket.once('timeout', () => reject(new Error('Connection timed out')))
        socket.connect(SMTP_PORT, mxHost, resolve)
      })
      connected = true
      recordConnectSuccess()
      socket.setTimeout(COMMAND_TIMEOUT_MS)

      const greeting = await readSmtpResponse(socket)
      if (greeting.code !== 220) throw new Error(`Unexpected greeting: ${greeting.code}`)

      const helo = await sendSmtpCommand(socket, `EHLO ${HELO_DOMAIN}`)
      if (helo.code >= 400) await sendSmtpCommand(socket, `HELO ${HELO_DOMAIN}`)

      const result = await fn(socket, mxHost)
      await sendSmtpCommand(socket, 'QUIT').catch(() => {})
      socket.end()
      return result
    } catch (err) {
      winston.warn(`SMTP verifier: session with ${mxHost} for ${domain} failed: ${err.message}`)
      socket.destroy()

      if (!connected) {
        recordConnectFailure()
        // A connection-phase failure means the network itself is blocking
        // this, not the specific MX host - every other host would fail
        // identically, so stop cycling through alternates for this domain.
        if (isPort25CircuitOpen()) break
      }
      // Otherwise (a protocol-level failure after connecting) try the
      // next MX host in priority order before giving up entirely.
    }
  }

  return null
}

/**
 * Probes one address within an already-open SMTP session. Returns the
 * RCPT TO response code: 250/251 = accepted (address exists, or server
 * will relay), 550/551/553 = rejected (mailbox doesn't exist), anything
 * else (4xx = greylisted/temp-fail, or a connection drop) is treated as
 * inconclusive.
 */
async function probeRecipient (socket, email) {
  await sendSmtpCommand(socket, `MAIL FROM:<${PROBE_FROM_ADDRESS}>`)
  const rcpt = await sendSmtpCommand(socket, `RCPT TO:<${email}>`)
  await sendSmtpCommand(socket, 'RSET').catch(() => {})
  return rcpt.code
}

/**
 * Detects catch-all domains by probing an address that (almost) certainly
 * doesn't exist. If the server accepts it anyway (250), every subsequent
 * RCPT TO result for this domain is meaningless for confirming any one
 * specific address - the domain accepts everything.
 */
async function checkCatchAll (socket, domain) {
  const probeAddress = `lilypad-catchall-probe-${Date.now()}@${domain}`
  const code = await probeRecipient(socket, probeAddress)
  return code === 250 || code === 251
}

/**
 * Full pipeline: given a person's name and their company's domain,
 * generates candidate addresses and probes them against the domain's
 * real mail server. This is the direct replacement for what Apollo's
 * bulk_match call used to hand back as an already-revealed email.
 *
 * Returns:
 *   { email, status, mxHost, candidatesTried, checkedAt }
 * status is one of: 'verified' (RCPT accepted, not catch-all),
 * 'catch_all' (best-guess pattern, but server accepts everything so it
 * can't be confirmed), 'invalid' (all candidates rejected), or
 * 'unverified' (network didn't allow a real check - e.g. port 25 blocked).
 */
async function findBestEmailForPerson ({ firstName, lastName, domain }) {
  const candidates = generateCandidateEmails(firstName, lastName, domain).slice(0, MAX_CANDIDATES_PER_DOMAIN)
  if (!candidates.length) {
    return { email: '', status: 'unverified', mxHost: null, candidatesTried: 0, checkedAt: new Date() }
  }

  const outcome = await withSmtpSession(domain, async (socket, mxHost) => {
    const isCatchAll = await checkCatchAll(socket, domain)
    if (isCatchAll) {
      return { email: candidates[0], status: 'catch_all', mxHost, candidatesTried: 0 }
    }

    for (const candidate of candidates) {
      const code = await probeRecipient(socket, candidate)
      if (code === 250 || code === 251) {
        return { email: candidate, status: 'verified', mxHost, candidatesTried: candidates.indexOf(candidate) + 1 }
      }
    }

    return { email: candidates[0], status: 'invalid', mxHost, candidatesTried: candidates.length }
  })

  if (!outcome) {
    // No MX host was reachable at all (network blocked, domain has no
    // mail server, or every connection attempt failed) - fail soft.
    return { email: candidates[0], status: 'unverified', mxHost: null, candidatesTried: 0, checkedAt: new Date() }
  }

  return { ...outcome, checkedAt: new Date() }
}

module.exports = {
  resolveMxHosts,
  findBestEmailForPerson,
  getCircuitStatus
}
