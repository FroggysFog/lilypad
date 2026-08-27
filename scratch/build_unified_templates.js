const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../public/index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const contentStartMarker = '<div class="content pb-0">';
const footerStartMarker = '<!-- Start Footer -->';

// Helper to assemble pages with active sidebar highlights
function getHeaderForPage(activeKey, pageTitle = 'LilyPad ERP') {
    let header = indexHtml.substring(0, indexHtml.indexOf(contentStartMarker) + contentStartMarker.length);
    header = header.replace(/<title>.*?<\/title>/, `<title>${pageTitle} | LilyPad ERP</title>`);

    const sidebarTemplate = `
			<!-- Sidenav Menu -->
			<div class="sidebar-inner" data-simplebar>
				<div id="sidebar-menu" class="sidebar-menu">
					<ul>
						<li class="menu-title"><span>Main Operations</span></li>
						<li>
							<ul>
								<li>
									<a href="dashboard.html" class="${activeKey === 'dashboard' ? 'active' : ''}">
										<i class="ti ti-dashboard"></i><span>Main Dashboard</span>
									</a>
								</li>
								<li>
									<a href="tickets.html" class="${activeKey === 'tickets' ? 'active' : ''}">
										<i class="ti ti-ticket"></i><span>Ticket Operations</span>
									</a>
								</li>
								<li>
									<a href="knowledge-base.html" class="${activeKey === 'kb' ? 'active' : ''}">
										<i class="ti ti-book"></i><span>Knowledge Base & SOPs</span>
									</a>
								</li>
							</ul>
						</li>

						<li class="menu-title"><span>Administration & Setup</span></li>
						<li>
							<ul>
								<li class="submenu">
									<a href="javascript:void(0);" class="subdrop active">
										<i class="ti ti-settings-2"></i><span>Operations Admin</span><span class="menu-arrow"></span>
									</a>
									<ul style="display: block;">
										<li><a href="admin-email.html" class="${activeKey === 'email' ? 'active' : ''}"><i class="ti ti-mail-cog me-2 text-primary"></i>Inbound Email & Anti-Spam</a></li>
										<li><a href="admin-team.html" class="${activeKey === 'team' ? 'active' : ''}"><i class="ti ti-users me-2 text-primary"></i>Team & User Permissions</a></li>
										<li><a href="admin-forms.html" class="${activeKey === 'forms' ? 'active' : ''}"><i class="ti ti-forms me-2 text-primary"></i>Dynamic Form Builder</a></li>
									</ul>
								</li>
							</ul>
						</li>

						<li class="menu-title"><span>Account</span></li>
						<li>
							<ul>
								<li>
									<a href="login.html" onclick="sessionStorage.removeItem('lilypad_auth_user'); localStorage.removeItem('lilypad_logged_in');">
										<i class="ti ti-logout text-danger"></i><span class="text-danger fw-semibold">Sign Out</span>
									</a>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
    `;

    // Replace sidebar-inner in header
    const sidebarStart = header.indexOf('<!-- Sidenav Menu -->');
    const sidebarEnd = header.indexOf('<!-- Sidenav Menu End -->');
    if (sidebarStart !== -1 && sidebarEnd !== -1) {
        header = header.substring(0, sidebarStart) + sidebarTemplate + '\n\t\t</div>\n\t\t' + header.substring(sidebarEnd);
    }
    return header;
}

const footerScripts = indexHtml.substring(indexHtml.indexOf(footerStartMarker));

// ==========================================
// 1. ADMIN EMAIL & ANTI-SPAM PAGE (admin-email.html)
// ==========================================
const emailPageContent = `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span>Inbound Email & Anti-Spam Gateway</span>
							<span class="badge bg-soft-success text-success fs-12 rounded-pill fw-semibold"><i class="ti ti-shield-check"></i> Shield Active</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Automated ticket creation from email, SPF/DKIM verification, category routing, and quarantine management.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<a href="tickets.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> Ticket Operations
						</a>
						<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onclick="bootstrap.Tab.getOrCreateInstance(document.querySelector('#emailTabs button[data-bs-target=\\'#tabSimulator\\']')).show()">
							<i class="ti ti-flask me-1"></i> Launch Simulator
						</button>
					</div>
				</div>

				<!-- Email Gateway Metrics -->
				<div class="row g-3 mb-4">
					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Primary Help Desk Address</span>
									<h5 class="fw-bold mb-0 mt-1 text-primary">support@froggysfog.com</h5>
									<span class="fs-11 text-muted">All incoming emails parsed & routed</span>
								</div>
								<div class="rounded-3 p-2 text-white bg-primary d-flex align-items-center justify-content-center shadow-sm" style="width:44px; height:44px;">
									<i class="ti ti-mail fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Security Bot Shield</span>
									<h5 class="fw-bold mb-0 mt-1 text-primary">5 Active Protection Rules</h5>
									<span class="fs-11 text-success"><i class="ti ti-shield-check me-1"></i>SPF / DKIM / Anti-Loop Enabled</span>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-primary" style="width:44px; height:44px;">
									<i class="ti ti-shield-lock fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Active Department Aliases</span>
									<h5 class="fw-bold mb-0 mt-1 text-dark">4 Dedicated Mailboxes</h5>
									<span class="fs-11 text-muted">Auto-categorization & priority</span>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-dark" style="width:44px; height:44px;">
									<i class="ti ti-arrows-split fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Spam Quarantine</span>
									<h5 class="fw-bold mb-0 mt-1 text-danger" id="quarantineCountDisplay">0 Intercepted</h5>
									<span class="fs-11 text-muted">Clean inbox threshold: 3/hr</span>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-danger" style="width:44px; height:44px;">
									<i class="ti ti-ban fs-22"></i>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Main Navigation Tabs -->
				<div class="card border-0 shadow-sm rounded-3 mb-4">
					<div class="card-header bg-transparent border-bottom py-3">
						<ul class="nav nav-pills gap-2" id="emailTabs">
							<li class="nav-item">
								<button class="nav-link active py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabRouting">
									<i class="ti ti-mail me-1"></i> 1. Mailbox & Category Routing
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabShield">
									<i class="ti ti-shield-lock me-1"></i> 2. Anti-Spam & Bot Protection
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill text-danger" data-bs-toggle="tab" data-bs-target="#tabQuarantine">
									<i class="ti ti-ban me-1"></i> 3. Spam Quarantine Queue (<span id="quarantineBadge">0</span>)
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill text-success" data-bs-toggle="tab" data-bs-target="#tabSimulator">
									<i class="ti ti-flask me-1"></i> 4. Live Inbound Simulator
								</button>
							</li>
						</ul>
					</div>

					<div class="card-body p-4">
						<div class="tab-content">
							<!-- Tab 1: Routing -->
							<div class="tab-pane fade show active" id="tabRouting">
								<div class="card border bg-light rounded-3 p-3 mb-4">
									<div class="row g-3 align-items-center">
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Primary Inbound Help Desk Address</label>
											<div class="input-group input-group-sm">
												<span class="input-group-text bg-white"><i class="ti ti-mail"></i></span>
												<input type="text" class="form-control fw-bold text-dark" value="support@froggysfog.com" readonly>
												<button class="btn btn-outline-secondary" onclick="navigator.clipboard.writeText('support@froggysfog.com'); alert('Copied support@froggysfog.com to clipboard!')">Copy</button>
											</div>
											<span class="fs-11 text-muted">All emails sent here are parsed, anti-spam verified, and converted to tickets.</span>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Ingestion Mode</label>
											<select class="form-select form-select-sm">
												<option value="webhook" selected>Instant Cloud Webhook (SendGrid / Postmark / AWS SES / Mailgun)</option>
												<option value="imap">Direct IMAP / Exchange Polling (Every 60s)</option>
											</select>
											<span class="fs-11 text-muted">Webhook Endpoint: <code>https://lilypad-erp-dev.onrender.com/api/email-webhook</code></span>
										</div>
									</div>
								</div>

								<div class="d-flex align-items-center justify-content-between mb-3">
									<h6 class="fw-bold fs-14 text-dark mb-0 d-flex align-items-center gap-1">
										<i class="ti ti-arrows-split text-primary"></i> Category Direct Routing Aliases
									</h6>
									<button class="btn btn-sm btn-outline-primary" onclick="alert('Alias added to routing registry!')">
										<i class="ti ti-plus me-1"></i> Add Department Alias
									</button>
								</div>

								<div class="table-responsive">
									<table class="table table-hover align-middle mb-0 fs-13 border rounded-3">
										<thead class="table-light">
											<tr>
												<th>Incoming Email Alias</th>
												<th>Target Category</th>
												<th>Default Priority</th>
												<th>Linked Machine / Model</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td><code>fx-support@froggysfog.com</code></td>
												<td><span class="badge bg-soft-primary text-primary">FX Machine Support</span></td>
												<td><span class="badge bg-danger-subtle text-danger">High</span></td>
												<td><strong>Antari 2000 Elite</strong></td>
												<td><span class="badge bg-success-subtle text-success">Active</span></td>
											</tr>
											<tr>
												<td><code>fluid-finder@froggysfog.com</code></td>
												<td><span class="badge bg-soft-primary text-primary">Fluid Finder Update</span></td>
												<td><span class="badge bg-info-subtle text-info">Normal</span></td>
												<td><strong>All Fog / Haze Formulas</strong></td>
												<td><span class="badge bg-success-subtle text-success">Active</span></td>
											</tr>
											<tr>
												<td><code>po@froggysfog.com</code></td>
												<td><span class="badge bg-soft-primary text-primary">Vendor Purchase Order</span></td>
												<td><span class="badge bg-danger-subtle text-danger">High</span></td>
												<td><strong>Tooling & Dielines</strong></td>
												<td><span class="badge bg-success-subtle text-success">Active</span></td>
											</tr>
											<tr>
												<td><code>it-help@froggysfog.com</code></td>
												<td><span class="badge bg-soft-primary text-primary">Computer/Laptop Issue</span></td>
												<td><span class="badge bg-info-subtle text-info">Normal</span></td>
												<td><strong>IT Hardware</strong></td>
												<td><span class="badge bg-success-subtle text-success">Active</span></td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							<!-- Tab 2: Anti-Spam Shield -->
							<div class="tab-pane fade" id="tabShield">
								<div class="row g-3">
									<div class="col-md-6">
										<div class="card border rounded-3 p-3 h-100">
											<h6 class="fw-bold fs-13 text-dark mb-3 d-flex align-items-center gap-2">
												<i class="ti ti-shield-check text-success fs-16"></i> Active Anti-Spam Protection Rules
											</h6>
											
											<div class="form-check form-switch mb-3">
												<input class="form-check-input" type="checkbox" id="chkLoopBlock" checked>
												<label class="form-check-label fs-13 fw-semibold text-dark" for="chkLoopBlock">
													1. Block Infinite Mail Loops & Auto-Responders
												</label>
												<span class="d-block fs-11 text-muted">Drops <code>Auto-Submitted: auto-generated</code>, <code>X-Autoreply</code>, and <code>mailer-daemon</code> bounces.</span>
											</div>

											<div class="form-check form-switch mb-3">
												<input class="form-check-input" type="checkbox" id="chkSpfDkim" checked>
												<label class="form-check-label fs-13 fw-semibold text-dark" for="chkSpfDkim">
													2. SPF / DKIM / DMARC Cryptographic Verification
												</label>
												<span class="d-block fs-11 text-muted">Rejects spoofed sender domains and unauthenticated SMTP relays.</span>
											</div>

											<div class="form-check form-switch mb-3">
												<input class="form-check-input" type="checkbox" id="chkRateLimit" checked>
												<label class="form-check-label fs-13 fw-semibold text-dark" for="chkRateLimit">
													3. Rate Limiting & Anti-Flooding Threshold
												</label>
												<span class="d-block fs-11 text-muted">Maximum 3 tickets per email address per hour. Excess emails routed to quarantine.</span>
											</div>

											<div class="form-check form-switch mb-3">
												<input class="form-check-input" type="checkbox" id="chkAiSpam" checked>
												<label class="form-check-label fs-13 fw-semibold text-dark" for="chkAiSpam">
													4. AI & Heuristic Content Scanner
												</label>
												<span class="d-block fs-11 text-muted">Scans for SEO spam keywords, phishing URLs, empty payloads, and suspicious links.</span>
											</div>

											<div class="form-check form-switch">
												<input class="form-check-input" type="checkbox" id="chkFirstTimeChallenge" checked>
												<label class="form-check-label fs-13 fw-semibold text-dark" for="chkFirstTimeChallenge">
													5. First-Time Sender 1-Click Verification Challenge
												</label>
												<span class="d-block fs-11 text-muted">Sends a quick 1-click confirmation email to new senders to block crawlers and web scrapers.</span>
											</div>
										</div>
									</div>

									<div class="col-md-6">
										<div class="card border rounded-3 p-3 h-100">
											<h6 class="fw-bold fs-13 text-dark mb-2 d-flex align-items-center gap-2">
												<i class="ti ti-list-check text-primary fs-16"></i> Trusted Domain Whitelist & Blacklist
											</h6>
											
											<div class="mb-3">
												<label class="form-label fs-12 fw-semibold text-success">Trusted Whitelist (Always bypass challenges)</label>
												<textarea class="form-control form-control-sm" rows="3" readonly style="font-family:monospace; font-size:12px;">@froggysfog.com&#10;@antari.com&#10;@apexprints.com&#10;@packcraft.com&#10;@livenation.com&#10;@lilypad.local</textarea>
											</div>

											<div class="mb-3">
												<label class="form-label fs-12 fw-semibold text-danger">Blacklisted Senders & Domains (Auto-dropped)</label>
												<textarea class="form-control form-control-sm" rows="3" readonly style="font-family:monospace; font-size:12px;">*@marketing-crawler.xyz&#10;*@crypto-leads.ru&#10;*@phish-invoices.net&#10;mailer-daemon@*</textarea>
											</div>

											<button class="btn btn-sm btn-primary w-100" onclick="alert('Anti-Spam security rules saved!')">
												<i class="ti ti-check me-1"></i> Save Anti-Spam Security Rules
											</button>
										</div>
									</div>
								</div>
							</div>

							<!-- Tab 3: Quarantine -->
							<div class="tab-pane fade" id="tabQuarantine">
								<div class="alert alert-danger border-0 rounded-3 d-flex align-items-center justify-content-between mb-3 py-2 px-3 fs-13">
									<div class="d-flex align-items-center gap-2">
										<i class="ti ti-shield-x fs-20 text-danger"></i>
										<span>These incoming messages were intercepted by the Anti-Spam Shield and held securely for review.</span>
									</div>
									<button class="btn btn-sm btn-outline-danger py-1" onclick="clearQuarantine()"><i class="ti ti-trash"></i> Clear All</button>
								</div>

								<div class="table-responsive">
									<table class="table table-hover align-middle mb-0 fs-13 border rounded-3">
										<thead class="table-light">
											<tr>
												<th>Sender</th>
												<th>Subject & Snippet</th>
												<th>Block Reason</th>
												<th>Time</th>
												<th class="text-end">Action</th>
											</tr>
										</thead>
										<tbody id="quarantineTableBody">
											<tr><td colspan="5" class="text-center py-4 text-muted"><i class="ti ti-shield-check fs-24 d-block mb-1 text-success"></i>Quarantine clean. No spam threats intercepted.</td></tr>
										</tbody>
									</table>
								</div>
							</div>

							<!-- Tab 4: Simulator -->
							<div class="tab-pane fade" id="tabSimulator">
								<div class="row g-3">
									<div class="col-md-6">
										<div class="card border rounded-3 p-3 bg-light">
											<h6 class="fw-bold fs-13 text-dark mb-3 d-flex align-items-center gap-2">
												<i class="ti ti-send text-success"></i> Simulate Incoming Customer / Vendor Email
											</h6>

											<form id="emailSimForm" onsubmit="runEmailSimulation(event)">
												<div class="mb-2">
													<label class="form-label fs-12 fw-semibold">From (Sender Email):</label>
													<input type="email" id="simFromEmail" class="form-control form-control-sm" value="mark.henderson@apexprints.com" required>
												</div>

												<div class="mb-2">
													<label class="form-label fs-12 fw-semibold">To (Inbound Gateway Alias):</label>
													<select id="simToEmail" class="form-select form-select-sm">
														<option value="fx-support@froggysfog.com">fx-support@froggysfog.com (➔ FX Machine Support)</option>
														<option value="fluid-finder@froggysfog.com">fluid-finder@froggysfog.com (➔ Fluid Finder Update)</option>
														<option value="po@froggysfog.com">po@froggysfog.com (➔ Vendor Purchase Order)</option>
														<option value="support@froggysfog.com">support@froggysfog.com (➔ Triage / Customer Support)</option>
													</select>
												</div>

												<div class="mb-2">
													<label class="form-label fs-12 fw-semibold">Subject:</label>
													<input type="text" id="simSubject" class="form-control form-control-sm" value="Antari 2000 Elite Silkscreen Plate Proof Attached" required>
												</div>

												<div class="mb-2">
													<label class="form-label fs-12 fw-semibold">Body Content:</label>
													<textarea id="simBody" class="form-control form-control-sm" rows="3" required>Attached is the updated vector silkscreen plate artwork Rev C.2 for the Antari 2000 Elite front chassis. Please review tolerances.</textarea>
												</div>

												<div class="p-2 border rounded bg-white mb-3 fs-12">
													<strong class="text-dark d-block mb-1">Simulate Attack / Spam Conditions:</strong>
													<div class="form-check">
														<input class="form-check-input" type="checkbox" id="simFlagLoop">
														<label class="form-check-label text-danger" for="simFlagLoop">Inject <code>Auto-Submitted: auto-generated</code> (Mail Loop Test)</label>
													</div>
													<div class="form-check">
														<input class="form-check-input" type="checkbox" id="simFlagFlood">
														<label class="form-check-label text-danger" for="simFlagFlood">Simulate Rapid Bot Flood (>3 emails in 1 hour)</label>
													</div>
													<div class="form-check">
														<input class="form-check-input" type="checkbox" id="simFlagAttach" checked>
														<label class="form-check-label text-success" for="simFlagAttach">Attach Test Artwork Vector Proof (<code>Antari_Plate_Proof_v3.ai</code>, 4.2 MB)</label>
													</div>
												</div>

												<button type="submit" class="btn btn-sm btn-primary w-100 shadow-sm">
													<i class="ti ti-rocket me-1"></i> Send Inbound Email to Gateway
												</button>
											</form>
										</div>
									</div>

									<div class="col-md-6">
										<div class="card border rounded-3 p-3 h-100 bg-dark text-light" style="font-family:monospace; font-size:12px;">
											<h6 class="fw-bold text-white mb-2 d-flex align-items-center justify-content-between">
												<span><i class="ti ti-terminal me-1 text-success"></i> Gateway Security Inspection Log</span>
												<span class="badge bg-success" id="simStatusBadge">IDLE</span>
											</h6>
											<div id="simConsoleLog" class="overflow-y-auto p-2 bg-black rounded" style="height: 340px;">
												<span class="text-muted">[SYSTEM] Inbound SMTP/Webhook Gateway Ready on port 8118...</span><br>
												<span class="text-muted">[ANTI-SPAM] SPF/DKIM filter active. Rate limiter: 3/hr. Bot deflector active.</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
`;

const emailPageScripts = `
	<script>
        let QUARANTINE_QUEUE = [];

        function renderQuarantineTable() {
            const tbody = document.getElementById('quarantineTableBody');
            const badge = document.getElementById('quarantineBadge');
            const display = document.getElementById('quarantineCountDisplay');
            if (badge) badge.textContent = QUARANTINE_QUEUE.length;
            if (display) display.textContent = QUARANTINE_QUEUE.length + ' Intercepted';
            if (!tbody) return;

            if (!QUARANTINE_QUEUE.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted"><i class="ti ti-shield-check fs-24 d-block mb-1 text-success"></i>Quarantine clean. No spam threats intercepted.</td></tr>';
                return;
            }

            tbody.innerHTML = QUARANTINE_QUEUE.map(q => \`
                <tr>
                    <td><strong class="text-dark">\${q.sender}</strong></td>
                    <td>
                        <strong class="d-block text-dark fs-12">\${q.subject}</strong>
                        <span class="text-muted fs-11 text-truncate d-block" style="max-width: 280px;">\${q.snippet}</span>
                    </td>
                    <td><span class="badge bg-danger-subtle text-danger fs-11">\${q.reason}</span></td>
                    <td><span class="text-muted fs-11">\${q.time}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-success py-0 px-2 fs-11" onclick="releaseQuarantinedEmail('\${q.id}')">Release</button>
                        <button class="btn btn-sm btn-link text-danger p-0 ms-1" onclick="deleteQuarantine('\${q.id}')"><i class="ti ti-trash"></i></button>
                    </td>
                </tr>
            \`).join('');
        }

        function releaseQuarantinedEmail(id) {
            QUARANTINE_QUEUE = QUARANTINE_QUEUE.filter(q => q.id !== id);
            renderQuarantineTable();
            alert('Email released from quarantine and routed to active queue.');
        }

        function deleteQuarantine(id) {
            QUARANTINE_QUEUE = QUARANTINE_QUEUE.filter(q => q.id !== id);
            renderQuarantineTable();
        }

        function clearQuarantine() {
            QUARANTINE_QUEUE = [];
            renderQuarantineTable();
        }

        function runEmailSimulation(e) {
            e.preventDefault();
            const fromEmail = document.getElementById('simFromEmail').value;
            const toEmail = document.getElementById('simToEmail').value;
            const subject = document.getElementById('simSubject').value;
            const body = document.getElementById('simBody').value;
            const isLoop = document.getElementById('simFlagLoop').checked;
            const isFlood = document.getElementById('simFlagFlood').checked;

            const consoleEl = document.getElementById('simConsoleLog');
            const statusBadge = document.getElementById('simStatusBadge');

            consoleEl.innerHTML = '';
            statusBadge.className = 'badge bg-warning';
            statusBadge.textContent = 'INSPECTING';

            function logLine(text, color = '#ffffff') {
                const p = document.createElement('div');
                p.style.color = color;
                p.textContent = text;
                consoleEl.appendChild(p);
                consoleEl.scrollTop = consoleEl.scrollHeight;
            }

            logLine('[GATEWAY] Incoming SMTP Envelope received from: ' + fromEmail, '#38bdf8');
            logLine('[GATEWAY] Recipient alias: ' + toEmail, '#38bdf8');

            setTimeout(() => {
                if (isLoop) {
                    logLine('[SECURITY BLOCK] Infinite mail loop header detected (Auto-Submitted: auto-generated)! Dropped.', '#f87171');
                    statusBadge.className = 'badge bg-danger';
                    statusBadge.textContent = 'BLOCKED (MAIL LOOP)';
                    QUARANTINE_QUEUE.unshift({
                        id: 'q_' + Date.now(),
                        sender: fromEmail,
                        subject,
                        snippet: body,
                        reason: 'Auto-Submitted: auto-generated (Mail Loop)',
                        time: 'Just now'
                    });
                    renderQuarantineTable();
                    return;
                }
                logLine('  ✓ Layer 1 (Mail Loop & Auto-Reply Filter): PASSED', '#4ade80');
                logLine('  ✓ Layer 2 (SPF/DKIM Cryptographic Check): PASSED (Domain verified)', '#4ade80');

                if (isFlood) {
                    logLine('[SECURITY BLOCK] Rate limit exceeded (>3 emails/hr from ' + fromEmail + ')! Quarantined.', '#f87171');
                    statusBadge.className = 'badge bg-danger';
                    statusBadge.textContent = 'BLOCKED (FLOOD)';
                    QUARANTINE_QUEUE.unshift({
                        id: 'q_' + Date.now(),
                        sender: fromEmail,
                        subject,
                        snippet: body,
                        reason: 'Rate Limit Exceeded (>3 emails/hr)',
                        time: 'Just now'
                    });
                    renderQuarantineTable();
                    return;
                }
                logLine('  ✓ Layer 3 (Rate Limiting Threshold): PASSED (1/3 per hr)', '#4ade80');
                logLine('  ✓ Layer 4 (AI Content & Malware Scan): PASSED (Clean payload)', '#4ade80');

                logLine('[SUCCESS] Payload authenticated. Operational ticket created & notified!', '#4ade80');
                statusBadge.className = 'badge bg-success';
                statusBadge.textContent = 'PROCESSED (OK)';
            }, 500);
        }
	</script>
`;

const finalEmailHtml = getHeaderForPage('email', 'Inbound Email Gateway') + emailPageContent + footerScripts.replace('</body>', emailPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/admin-email.html'), finalEmailHtml, 'utf8');

// ==========================================
// 2. ADMIN TEAM & PERMISSIONS PAGE (admin-team.html)
// ==========================================
const teamPageContent = `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span>Team & User Permissions</span>
							<span class="badge bg-soft-primary text-primary fs-12 rounded-pill fw-semibold"><i class="ti ti-users"></i> Staff Directory</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Manage operational users, assign department roles, and control access permissions across LilyPad ERP.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<a href="tickets.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> View Tickets
						</a>
						<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onclick="bootstrap.Tab.getOrCreateInstance(document.querySelector('#teamTabs button[data-bs-target=\\'#tabAdd\\']')).show()">
							<i class="ti ti-user-plus me-1"></i> Add Team Member
						</button>
					</div>
				</div>

				<!-- Team Metrics -->
				<div class="row g-3 mb-4">
					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Total Active Users</span>
									<h3 class="fw-bold mb-0 mt-1 text-primary" id="teamCountTotal">5</h3>
								</div>
								<div class="rounded-3 p-2 text-white bg-primary d-flex align-items-center justify-content-center shadow-sm" style="width:44px; height:44px;">
									<i class="ti ti-users fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Operations Admins</span>
									<h3 class="fw-bold mb-0 mt-1 text-primary">1</h3>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-primary" style="width:44px; height:44px;">
									<i class="ti ti-shield-lock fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Support Leads & Agents</span>
									<h3 class="fw-bold mb-0 mt-1 text-dark">4</h3>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-dark" style="width:44px; height:44px;">
									<i class="ti ti-headset fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Departments</span>
									<h3 class="fw-bold mb-0 mt-1 text-secondary">5 Active</h3>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-secondary" style="width:44px; height:44px;">
									<i class="ti ti-building fs-22"></i>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Team Directory & Form -->
				<div class="card border-0 shadow-sm rounded-3 mb-4">
					<div class="card-header bg-transparent border-bottom py-3">
						<ul class="nav nav-pills gap-2" id="teamTabs">
							<li class="nav-item">
								<button class="nav-link active py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabDirectory">
									<i class="ti ti-users me-1"></i> Active Team Members
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill text-primary" data-bs-toggle="tab" data-bs-target="#tabAdd">
									<i class="ti ti-user-plus me-1"></i> Add New User
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabRoles">
									<i class="ti ti-key me-1"></i> Role Permissions Matrix
								</button>
							</li>
						</ul>
					</div>

					<div class="card-body p-4">
						<div class="tab-content">
							<!-- Tab 1: Directory -->
							<div class="tab-pane fade show active" id="tabDirectory">
								<div class="table-responsive">
									<table class="table table-hover align-middle mb-0 fs-13 border rounded-3">
										<thead class="table-light">
											<tr>
												<th>Team Member</th>
												<th>Role</th>
												<th>Department</th>
												<th>Status</th>
												<th class="text-end">Actions</th>
											</tr>
										</thead>
										<tbody id="adminTeamTableBody">
											<!-- Rendered Dynamically -->
										</tbody>
									</table>
								</div>
							</div>

							<!-- Tab 2: Add User -->
							<div class="tab-pane fade" id="tabAdd">
								<form id="teamAddUserForm" onsubmit="saveTeamUser(event)">
									<div class="row g-3">
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Full Name <span class="text-danger">*</span></label>
											<input type="text" id="tNewFullName" class="form-control" placeholder="e.g. Jordan Hayes" required>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Email Address <span class="text-danger">*</span></label>
											<input type="email" id="tNewEmail" class="form-control" placeholder="jordan@froggysfog.com" required>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Username <span class="text-danger">*</span></label>
											<input type="text" id="tNewUsername" class="form-control" placeholder="jhayes" required>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Temporary Password <span class="text-danger">*</span></label>
											<input type="password" id="tNewPassword" class="form-control" placeholder="••••••••" value="Password123!" required>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Role <span class="text-danger">*</span></label>
											<select id="tNewRole" class="form-select">
												<option value="Admin">Admin</option>
												<option value="Support Lead">Support Lead</option>
												<option value="Agent" selected>Agent</option>
												<option value="Viewer">Viewer</option>
											</select>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Department <span class="text-danger">*</span></label>
											<select id="tNewDepartment" class="form-select">
												<option value="Engineering">Engineering</option>
												<option value="Operations" selected>Operations</option>
												<option value="Customer Support">Customer Support</option>
												<option value="Finance">Finance</option>
												<option value="Sales & Marketing">Sales & Marketing</option>
											</select>
										</div>
									</div>
									<div class="text-end mt-4 pt-3 border-top">
										<button type="submit" class="btn btn-primary px-4 shadow-sm">
											<i class="ti ti-user-plus me-1"></i> Create Team Member
										</button>
									</div>
								</form>
							</div>

							<!-- Tab 3: Permissions Matrix -->
							<div class="tab-pane fade" id="tabRoles">
								<div class="table-responsive">
									<table class="table table-bordered align-middle fs-13">
										<thead class="table-light">
											<tr>
												<th>Permission / Capability</th>
												<th class="text-center">Admin</th>
												<th class="text-center">Support Lead</th>
												<th class="text-center">Agent</th>
												<th class="text-center">Viewer</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>Create, Edit, & Resolve Operational Tickets</td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
											</tr>
											<tr>
												<td>Configure Inbound Email Aliases & Spam Shield</td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
											</tr>
											<tr>
												<td>Build Custom Dynamic Form Categories</td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
											</tr>
											<tr>
												<td>Publish Diagnostic SOPs to Knowledge Base</td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
											</tr>
											<tr>
												<td>Manage Staff User Accounts & Roles</td>
												<td class="text-center text-success"><i class="ti ti-check fs-18"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
												<td class="text-center text-muted"><i class="ti ti-minus"></i></td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
`;

const teamPageScripts = `
	<script>
        let TEAM_USERS = [
            { id: 'u1', fullname: 'Scott Karan', username: 'skaran', email: 'scott@froggysfog.com', role: 'Admin', department: 'Operations', initials: 'SK', active: true },
            { id: 'u2', fullname: 'Alex Morgan', username: 'amorgan', email: 'alex@froggysfog.com', role: 'Support Lead', department: 'Customer Support', initials: 'AM', active: true },
            { id: 'u3', fullname: 'David Miller', username: 'dmiller', email: 'david@froggysfog.com', role: 'Agent', department: 'Engineering', initials: 'DM', active: true },
            { id: 'u4', fullname: 'Sarah Connor', username: 'sconnor', email: 'sarah@froggysfog.com', role: 'Agent', department: 'Engineering', initials: 'SC', active: true },
            { id: 'u5', fullname: 'Mark Henderson', username: 'mhenderson', email: 'mark@froggysfog.com', role: 'Packaging Lead', department: 'Operations', initials: 'MH', active: true }
        ];

        function renderTeamTable() {
            const tbody = document.getElementById('adminTeamTableBody');
            const countDisplay = document.getElementById('teamCountTotal');
            if (countDisplay) countDisplay.textContent = TEAM_USERS.length;
            if (!tbody) return;
            tbody.innerHTML = TEAM_USERS.map(u => \`
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="rounded-circle text-white bg-primary d-flex align-items-center justify-content-center fw-bold fs-11 shadow-sm" style="width: 34px; height: 34px;">
                                \${u.initials}
                            </div>
                            <div>
                                <a href="admin-user-detail.html?id=\${u.id}" class="d-block text-dark fw-bold text-decoration-none">\${u.fullname}</a>
                                <span class="text-muted fs-11">\${u.email}</span>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge \${u.role === 'Admin' ? 'bg-dark' : (u.role === 'Support Lead' ? 'bg-primary' : 'bg-secondary')} fs-11">\${u.role}</span></td>
                    <td><span class="text-dark fw-medium">\${u.department}</span></td>
                    <td><span class="badge bg-success-subtle text-success fs-11"><i class="ti ti-point-filled"></i> Active</span></td>
                    <td class="text-end">
                        <a href="admin-user-detail.html?id=\${u.id}" class="btn btn-sm btn-outline-primary py-1 px-2 fs-12 me-1 shadow-sm">
                            <i class="ti ti-edit me-1"></i>Edit
                        </a>
                        <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteTeamUser('\${u.id}')"><i class="ti ti-trash"></i></button>
                    </td>
                </tr>
            \`).join('');
        }

        function saveTeamUser(e) {
            e.preventDefault();
            const fullname = document.getElementById('tNewFullName').value.trim();
            const email = document.getElementById('tNewEmail').value.trim();
            const username = document.getElementById('tNewUsername').value.trim();
            const role = document.getElementById('tNewRole').value;
            const department = document.getElementById('tNewDepartment').value;
            if (!fullname || !email) return;

            const initials = fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FF';
            const newUser = { id: 'u' + (TEAM_USERS.length + 1), fullname, username, email, role, department, initials, active: true };
            TEAM_USERS.push(newUser);
            renderTeamTable();
            document.getElementById('teamAddUserForm').reset();
            const tabBtn = document.querySelector('#teamTabs button[data-bs-target="#tabDirectory"]');
            if (tabBtn) bootstrap.Tab.getOrCreateInstance(tabBtn).show();
            alert('New team member ' + fullname + ' (' + role + ') added successfully!');
        }

        function deleteTeamUser(id) {
            if (confirm('Are you sure you want to remove this team member?')) {
                TEAM_USERS = TEAM_USERS.filter(u => u.id !== id);
                renderTeamTable();
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderTeamTable();
        });
	</script>
`;

const finalTeamHtml = getHeaderForPage('team', 'Team & Permissions') + teamPageContent + footerScripts.replace('</body>', teamPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/admin-team.html'), finalTeamHtml, 'utf8');

// ==========================================
// 2B. ADMIN USER DETAIL & ACTIVITY ANALYTICS PAGE (admin-user-detail.html)
// ==========================================
const userDetailPageContent = `
				<!-- Page Header / Breadcrumbs -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<div class="d-flex align-items-center gap-2 mb-1">
							<a href="admin-team.html" class="text-muted fs-13 text-decoration-none">&larr; Back to Staff Directory</a>
						</div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span id="uHeaderName">Scott Karan</span>
							<span class="badge bg-soft-primary text-primary fs-12 rounded-pill fw-semibold" id="uHeaderRole">Operations Admin</span>
							<span class="badge bg-soft-success text-success fs-12 rounded-pill fw-semibold" id="uHeaderStatus"><i class="ti ti-point-filled"></i> Active</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Member profile, activity history audit trail, and operational ticket resolution performance.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<div class="dropdown">
							<button class="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill px-3" type="button" data-bs-toggle="dropdown">
								<i class="ti ti-switch-horizontal me-1"></i> Switch Team Member
							</button>
							<ul class="dropdown-menu dropdown-menu-end shadow-sm fs-13" id="memberSwitchDropdown">
								<!-- Dynamically Populated -->
							</ul>
						</div>
						<a href="tickets.html" class="btn btn-outline-success btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> View Tickets
						</a>
					</div>
				</div>

				<!-- User Profile Identity Banner Card -->
				<div class="card border-0 shadow-sm rounded-3 p-4 mb-4">
					<div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
						<div class="d-flex align-items-center gap-3">
							<div class="rounded-circle text-white bg-primary d-flex align-items-center justify-content-center fw-bold fs-22 shadow" id="uProfileAvatar" style="width: 68px; height: 68px;">
								SK
							</div>
							<div>
								<h4 class="fw-bold mb-1 text-dark" id="uProfileFullName">Scott Karan</h4>
								<div class="d-flex align-items-center gap-3 fs-13 text-muted flex-wrap">
									<span><i class="ti ti-mail me-1 text-primary"></i> <strong class="text-dark" id="uProfileEmail">scott@froggysfog.com</strong></span>
									<span><i class="ti ti-user me-1"></i> @<span id="uProfileUsername">skaran</span></span>
									<span><i class="ti ti-building me-1"></i> <span id="uProfileDepartment">Operations</span></span>
									<span><i class="ti ti-phone me-1"></i> <span id="uProfilePhone">(615) 555-0142</span></span>
									<span><i class="ti ti-calendar me-1"></i> Joined <span id="uProfileJoined">Jan 2024</span></span>
								</div>
							</div>
						</div>

						<div class="d-flex align-items-center gap-2">
							<button type="button" class="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" onclick="bootstrap.Tab.getOrCreateInstance(document.querySelector('#userDetailTabs button[data-bs-target=\'#tabEditProfile\']')).show()">
								<i class="ti ti-edit me-1"></i> Edit Profile & Role
							</button>
						</div>
					</div>
				</div>

				<!-- Timeframe Filter Bar -->
				<div class="card border-0 shadow-sm rounded-3 mb-4">
					<div class="card-body py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
						<div class="d-flex align-items-center gap-2">
							<i class="ti ti-calendar-stats fs-18 text-primary"></i>
							<strong class="text-dark fs-13">Performance Timeframe:</strong>
						</div>
						<div class="btn-group btn-group-sm rounded-pill" role="group" id="timeframeButtonGroup">
							<button type="button" class="btn btn-outline-secondary px-3" onclick="setTimeframe('today', this)">Today</button>
							<button type="button" class="btn btn-outline-secondary px-3" onclick="setTimeframe('week', this)">This Week</button>
							<button type="button" class="btn btn-primary active px-3" onclick="setTimeframe('month', this)">This Month</button>
							<button type="button" class="btn btn-outline-secondary px-3" onclick="setTimeframe('quarter', this)">This Quarter</button>
							<button type="button" class="btn btn-outline-secondary px-3" onclick="setTimeframe('all', this)">All Time</button>
						</div>
					</div>
				</div>

				<!-- Live Performance Stats (Filtered Dynamically) -->
				<div class="row g-3 mb-4">
					<div class="col-xl-2 col-md-4 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
							<span class="fs-11 text-muted text-uppercase fw-bold">Open Tickets</span>
							<h3 class="fw-bold mb-1 mt-1 text-dark" id="statOpen">0</h3>
							<span class="fs-11 text-muted">Awaiting Action</span>
						</div>
					</div>

					<div class="col-xl-2 col-md-4 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
							<span class="fs-11 text-muted text-uppercase fw-bold">In Progress</span>
							<h3 class="fw-bold mb-1 mt-1 text-primary" id="statInProgress">0</h3>
							<span class="fs-11 text-primary"><i class="ti ti-loader me-1"></i>Active Work</span>
						</div>
					</div>

					<div class="col-xl-2 col-md-4 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
							<span class="fs-11 text-muted text-uppercase fw-bold">Completed</span>
							<h3 class="fw-bold mb-1 mt-1 text-success" id="statCompleted">0</h3>
							<span class="fs-11 text-success"><i class="ti ti-circle-check me-1"></i>Resolved</span>
						</div>
					</div>

					<div class="col-xl-2 col-md-4 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
							<span class="fs-11 text-muted text-uppercase fw-bold">Urgent & High</span>
							<h3 class="fw-bold mb-1 mt-1 text-danger" id="statUrgentHigh">0</h3>
							<span class="fs-11 text-danger"><i class="ti ti-alert-circle me-1"></i>Priority</span>
						</div>
					</div>

					<div class="col-xl-2 col-md-4 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
							<span class="fs-11 text-muted text-uppercase fw-bold">Avg Resolution</span>
							<h3 class="fw-bold mb-1 mt-1 text-dark" id="statAvgResolution">0.0 hrs</h3>
							<span class="fs-11 text-muted"><i class="ti ti-clock me-1"></i>Turnaround</span>
						</div>
					</div>

					<div class="col-xl-2 col-md-4 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
							<span class="fs-11 text-muted text-uppercase fw-bold">SLA Compliance</span>
							<h3 class="fw-bold mb-1 mt-1 text-success" id="statSla">100%</h3>
							<span class="fs-11 text-success"><i class="ti ti-shield-check me-1"></i>On-Time</span>
						</div>
					</div>
				</div>

				<!-- Main Navigation Tabs: Activity, Edit Profile, Assigned Tickets -->
				<div class="card border-0 shadow-sm rounded-3 mb-4">
					<div class="card-header bg-transparent border-bottom py-3">
						<ul class="nav nav-pills gap-2" id="userDetailTabs">
							<li class="nav-item">
								<button class="nav-link active py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabActivity">
									<i class="ti ti-history me-1"></i> 1. Activity History & Audit Trail
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabAssignedTickets">
									<i class="ti ti-ticket me-1"></i> 2. Assigned Tickets (<span id="assignedTicketsCountBadge">0</span>)
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill text-primary" data-bs-toggle="tab" data-bs-target="#tabEditProfile">
									<i class="ti ti-user-edit me-1"></i> 3. Edit Profile & Permissions
								</button>
							</li>
						</ul>
					</div>

					<div class="card-body p-4">
						<div class="tab-content">
							<!-- Tab 1: Activity History -->
							<div class="tab-pane fade show active" id="tabActivity">
								<div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
									<h6 class="fw-bold fs-14 text-dark mb-0 d-flex align-items-center gap-1">
										<i class="ti ti-list-details text-primary"></i> Chronological Activity Log
									</h6>
									<div class="btn-group btn-group-sm">
										<button class="btn btn-outline-secondary active fs-12" onclick="filterActivity('all', this)">All Activity</button>
										<button class="btn btn-outline-secondary fs-12" onclick="filterActivity('status', this)">Status Updates</button>
										<button class="btn btn-outline-secondary fs-12" onclick="filterActivity('note', this)">Notes & Replies</button>
										<button class="btn btn-outline-secondary fs-12" onclick="filterActivity('sop', this)">SOP & Admin</button>
									</div>
								</div>

								<div class="position-relative ps-4" id="userActivityTimeline">
									<!-- Dynamically Rendered Timeline -->
								</div>
							</div>

							<!-- Tab 2: Assigned Tickets -->
							<div class="tab-pane fade" id="tabAssignedTickets">
								<div class="table-responsive">
									<table class="table table-hover align-middle mb-0 fs-13 border rounded-3">
										<thead class="table-light">
											<tr>
												<th>Ticket #</th>
												<th>Subject</th>
												<th>Category</th>
												<th>Priority</th>
												<th>Status</th>
												<th>Last Updated</th>
												<th class="text-end">Action</th>
											</tr>
										</thead>
										<tbody id="userAssignedTicketsTableBody">
											<!-- Dynamically Rendered Assigned Tickets -->
										</tbody>
									</table>
								</div>
							</div>

							<!-- Tab 3: Edit Profile Form -->
							<div class="tab-pane fade" id="tabEditProfile">
								<form id="editUserProfileForm" onsubmit="saveUserProfileEdits(event)">
									<div class="row g-3">
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Full Name <span class="text-danger">*</span></label>
											<input type="text" id="editFullName" class="form-control" required>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Email Address <span class="text-danger">*</span></label>
											<input type="email" id="editEmail" class="form-control" required>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Username <span class="text-danger">*</span></label>
											<input type="text" id="editUsername" class="form-control" required>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Direct Phone / Extension</label>
											<input type="text" id="editPhone" class="form-control" placeholder="(615) 555-0100">
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Role & Access Level <span class="text-danger">*</span></label>
											<select id="editRole" class="form-select">
												<option value="Admin">Admin (Full System Access)</option>
												<option value="Support Lead">Support Lead (Manage Queues & SOPs)</option>
												<option value="Agent">Agent (Ticket Resolution)</option>
												<option value="Viewer">Viewer (Read-Only)</option>
											</select>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Department <span class="text-danger">*</span></label>
											<select id="editDepartment" class="form-select">
												<option value="Operations">Operations</option>
												<option value="Engineering">Engineering</option>
												<option value="Customer Support">Customer Support</option>
												<option value="Finance">Finance</option>
												<option value="Sales & Marketing">Sales & Marketing</option>
											</select>
										</div>
										<div class="col-12">
											<hr class="my-3">
											<h6 class="fw-bold fs-13 text-dark mb-2">Notification & Security Preferences</h6>
											<div class="d-flex flex-column gap-2">
												<div class="form-check form-switch">
													<input class="form-check-input" type="checkbox" id="chkNotifAssign" checked>
													<label class="form-check-label fs-13 text-dark" for="chkNotifAssign">Send immediate email notifications on new ticket assignments</label>
												</div>
												<div class="form-check form-switch">
													<input class="form-check-input" type="checkbox" id="chkNotifSla" checked>
													<label class="form-check-label fs-13 text-dark" for="chkNotifSla">Alert when assigned tickets approach SLA deadline (< 2 hrs remaining)</label>
												</div>
												<div class="form-check form-switch">
													<input class="form-check-input" type="checkbox" id="chkNotifDaily" checked>
													<label class="form-check-label fs-13 text-dark" for="chkNotifDaily">Receive daily operational digest summary</label>
												</div>
											</div>
										</div>
									</div>

									<div class="text-end mt-4 pt-3 border-top d-flex align-items-center justify-content-between">
										<button type="button" class="btn btn-outline-danger btn-sm" onclick="alert('Password reset link sent to ' + document.getElementById('editEmail').value)">
											<i class="ti ti-key me-1"></i> Send Password Reset Link
										</button>
										<button type="submit" class="btn btn-primary px-4 shadow-sm">
											<i class="ti ti-check me-1"></i> Save Changes
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
`;

const userDetailPageScripts = `
	<script>
        const USER_DATABASE = {
            'u1': {
                id: 'u1',
                fullname: 'Scott Karan',
                username: 'skaran',
                email: 'scott@froggysfog.com',
                role: 'Admin',
                department: 'Operations',
                phone: '(615) 555-0142',
                initials: 'SK',
                active: true,
                joinDate: 'Jan 2024',
                stats: {
                    'today': { open: 1, inProgress: 2, completed: 3, low: 0, normal: 2, high: 3, urgent: 1, avgRes: '1.8 hrs', sla: '100%' },
                    'week': { open: 4, inProgress: 5, completed: 14, low: 2, normal: 8, high: 9, urgent: 4, avgRes: '2.4 hrs', sla: '99.1%' },
                    'month': { open: 6, inProgress: 8, completed: 48, low: 6, normal: 24, high: 22, urgent: 10, avgRes: '3.1 hrs', sla: '98.5%' },
                    'quarter': { open: 8, inProgress: 12, completed: 136, low: 18, normal: 68, high: 54, urgent: 24, avgRes: '2.9 hrs', sla: '98.8%' },
                    'all': { open: 8, inProgress: 12, completed: 312, low: 42, normal: 156, high: 104, urgent: 38, avgRes: '3.0 hrs', sla: '99.0%' }
                },
                activities: [
                    { type: 'status', title: 'Moved Ticket to Resolved', desc: 'Resolved #TICK-8092 (Antari 2000 Silkscreen Alignment Offset) after verifying 2-part epoxy bake.', time: '2 hours ago', icon: 'ti-check', color: 'success' },
                    { type: 'note', title: 'Added Technical Note & Proof', desc: 'Uploaded Antari_Plate_Proof_v3.ai to #TICK-8095 (Vendor Purchase Order - Apex Prints).', time: '4 hours ago', icon: 'ti-message-circle', color: 'primary' },
                    { type: 'sop', title: 'Verified Diagnostic Checklist', desc: 'Logged Pre-Flight Diagnostic Checklist verification for SOP-014 on Antari 2000 chassis batch #408.', time: 'Yesterday at 3:45 PM', icon: 'ti-book', color: 'info' },
                    { type: 'sop', title: 'Updated Inbound Anti-Spam Security Rules', desc: 'Enabled first-time sender challenge and updated domain whitelist for @packcraft.com.', time: '2 days ago', icon: 'ti-shield-check', color: 'warning' },
                    { type: 'status', title: 'Logged Operational Repair Time', desc: 'Recorded 2.5 hours diagnostic work on #TICK-8092.', time: '3 days ago', icon: 'ti-clock', color: 'secondary' }
                ],
                tickets: [
                    { id: 'TICK-8092', subject: 'Antari 2000 Silkscreen Front Plate Alignment Proof', category: 'FX Machine Support', priority: 'High', status: 'In Progress', updated: '2 hrs ago' },
                    { id: 'TICK-8095', subject: 'Master Carton Burst Test Flute Spec Revision', category: 'Vendor Purchase Order', priority: 'Urgent', status: 'To-Do', updated: '4 hrs ago' },
                    { id: 'TICK-8088', subject: 'Solar Telemetry Modbus RTU 120-Ohm Termination Resistor', category: 'FX Machine Support', priority: 'Normal', status: 'In Progress', updated: '1 day ago' },
                    { id: 'TICK-8081', subject: 'Fast-Dissipating Fog Fluid Formula Batch SDS', category: 'Fluid Finder Update', priority: 'Low', status: 'Completed', updated: '3 days ago' }
                ]
            },
            'u2': {
                id: 'u2',
                fullname: 'Alex Morgan',
                username: 'amorgan',
                email: 'alex@froggysfog.com',
                role: 'Support Lead',
                department: 'Customer Support',
                phone: '(615) 555-0188',
                initials: 'AM',
                active: true,
                joinDate: 'Mar 2024',
                stats: {
                    'today': { open: 2, inProgress: 1, completed: 4, low: 1, normal: 3, high: 2, urgent: 1, avgRes: '2.1 hrs', sla: '100%' },
                    'week': { open: 5, inProgress: 7, completed: 22, low: 4, normal: 12, high: 11, urgent: 7, avgRes: '2.6 hrs', sla: '97.8%' },
                    'month': { open: 7, inProgress: 9, completed: 64, low: 12, normal: 30, high: 28, urgent: 10, avgRes: '2.8 hrs', sla: '98.2%' },
                    'quarter': { open: 9, inProgress: 14, completed: 180, low: 32, normal: 85, high: 62, urgent: 20, avgRes: '2.7 hrs', sla: '98.4%' },
                    'all': { open: 9, inProgress: 14, completed: 410, low: 70, normal: 190, high: 130, urgent: 39, avgRes: '2.8 hrs', sla: '98.6%' }
                },
                activities: [
                    { type: 'status', title: 'Triage Inbound Support Request', desc: 'Triaged and routed email from Live Nation to FX Machine Support queue.', time: '1 hour ago', icon: 'ti-mail', color: 'primary' },
                    { type: 'note', title: 'Customer Reply Sent', desc: 'Sent SDS sheets and tracking number for order #FF-9021.', time: '3 hours ago', icon: 'ti-send', color: 'info' },
                    { type: 'status', title: 'Resolved Customer Inquiry', desc: 'Closed ticket #TICK-8075 (Fluid consumption rate calculator for stadium gig).', time: 'Yesterday', icon: 'ti-check', color: 'success' }
                ],
                tickets: [
                    { id: 'TICK-8089', subject: 'Customer Inquiry: DMX Fog Controller Latency on 5-Pin Cable', category: 'Customer Support Request', priority: 'High', status: 'In Progress', updated: '1 hr ago' },
                    { id: 'TICK-8076', subject: 'Account Rep Assignment Update for Orlando Venue', category: 'Rep Assignment Change', priority: 'Normal', status: 'To-Do', updated: '5 hrs ago' }
                ]
            },
            'u3': {
                id: 'u3',
                fullname: 'David Miller',
                username: 'dmiller',
                email: 'david@froggysfog.com',
                role: 'Agent',
                department: 'Engineering',
                phone: '(615) 555-0129',
                initials: 'DM',
                active: true,
                joinDate: 'Feb 2024',
                stats: {
                    'today': { open: 1, inProgress: 3, completed: 1, low: 0, normal: 2, high: 2, urgent: 1, avgRes: '3.4 hrs', sla: '95%' },
                    'week': { open: 3, inProgress: 6, completed: 11, low: 1, normal: 7, high: 8, urgent: 4, avgRes: '3.8 hrs', sla: '96.2%' },
                    'month': { open: 5, inProgress: 8, completed: 36, low: 4, normal: 18, high: 20, urgent: 7, avgRes: '3.6 hrs', sla: '97.0%' },
                    'quarter': { open: 6, inProgress: 10, completed: 98, low: 10, normal: 48, high: 40, urgent: 16, avgRes: '3.5 hrs', sla: '97.3%' },
                    'all': { open: 6, inProgress: 10, completed: 215, low: 22, normal: 105, high: 84, urgent: 30, avgRes: '3.5 hrs', sla: '97.5%' }
                },
                activities: [
                    { type: 'sop', title: 'Published SOP-031 Update', desc: 'Updated Cell Balancing Voltage Drift & Lockout Reset guidelines.', time: '5 hours ago', icon: 'ti-book', color: 'info' },
                    { type: 'status', title: 'Assigned Firmware Debug Task', desc: 'Accepted #TICK-8084 (Solar Gateway Firmware v2.1 OTA failure).', time: 'Yesterday', icon: 'ti-check', color: 'success' }
                ],
                tickets: [
                    { id: 'TICK-8084', subject: 'Solar Gateway Firmware v2.1 OTA Update Failure', category: 'FX Machine Support', priority: 'Urgent', status: 'In Progress', updated: '3 hrs ago' }
                ]
            },
            'u4': {
                id: 'u4',
                fullname: 'Sarah Connor',
                username: 'sconnor',
                email: 'sarah@froggysfog.com',
                role: 'Agent',
                department: 'Engineering',
                phone: '(615) 555-0177',
                initials: 'SC',
                active: true,
                joinDate: 'Apr 2024',
                stats: {
                    'today': { open: 0, inProgress: 2, completed: 2, low: 0, normal: 1, high: 2, urgent: 1, avgRes: '2.0 hrs', sla: '100%' },
                    'week': { open: 2, inProgress: 4, completed: 15, low: 2, normal: 8, high: 7, urgent: 4, avgRes: '2.5 hrs', sla: '98.5%' },
                    'month': { open: 4, inProgress: 6, completed: 42, low: 5, normal: 22, high: 19, urgent: 6, avgRes: '2.7 hrs', sla: '98.8%' },
                    'quarter': { open: 5, inProgress: 8, completed: 110, low: 14, normal: 56, high: 45, urgent: 14, avgRes: '2.6 hrs', sla: '98.9%' },
                    'all': { open: 5, inProgress: 8, completed: 240, low: 28, normal: 120, high: 90, urgent: 27, avgRes: '2.6 hrs', sla: '99.0%' }
                },
                activities: [
                    { type: 'status', title: 'Resolved Wiring Bug', desc: 'Replaced RS-485 bus line termination on node 25.', time: '3 hours ago', icon: 'ti-tool', color: 'success' }
                ],
                tickets: [
                    { id: 'TICK-8078', subject: 'IT AI Process UI Assistant Model Token Streaming', category: 'IT AI Process/UI Development', priority: 'High', status: 'In Progress', updated: '2 hrs ago' }
                ]
            },
            'u5': {
                id: 'u5',
                fullname: 'Mark Henderson',
                username: 'mhenderson',
                email: 'mark@froggysfog.com',
                role: 'Packaging Lead',
                department: 'Operations',
                phone: '(615) 555-0199',
                initials: 'MH',
                active: true,
                joinDate: 'May 2024',
                stats: {
                    'today': { open: 1, inProgress: 1, completed: 2, low: 1, normal: 2, high: 1, urgent: 0, avgRes: '1.5 hrs', sla: '100%' },
                    'week': { open: 3, inProgress: 3, completed: 12, low: 3, normal: 7, high: 5, urgent: 3, avgRes: '2.1 hrs', sla: '99.0%' },
                    'month': { open: 4, inProgress: 5, completed: 38, low: 8, normal: 20, high: 15, urgent: 4, avgRes: '2.3 hrs', sla: '99.2%' },
                    'quarter': { open: 5, inProgress: 7, completed: 95, low: 18, normal: 52, high: 32, urgent: 9, avgRes: '2.2 hrs', sla: '99.1%' },
                    'all': { open: 5, inProgress: 7, completed: 190, low: 35, normal: 100, high: 58, urgent: 16, avgRes: '2.2 hrs', sla: '99.3%' }
                },
                activities: [
                    { type: 'sop', title: 'Reviewed SOP-015', desc: 'Updated packaging burst resistance requirements for international air freight.', time: 'Yesterday', icon: 'ti-box', color: 'primary' }
                ],
                tickets: [
                    { id: 'TICK-8095', subject: 'Master Carton Burst Test Flute Spec Revision', category: 'Vendor Purchase Order', priority: 'Urgent', status: 'To-Do', updated: '4 hrs ago' }
                ]
            }
        };

        let currentUserId = 'u1';
        let currentTimeframe = 'month';
        let currentActivityFilter = 'all';

        function loadUserProfileFromUrl() {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            if (id && USER_DATABASE[id]) {
                currentUserId = id;
            }
            renderMemberDropdown();
            renderUserView();
        }

        function renderMemberDropdown() {
            const dropdown = document.getElementById('memberSwitchDropdown');
            if (!dropdown) return;
            dropdown.innerHTML = Object.values(USER_DATABASE).map(u => \`
                <li>
                    <a class="dropdown-item d-flex align-items-center justify-content-between \${u.id === currentUserId ? 'active' : ''}" href="admin-user-detail.html?id=\${u.id}">
                        <span>\${u.fullname}</span>
                        <span class="badge \${u.id === currentUserId ? 'bg-white text-dark' : 'bg-light text-dark'} fs-11 ms-2">\${u.role}</span>
                    </a>
                </li>
            \`).join('');
        }

        function setTimeframe(tf, btn) {
            currentTimeframe = tf;
            document.querySelectorAll('#timeframeButtonGroup button').forEach(b => {
                b.className = 'btn btn-outline-secondary px-3';
            });
            btn.className = 'btn btn-primary active px-3';
            renderUserStats();
        }

        function filterActivity(type, btn) {
            currentActivityFilter = type;
            if (btn && btn.parentElement) {
                btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            renderUserActivity();
        }

        function renderUserView() {
            const user = USER_DATABASE[currentUserId];
            if (!user) return;

            // Identity Header
            document.getElementById('uHeaderName').textContent = user.fullname;
            document.getElementById('uHeaderRole').textContent = user.role;
            document.getElementById('uProfileFullName').textContent = user.fullname;
            document.getElementById('uProfileEmail').textContent = user.email;
            document.getElementById('uProfileUsername').textContent = user.username;
            document.getElementById('uProfileDepartment').textContent = user.department;
            document.getElementById('uProfilePhone').textContent = user.phone || '(615) 555-0100';
            document.getElementById('uProfileJoined').textContent = user.joinDate;
            document.getElementById('uProfileAvatar').textContent = user.initials;

            // Edit Form Inputs
            document.getElementById('editFullName').value = user.fullname;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editRole').value = user.role;
            document.getElementById('editDepartment').value = user.department;

            renderUserStats();
            renderUserActivity();
            renderUserAssignedTickets();
        }

        function renderUserStats() {
            const user = USER_DATABASE[currentUserId];
            const stats = (user && user.stats && user.stats[currentTimeframe]) ? user.stats[currentTimeframe] : { open: 0, inProgress: 0, completed: 0, low: 0, normal: 0, high: 0, urgent: 0, avgRes: '0 hrs', sla: '100%' };

            document.getElementById('statOpen').textContent = stats.open;
            document.getElementById('statInProgress').textContent = stats.inProgress;
            document.getElementById('statCompleted').textContent = stats.completed;
            document.getElementById('statUrgentHigh').textContent = (stats.urgent + stats.high);
            document.getElementById('statAvgResolution').textContent = stats.avgRes;
            document.getElementById('statSla').textContent = stats.sla;
        }

        function renderUserActivity() {
            const user = USER_DATABASE[currentUserId];
            const container = document.getElementById('userActivityTimeline');
            if (!container || !user) return;

            const acts = user.activities.filter(a => currentActivityFilter === 'all' || a.type === currentActivityFilter);

            if (!acts.length) {
                container.innerHTML = '<div class="text-center py-4 text-muted fs-13">No activity logs recorded for this filter.</div>';
                return;
            }

            container.innerHTML = acts.map(a => \`
                <div class="d-flex gap-3 mb-4 position-relative">
                    <div class="rounded-circle text-white d-flex align-items-center justify-content-center bg-\${a.color} shadow-sm" style="width: 36px; height: 36px; min-width: 36px; font-size: 16px;">
                        <i class="ti \${a.icon}"></i>
                    </div>
                    <div class="card border rounded-3 p-3 w-100 shadow-none bg-light">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                            <strong class="text-dark fs-13">\${a.title}</strong>
                            <span class="text-muted fs-11"><i class="ti ti-clock me-1"></i>\${a.time}</span>
                        </div>
                        <p class="mb-0 fs-12 text-muted">\${a.desc}</p>
                    </div>
                </div>
            \`).join('');
        }

        function renderUserAssignedTickets() {
            const user = USER_DATABASE[currentUserId];
            const tbody = document.getElementById('userAssignedTicketsTableBody');
            const countBadge = document.getElementById('assignedTicketsCountBadge');
            if (!tbody || !user) return;

            if (countBadge) countBadge.textContent = user.tickets.length;

            if (!user.tickets.length) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No tickets currently assigned.</td></tr>';
                return;
            }

            tbody.innerHTML = user.tickets.map(t => \`
                <tr>
                    <td><strong class="text-primary font-monospace">\${t.id}</strong></td>
                    <td><strong class="text-dark fs-12">\${t.subject}</strong></td>
                    <td><span class="badge bg-soft-primary text-primary fs-11">\${t.category}</span></td>
                    <td><span class="badge \${t.priority === 'Urgent' ? 'bg-danger' : (t.priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary')} fs-11">\${t.priority}</span></td>
                    <td><span class="badge \${t.status === 'Completed' ? 'bg-success-subtle text-success' : (t.status === 'In Progress' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary')} fs-11">\${t.status}</span></td>
                    <td><span class="text-muted fs-11">\${t.updated}</span></td>
                    <td class="text-end">
                        <a href="tickets.html?ticket=\${t.id}" class="btn btn-sm btn-outline-success py-0 px-2 fs-11 shadow-sm">
                            Open &rarr;
                        </a>
                    </td>
                </tr>
            \`).join('');
        }

        function saveUserProfileEdits(e) {
            e.preventDefault();
            const user = USER_DATABASE[currentUserId];
            if (!user) return;

            user.fullname = document.getElementById('editFullName').value.trim();
            user.email = document.getElementById('editEmail').value.trim();
            user.username = document.getElementById('editUsername').value.trim();
            user.phone = document.getElementById('editPhone').value.trim();
            user.role = document.getElementById('editRole').value;
            user.department = document.getElementById('editDepartment').value;
            user.initials = user.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FF';

            // Add activity log
            user.activities.unshift({
                type: 'sop',
                title: 'User Profile Updated',
                desc: 'Administrative profile and role permissions updated by Scott Karan.',
                time: 'Just now',
                icon: 'ti-user-check',
                color: 'success'
            });

            renderUserView();
            renderMemberDropdown();

            const tabBtn = document.querySelector('#userDetailTabs button[data-bs-target="#tabActivity"]');
            if (tabBtn) bootstrap.Tab.getOrCreateInstance(tabBtn).show();

            alert('Profile details for ' + user.fullname + ' updated successfully!');
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadUserProfileFromUrl();
        });
	</script>
`;

const finalUserDetailHtml = getHeaderForPage('team', 'Team Member Profile') + userDetailPageContent + footerScripts.replace('</body>', userDetailPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/admin-user-detail.html'), finalUserDetailHtml, 'utf8');

// ==========================================
// 3. ADMIN DYNAMIC FORM BUILDER PAGE (admin-forms.html)
// ==========================================
const formsPageContent = `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span>Dynamic Intake Form Builder</span>
							<span class="badge bg-soft-success text-success fs-12 rounded-pill fw-semibold"><i class="ti ti-tool"></i> Schema Architect</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Design custom category fields, dynamic checklists, and structured intake forms across your operational workflow.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<a href="tickets.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> Open Tickets
						</a>
						<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onclick="saveCategoryForm()">
							<i class="ti ti-check me-1"></i> Save Changes
						</button>
					</div>
				</div>

				<div class="row g-3">
					<!-- Category Selection Side -->
					<div class="col-md-4">
						<div class="card border-0 shadow-sm rounded-3 h-100">
							<div class="card-header bg-transparent border-bottom py-3 d-flex align-items-center justify-content-between">
								<h6 class="fw-bold mb-0 text-dark"><i class="ti ti-folders me-1 text-primary"></i> Intake Categories</h6>
								<span class="badge bg-soft-primary text-primary fs-11">8 Active</span>
							</div>
							<div class="card-body p-2">
								<div class="list-group list-group-flush" id="builderCategoryList">
									<!-- Dynamically Rendered Categories -->
								</div>
							</div>
						</div>
					</div>

					<!-- Field Architect Panel -->
					<div class="col-md-8">
						<div class="card border-0 shadow-sm rounded-3 h-100">
							<div class="card-header bg-transparent border-bottom py-3 d-flex align-items-center justify-content-between">
								<div>
									<h6 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
										<i class="ti ti-adjustments-alt text-primary"></i>
										<span id="selectedCategoryTitle">FX Machine Support</span>
									</h6>
									<span class="fs-12 text-muted">Configured dynamic attributes for this category</span>
								</div>
								<button class="btn btn-sm btn-outline-primary" onclick="addNewFieldRow()">
									<i class="ti ti-plus me-1"></i> Add Custom Field
								</button>
							</div>

							<div class="card-body p-4">
								<div id="fieldsEditorContainer" class="d-flex flex-column gap-3 mb-4">
									<!-- Dynamic Field Rows -->
								</div>

								<div class="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
									<div>
										<strong class="d-block text-dark fs-13">Ready to deploy form schema?</strong>
										<span class="fs-12 text-muted">Updates will apply instantly to all new tickets created under this category.</span>
									</div>
									<button class="btn btn-primary btn-sm px-4 shadow-sm" onclick="saveCategoryForm()">
										<i class="ti ti-check me-1"></i> Deploy Form Schema
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
`;

const formsPageScripts = `
	<script>
        const PRODUCTION_CATEGORIES = [
            {
                name: 'FX Machine Support',
                icon: 'ti-tool',
                fields: [
                    { name: 'machineModel', label: 'Machine / Product Model', type: 'select', options: ['Antari 2000 Elite', 'Solar Telemetry Gateway', 'LFP Battery Array 480V'] },
                    { name: 'serialNumber', label: 'Unit Serial Number / Batch #', type: 'text' },
                    { name: 'firmwareVersion', label: 'Firmware / Hardware Rev', type: 'text' },
                    { name: 'defectSymptom', label: 'Defect / Failure Observed', type: 'textarea' }
                ]
            },
            {
                name: 'Vendor Purchase Order',
                icon: 'ti-receipt',
                fields: [
                    { name: 'poNumber', label: 'Purchase Order #', type: 'text' },
                    { name: 'vendorName', label: 'Vendor / Supplier Name', type: 'text' },
                    { name: 'totalAmount', label: 'Total Value ($ USD)', type: 'number' },
                    { name: 'deliveryDueDate', label: 'Agreed Delivery Date', type: 'date' }
                ]
            },
            {
                name: 'Fluid Finder Update',
                icon: 'ti-flask',
                fields: [
                    { name: 'fluidType', label: 'Fluid Formula Name', type: 'text' },
                    { name: 'safetyDataSheet', label: 'SDS Sheet Attached', type: 'checkbox' },
                    { name: 'revisionNotes', label: 'Formula Revision Notes', type: 'textarea' }
                ]
            },
            {
                name: 'Computer/Laptop Issue',
                icon: 'ti-device-laptop',
                fields: [
                    { name: 'assetTag', label: 'IT Asset Tag #', type: 'text' },
                    { name: 'operatingSystem', label: 'Operating System', type: 'select', options: ['Windows 11', 'macOS Sequoia', 'Ubuntu Linux'] },
                    { name: 'urgencyLevel', label: 'Work Impact', type: 'select', options: ['Completely blocked', 'Minor inconvenience', 'Software install'] }
                ]
            },
            {
                name: 'Customer Support Request',
                icon: 'ti-headset',
                fields: [
                    { name: 'clientName', label: 'Client / Account Name', type: 'text' },
                    { name: 'orderNumber', label: 'Original Invoice #', type: 'text' },
                    { name: 'preferredContact', label: 'Preferred Contact Method', type: 'select', options: ['Email', 'Phone', 'Slack'] }
                ]
            },
            {
                name: 'Website Frontend Update',
                icon: 'ti-world',
                fields: [
                    { name: 'targetUrl', label: 'Target Page URL', type: 'text' },
                    { name: 'browserTested', label: 'Tested Browsers', type: 'text' }
                ]
            },
            {
                name: 'Rep Assignment Change',
                icon: 'ti-user-check',
                fields: [
                    { name: 'accountName', label: 'Customer Account', type: 'text' },
                    { name: 'newRepName', label: 'New Sales Rep Assigned', type: 'text' }
                ]
            },
            {
                name: 'IT AI Process/UI Development',
                icon: 'ti-brain',
                fields: [
                    { name: 'modelEngine', label: 'Target Model Architecture', type: 'text' },
                    { name: 'specRequirement', label: 'Feature Specification', type: 'textarea' }
                ]
            }
        ];

        let selectedCatIndex = 0;

        function renderCategoryList() {
            const listEl = document.getElementById('builderCategoryList');
            if (!listEl) return;

            listEl.innerHTML = PRODUCTION_CATEGORIES.map((cat, idx) => \`
                <a href="javascript:void(0);" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 \${idx === selectedCatIndex ? 'active' : ''}" onclick="selectCategory(\${idx})" style="\${idx === selectedCatIndex ? 'background-color: var(--bs-primary); border-color: var(--bs-primary); color: #fff;' : ''}">
                    <div class="d-flex align-items-center gap-2">
                        <i class="ti \${cat.icon} fs-16"></i>
                        <span class="fw-semibold fs-13">\${cat.name}</span>
                    </div>
                    <span class="badge \${idx === selectedCatIndex ? 'bg-white text-primary' : 'bg-light text-dark border'} fs-11">\${cat.fields.length} fields</span>
                </a>
            \`).join('');

            renderFieldsEditor();
        }

        function selectCategory(idx) {
            selectedCatIndex = idx;
            renderCategoryList();
        }

        function renderFieldsEditor() {
            const cat = PRODUCTION_CATEGORIES[selectedCatIndex];
            const titleEl = document.getElementById('selectedCategoryTitle');
            const container = document.getElementById('fieldsEditorContainer');
            if (titleEl) titleEl.textContent = cat.name;
            if (!container) return;

            container.innerHTML = cat.fields.map((f, fIdx) => \`
                <div class="row g-2 align-items-center p-3 bg-light rounded-3 border">
                    <div class="col-md-4">
                        <label class="form-label fs-11 text-muted text-uppercase fw-bold mb-1">Field Identifier</label>
                        <input type="text" class="form-control form-control-sm fw-medium" value="\${f.name}" onchange="updateField(\${fIdx}, 'name', this.value)">
                    </div>
                    <div class="col-md-5">
                        <label class="form-label fs-11 text-muted text-uppercase fw-bold mb-1">Display Label</label>
                        <input type="text" class="form-control form-control-sm" value="\${f.label}" onchange="updateField(\${fIdx}, 'label', this.value)">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fs-11 text-muted text-uppercase fw-bold mb-1">Type</label>
                        <select class="form-select form-select-sm" onchange="updateField(\${fIdx}, 'type', this.value)">
                            <option value="text" \${f.type === 'text' ? 'selected' : ''}>Text</option>
                            <option value="number" \${f.type === 'number' ? 'selected' : ''}>Number</option>
                            <option value="select" \${f.type === 'select' ? 'selected' : ''}>Select</option>
                            <option value="textarea" \${f.type === 'textarea' ? 'selected' : ''}>Textarea</option>
                            <option value="date" \${f.type === 'date' ? 'selected' : ''}>Date</option>
                            <option value="checkbox" \${f.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
                        </select>
                    </div>
                    <div class="col-md-1 text-end pt-3">
                        <button type="button" class="btn btn-sm btn-link text-danger p-0" onclick="removeFieldRow(\${fIdx})"><i class="ti ti-trash fs-16"></i></button>
                    </div>
                </div>
            \`).join('');
        }

        function addNewFieldRow() {
            PRODUCTION_CATEGORIES[selectedCatIndex].fields.push({
                name: 'customField' + (PRODUCTION_CATEGORIES[selectedCatIndex].fields.length + 1),
                label: 'New Dynamic Field',
                type: 'text'
            });
            renderCategoryList();
        }

        function updateField(idx, prop, val) {
            PRODUCTION_CATEGORIES[selectedCatIndex].fields[idx][prop] = val;
        }

        function removeFieldRow(idx) {
            PRODUCTION_CATEGORIES[selectedCatIndex].fields.splice(idx, 1);
            renderCategoryList();
        }

        function saveCategoryForm() {
            alert('Dynamic form schema for ' + PRODUCTION_CATEGORIES[selectedCatIndex].name + ' deployed successfully!');
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderCategoryList();
        });
	</script>
`;

const finalFormsHtml = getHeaderForPage('forms', 'Dynamic Form Builder') + formsPageContent + footerScripts.replace('</body>', formsPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/admin-forms.html'), finalFormsHtml, 'utf8');

// ==========================================
// 4. KNOWLEDGE BASE & SOPS PAGE (knowledge-base.html)
// ==========================================
const kbPageContent = `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span>Machine Trends & Knowledgebase Hub</span>
							<span class="badge bg-soft-success text-success fs-12 rounded-pill fw-semibold"><i class="ti ti-book"></i> Diagnostic SOPs</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Recurring defect analytics, root cause playbooks, and standardized step-by-step diagnostic SOPs.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<a href="tickets.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> Ticket Operations
						</a>
						<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onclick="bootstrap.Tab.getOrCreateInstance(document.querySelector('#kbTabs button[data-bs-target=\\'#tabKbCreate\\']')).show()">
							<i class="ti ti-plus me-1"></i> Create New SOP
						</button>
					</div>
				</div>

				<!-- SOP Detail Modal Popup -->
				<div class="modal fade" id="sopDetailModal" tabindex="-1" aria-hidden="true">
					<div class="modal-dialog modal-dialog-centered modal-lg">
						<div class="modal-content border-0 shadow-lg">
							<div class="modal-header py-3 px-4 border-bottom bg-light d-flex align-items-center justify-content-between">
								<div class="d-flex align-items-center gap-2">
									<span class="badge bg-dark text-white fw-bold fs-12 px-2 py-1" id="sopModalCode">SOP-014</span>
									<span class="badge bg-soft-primary text-primary fw-semibold fs-12" id="sopModalProduct">Antari 2000 Elite</span>
								</div>
								<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
							</div>
							<div class="modal-body p-4">
								<h4 class="fw-bold text-dark mb-2" id="sopModalTitle">Silkscreen Artwork Alignment & Emulsion Curing Protocol</h4>
								<div class="d-flex align-items-center gap-3 fs-12 text-muted mb-3 pb-2 border-bottom">
									<span><i class="ti ti-user me-1"></i> Author: <strong class="text-dark" id="sopModalAuthor">Scott Karan</strong></span>
									<span><i class="ti ti-clock me-1"></i> Updated: <span id="sopModalUpdated">2 days ago</span></span>
									<span class="badge bg-soft-success text-success"><i class="ti ti-shield-check me-1"></i> Verified Factory SOP</span>
								</div>

								<div class="alert alert-warning border-0 rounded-3 mb-3 p-3 fs-13">
									<strong class="d-block text-warning-emphasis mb-1"><i class="ti ti-alert-triangle me-1"></i> Observed Failure Symptom:</strong>
									<span id="sopModalSymptom" class="text-dark">Silkscreen lettering offset or smudging after powder-coat bake.</span>
								</div>

								<h6 class="fw-bold text-dark text-uppercase fs-12 mb-2 d-flex align-items-center gap-1">
									<i class="ti ti-list-check text-success"></i> Pre-Flight "Check First" Diagnostic Steps:
								</h6>
								<div class="d-flex flex-column gap-2 mb-3" id="sopModalStepsList"></div>

								<div class="p-3 bg-light rounded-3 border">
									<h6 class="fw-bold text-dark text-uppercase fs-12 mb-1"><i class="ti ti-bulb text-primary me-1"></i> Permanent Resolution & Prevention:</h6>
									<p class="mb-0 fs-13 text-dark" id="sopModalResolution">Use high-adhesion 2-part epoxy ink with 300-mesh screen.</p>
								</div>
							</div>
							<div class="modal-footer border-top py-2 px-4 bg-light d-flex align-items-center justify-content-between">
								<button type="button" class="btn btn-sm btn-light" data-bs-dismiss="modal">Close</button>
								<button type="button" class="btn btn-sm btn-success px-3" onclick="alert('Diagnostic checklist verified and logged to audit trail!')">
									<i class="ti ti-check me-1"></i> Mark Diagnostics Verified
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Main Navigation Tabs -->
				<div class="card border-0 shadow-sm rounded-3 mb-4">
					<div class="card-header bg-transparent border-bottom py-3">
						<ul class="nav nav-pills gap-2" id="kbTabs">
							<li class="nav-item">
								<button class="nav-link active py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabKbTrends">
									<i class="ti ti-chart-bar me-1"></i> 1. Machine Failure Trends & Reliability
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabKbArticles">
									<i class="ti ti-book me-1"></i> 2. Troubleshooting Knowledgebase (<span id="kbArticlesCountBadge">4</span>)
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill text-success" data-bs-toggle="tab" data-bs-target="#tabKbCreate">
									<i class="ti ti-plus me-1"></i> Create New Diagnostic SOP
								</button>
							</li>
						</ul>
					</div>

					<div class="card-body p-4">
						<div class="tab-content">
							<!-- Tab 1: Machine Failure Trends -->
							<div class="tab-pane fade show active" id="tabKbTrends">
								<div class="alert alert-info border-0 rounded-3 d-flex align-items-center gap-2 mb-4 py-2 px-3 fs-13">
									<i class="ti ti-info-circle fs-18 text-info"></i>
									<span>These defect patterns are computed directly from past resolved tickets to prioritize what to inspect first on any machine.</span>
								</div>

								<div class="row g-3" id="machineTrendsContainer"></div>
							</div>

							<!-- Tab 2: Searchable Knowledgebase SOPs -->
							<div class="tab-pane fade" id="tabKbArticles">
								<div class="row g-2 mb-3">
									<div class="col-md-6">
										<input type="text" id="kbSearchInput" class="form-control form-control-sm" placeholder="Search by symptom, machine, or keyword (e.g. Silkscreen, Modbus)..." oninput="renderKbArticlesList()">
									</div>
									<div class="col-md-6">
										<select id="kbModelFilter" class="form-select form-select-sm" onchange="renderKbArticlesList()">
											<option value="">All Machines / Products</option>
										</select>
									</div>
								</div>

								<div class="row g-3" id="kbArticlesListContainer"></div>
							</div>

							<!-- Tab 3: Create New SOP -->
							<div class="tab-pane fade" id="tabKbCreate">
								<form id="createKbForm" onsubmit="saveNewKbArticle(event)">
									<div class="row g-3">
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Machine / Product Model <span class="text-danger">*</span></label>
											<select id="newKbProduct" class="form-select form-select-sm" required>
												<option value="Antari 2000 Elite">Antari 2000 Elite</option>
												<option value="LilyPad Solar Telemetry Gateway">LilyPad Solar Telemetry Gateway</option>
												<option value="Industrial LFP Battery Array 480V">Industrial LFP Battery Array 480V</option>
												<option value="Enterprise ERP Server Node X1">Enterprise ERP Server Node X1</option>
											</select>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">SOP Guide Title <span class="text-danger">*</span></label>
											<input type="text" id="newKbTitle" class="form-control form-control-sm" placeholder="e.g. SOP-014: Silkscreen Alignment & Emulsion Curing Protocol" required>
										</div>
										<div class="col-12">
											<label class="form-label fs-13 fw-semibold">Common Symptom / Problem Observed <span class="text-danger">*</span></label>
											<input type="text" id="newKbSymptom" class="form-control form-control-sm" placeholder="e.g. Silkscreen lettering misaligned or smudging during assembly" required>
										</div>
										<div class="col-12">
											<label class="form-label fs-13 fw-semibold">"Check First" Diagnostic Steps (1 per line) <span class="text-danger">*</span></label>
											<textarea id="newKbSteps" class="form-control form-control-sm" rows="4" placeholder="1. Inspect chassis alignment pin tolerances (±0.2mm)&#10;2. Check UV curing oven temperature (must reach 140°C for 8 mins)&#10;3. Verify mesh tension gauge reads 24 N/cm" required></textarea>
										</div>
										<div class="col-12">
											<label class="form-label fs-13 fw-semibold">Permanent Resolution & Root Cause</label>
											<textarea id="newKbResolution" class="form-control form-control-sm" rows="3" placeholder="Explain the underlying fix and how to prevent reoccurrence..."></textarea>
										</div>
									</div>
									<div class="text-end mt-4 pt-3 border-top">
										<button type="submit" class="btn btn-primary px-4 shadow-sm">
											<i class="ti ti-check me-1"></i> Publish to Knowledgebase
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
`;

const kbPageScripts = `
	<script>
        const KB_ARTICLES = [
            {
                id: 'kb_1',
                code: 'SOP-014',
                product: 'Antari 2000 Elite',
                title: 'Silkscreen Artwork Alignment & Emulsion Curing Protocol',
                symptom: 'Silkscreen graphics offset by 2-3mm on front chassis or smudging after powder-coat bake.',
                checkFirstSteps: [
                    'Verify chassis alignment guide pins are calibrated to ±0.15mm tolerance.',
                    'Check UV emulsion curing temperature: must reach 140°C for minimum 8 minutes.',
                    'Inspect silkscreen mesh tension: must read between 22-26 N/cm.'
                ],
                resolution: 'Use high-adhesion 2-part epoxy ink (Series 9600) with 300-mesh monofilament polyester screen. Ensure pre-wipe with isopropyl alcohol before screening.',
                updatedAt: '2 days ago',
                author: 'Scott Karan'
            },
            {
                id: 'kb_2',
                code: 'SOP-015',
                product: 'Antari 2000 Elite',
                title: 'Master Carton Burst Resistance & Corner Drop Inspection',
                symptom: 'Carton corner crushing during multi-tier container freight and transit.',
                checkFirstSteps: [
                    'Confirm corrugated grade is minimum 5-ply Double Wall (200# Mullen burst test rating).',
                    'Ensure foam corner buffer density is minimum 28 kg/m³ EPE.',
                    'Verify moisture desiccant bag (50g) is placed inside PE bag seal.'
                ],
                resolution: 'Switch supplier spec to 5-ply BC flute with reinforced edge protectors for international air & sea shipments.',
                updatedAt: '3 days ago',
                author: 'Mark Henderson'
            },
            {
                id: 'kb_3',
                code: 'SOP-022',
                product: 'LilyPad Solar Telemetry Gateway',
                title: 'Modbus RTU RS-485 Communication Timeout & Noise Suppression',
                symptom: 'Telemetry drops packet bursts when inverters spin up to peak wattage.',
                checkFirstSteps: [
                    'Check RS-485 bus 120-ohm termination resistors at both ends of daisy-chain.',
                    'Verify shield drain wire is grounded at one end only (prevents ground loop current).',
                    'Confirm baud rate is matched across all inverter slaves (typically 9600-8-N-1).'
                ],
                resolution: 'Installed isolated RS-485 repeater at 25th inverter node to boost SNR voltage margin.',
                updatedAt: '1 week ago',
                author: 'Sarah Connor'
            },
            {
                id: 'kb_4',
                code: 'SOP-031',
                product: 'Industrial LFP Battery Array 480V',
                title: 'Cell Balancing Voltage Drift & Lockout Reset',
                symptom: 'Array BMS enters high-voltage protection lockout on string #4 during rapid charging.',
                checkFirstSteps: [
                    'Check individual cell delta voltage across string (must not exceed 35mV).',
                    'Inspect thermistor wiring harness connection J2 for loose crimp.',
                    'Execute passive balancing cycle at 3.45V per cell.'
                ],
                resolution: 'Replaced cell #14 on tray 4 which had internal high impedance (>1.8 mΩ).',
                updatedAt: '2 weeks ago',
                author: 'David Miller'
            }
        ];

        function renderMachineTrends() {
            const container = document.getElementById('machineTrendsContainer');
            if (!container) return;

            const models = [
                {
                    name: 'Antari 2000 Elite',
                    ticketsCount: 8,
                    defectRates: [
                        { symptom: 'Silkscreen Hole Alignment Tolerance', rate: '45%' },
                        { symptom: 'Carton 5-Ply Burst Test & Corner Cushioning', rate: '35%' },
                        { symptom: 'User Manual Multilingual Compliance', rate: '20%' }
                    ],
                    kbCode: 'SOP-014'
                },
                {
                    name: 'LilyPad Solar Telemetry Gateway',
                    ticketsCount: 5,
                    defectRates: [
                        { symptom: 'RS-485 Modbus Termination Resistor Missing', rate: '60%' },
                        { symptom: 'Ground Loop Noise & Baud Mismatch', rate: '40%' }
                    ],
                    kbCode: 'SOP-022'
                },
                {
                    name: 'Industrial LFP Battery Array 480V',
                    ticketsCount: 4,
                    defectRates: [
                        { symptom: 'String #4 Voltage Delta Drift (>35mV)', rate: '70%' },
                        { symptom: 'Thermistor Wiring Crimp J2 Loose', rate: '30%' }
                    ],
                    kbCode: 'SOP-031'
                }
            ];

            container.innerHTML = models.map(m => \`
                <div class="col-md-4">
                    <div class="card border rounded-3 p-3 h-100 shadow-none bg-light">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="badge bg-soft-primary text-primary fw-bold fs-11">
                                <i class="ti ti-box me-1"></i>\${m.name}
                            </span>
                            <span class="badge bg-white text-dark border fs-11">\${m.ticketsCount} tickets</span>
                        </div>

                        <h6 class="fw-bold fs-13 text-dark mb-2">Top Recurring Defects:</h6>
                        <div class="d-flex flex-column gap-2 mb-3">
                            \${m.defectRates.map(d => \`
                                <div>
                                    <div class="d-flex justify-content-between fs-11 text-muted mb-1">
                                        <span class="text-truncate" style="max-width:180px;">\${d.symptom}</span>
                                        <strong class="text-dark">\${d.rate}</strong>
                                    </div>
                                    <div class="progress" style="height: 5px;">
                                        <div class="progress-bar bg-success" style="width: \${d.rate};"></div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>

                        <button class="btn btn-sm btn-outline-success w-100 mt-auto" onclick="filterKbByProduct('\${m.name}')">
                            <i class="ti ti-book me-1"></i> View Check First Playbook (\${m.kbCode})
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        function filterKbByProduct(productName) {
            const tabBtn = document.querySelector('#kbTabs button[data-bs-target="#tabKbArticles"]');
            if (tabBtn) bootstrap.Tab.getOrCreateInstance(tabBtn).show();

            const select = document.getElementById('kbModelFilter');
            if (select) {
                select.value = productName;
                renderKbArticlesList();
            }
        }

        function renderKbArticlesList() {
            const container = document.getElementById('kbArticlesListContainer');
            const countBadge = document.getElementById('kbArticlesCountBadge');
            if (!container) return;

            const search = document.getElementById('kbSearchInput')?.value.toLowerCase() || '';
            const modelFilter = document.getElementById('kbModelFilter')?.value || '';

            const filtered = KB_ARTICLES.filter(k => {
                const matchSearch = !search || k.title.toLowerCase().includes(search) || k.symptom.toLowerCase().includes(search) || k.product.toLowerCase().includes(search);
                const matchModel = !modelFilter || k.product === modelFilter;
                return matchSearch && matchModel;
            });

            if (countBadge) countBadge.textContent = KB_ARTICLES.length;

            if (!filtered.length) {
                container.innerHTML = '<div class="col-12 text-center py-4 text-muted">No diagnostic articles found matching search.</div>';
                return;
            }

            container.innerHTML = filtered.map(k => \`
                <div class="col-md-6">
                    <div class="card p-3 border rounded-3 h-100 d-flex flex-column shadow-sm" style="cursor:pointer; transition: transform 0.15s ease;" onclick="viewKbArticleModal('\${k.id}')" onmouseover="this.style.borderColor='var(--bs-primary)';" onmouseout="this.style.borderColor='#e2e8f0';">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="badge bg-dark text-white fs-11 px-2 py-1">\${k.code}</span>
                            <span class="badge bg-soft-primary text-primary fs-11"><i class="ti ti-box me-1"></i>\${k.product}</span>
                        </div>

                        <h6 class="fw-bold fs-14 text-dark mb-1">\${k.title}</h6>
                        <p class="text-muted fs-12 mb-2 text-truncate"><strong>Symptom:</strong> \${k.symptom}</p>

                        <div class="bg-light p-2 rounded border mb-2 fs-12">
                            <strong class="text-success d-block mb-1"><i class="ti ti-check-circle me-1"></i>Check First Steps:</strong>
                            <ul class="ps-3 mb-0 text-dark">
                                \${k.checkFirstSteps.slice(0, 2).map(s => \`<li>\${s}</li>\`).join('')}
                            </ul>
                        </div>

                        <div class="d-flex align-items-center justify-content-between pt-2 border-top mt-auto fs-11 text-muted">
                            <span><i class="ti ti-user me-1"></i>\${k.author} &middot; \${k.updatedAt}</span>
                            <span class="text-success fw-semibold">Open SOP &rarr;</span>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        function viewKbArticleModal(id) {
            const article = KB_ARTICLES.find(k => k.id === id);
            if (!article) return;

            document.getElementById('sopModalCode').textContent = article.code;
            document.getElementById('sopModalProduct').textContent = article.product;
            document.getElementById('sopModalTitle').textContent = article.title;
            document.getElementById('sopModalAuthor').textContent = article.author || 'Scott Karan';
            document.getElementById('sopModalUpdated').textContent = article.updatedAt || 'Recent';
            document.getElementById('sopModalSymptom').textContent = article.symptom;
            document.getElementById('sopModalResolution').textContent = article.resolution;

            const stepsContainer = document.getElementById('sopModalStepsList');
            if (stepsContainer) {
                stepsContainer.innerHTML = article.checkFirstSteps.map((s, idx) => \`
                    <div class="p-2 rounded border bg-white d-flex align-items-center gap-2">
                        <input type="checkbox" class="form-check-input mt-0" id="sop_step_\${idx}">
                        <label for="sop_step_\${idx}" class="text-dark mb-0 fw-medium fs-13" style="cursor: pointer;">\${s}</label>
                    </div>
                \`).join('');
            }

            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('sopDetailModal'));
            modal.show();
        }

        function saveNewKbArticle(e) {
            e.preventDefault();
            const product = document.getElementById('newKbProduct').value;
            const title = document.getElementById('newKbTitle').value.trim();
            const symptom = document.getElementById('newKbSymptom').value.trim();
            const stepsRaw = document.getElementById('newKbSteps').value.trim();
            const resolution = document.getElementById('newKbResolution').value.trim();

            const checkFirstSteps = stepsRaw.split('\\n').map(s => s.replace(/^\\d+\\.\\s*/, '').trim()).filter(Boolean);
            const nextNum = KB_ARTICLES.length + 10;
            const newArticle = {
                id: 'kb_' + Date.now(),
                code: \`SOP-0\${nextNum}\`,
                product,
                title,
                symptom,
                checkFirstSteps,
                resolution,
                updatedAt: 'Just now',
                author: 'Scott Karan'
            };

            KB_ARTICLES.unshift(newArticle);
            renderKbArticlesList();
            document.getElementById('createKbForm').reset();
            const tabBtn = document.querySelector('#kbTabs button[data-bs-target="#tabKbArticles"]');
            if (tabBtn) bootstrap.Tab.getOrCreateInstance(tabBtn).show();
            alert(\`Published \${newArticle.code}: \${newArticle.title} to Knowledgebase!\`);
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderMachineTrends();
            renderKbArticlesList();
        });
	</script>
`;

const finalKbHtml = getHeaderForPage('kb', 'Knowledge Base & SOPs') + kbPageContent + footerScripts.replace('</body>', kbPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/knowledge-base.html'), finalKbHtml, 'utf8');

// ==========================================
// 5. UPDATE INDEX, DASHBOARD, AND TICKETS SIDEBAR
// ==========================================
const baseSidebar = `
			<!-- Sidenav Menu -->
			<div class="sidebar-inner" data-simplebar>
				<div id="sidebar-menu" class="sidebar-menu">
					<ul>
						<li class="menu-title"><span>Main Operations</span></li>
						<li>
							<ul>
								<li>
									<a href="dashboard.html" class="active">
										<i class="ti ti-dashboard"></i><span>Main Dashboard</span>
									</a>
								</li>
								<li>
									<a href="tickets.html">
										<i class="ti ti-ticket"></i><span>Ticket Operations</span>
									</a>
								</li>
								<li>
									<a href="knowledge-base.html">
										<i class="ti ti-book"></i><span>Knowledge Base & SOPs</span>
									</a>
								</li>
							</ul>
						</li>

						<li class="menu-title"><span>Administration & Setup</span></li>
						<li>
							<ul>
								<li class="submenu">
									<a href="javascript:void(0);" class="subdrop">
										<i class="ti ti-settings-2"></i><span>Operations Admin</span><span class="menu-arrow"></span>
									</a>
									<ul style="display: block;">
										<li><a href="admin-email.html"><i class="ti ti-mail-forward me-2 text-primary"></i>Inbound Email & Anti-Spam</a></li>
										<li><a href="admin-team.html"><i class="ti ti-users me-2 text-primary"></i>Team & User Permissions</a></li>
										<li><a href="admin-forms.html"><i class="ti ti-adjustments me-2 text-primary"></i>Dynamic Form Builder</a></li>
									</ul>
								</li>
							</ul>
						</li>

						<li class="menu-title"><span>Account</span></li>
						<li>
							<ul>
								<li>
									<a href="login.html" onclick="sessionStorage.removeItem('lilypad_auth_user'); localStorage.removeItem('lilypad_logged_in');">
										<i class="ti ti-logout text-danger"></i><span class="text-danger fw-semibold">Sign Out</span>
									</a>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
`;

// Update index.html and dashboard.html with real URLs
let updatedIndex = fs.readFileSync(indexPath, 'utf8');

// Strip off any old duplicated tickets code if present
const footerEndMarker = '<!-- End Footer -->';
if (updatedIndex.includes(footerEndMarker)) {
    const footerEndIdx = updatedIndex.indexOf(footerEndMarker) + footerEndMarker.length;
    const cleanScriptsTail = `

		</div>
		<!-- End Page Content -->

	</div>
	<!-- End Wrapper -->

	<!-- Bootstrap Core JS -->
	<script src="assets/js/bootstrap.bundle.min.js"></script>
	<!-- Simplebar JS -->
	<script src="assets/plugins/simplebar/simplebar.min.js"></script>
	<!-- Main JS -->
    <script src="assets/js/script.js"></script>
    <script src="assets/js/lilypad-notifications.js"></script>
</body>
</html>
`;
    updatedIndex = updatedIndex.substring(0, footerEndIdx) + cleanScriptsTail;
}

// Ensure correct header buttons
updatedIndex = updatedIndex.replace(/<button type="button" onclick="openEmailGatewayModal\(\)"[\s\S]*?<\/button>/g, '<a href="admin-email.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3"><i class="ti ti-mail-cog me-1"></i> Email Gateway</a>');
updatedIndex = updatedIndex.replace(/<button type="button" onclick="openKnowledgeBaseModal\(\)"[\s\S]*?<\/button>/g, '<a href="knowledge-base.html" class="btn btn-outline-success btn-sm rounded-pill px-3"><i class="ti ti-book me-1"></i> Diagnostic SOPs</a>');
updatedIndex = updatedIndex.replace(/<button type="button" onclick="openIntakeModal\(\)"[\s\S]*?<\/button>/g, '<a href="tickets.html?action=new" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-1"><i class="ti ti-plus"></i><span>New Ticket</span></a>');

// Ensure correct sidebar
const sStart = updatedIndex.indexOf('<!-- Sidenav Menu -->');
const sEnd = updatedIndex.indexOf('<!-- Sidenav Menu End -->');
if (sStart !== -1 && sEnd !== -1) {
    updatedIndex = updatedIndex.substring(0, sStart) + baseSidebar + '\n\t\t</div>\n\t\t' + updatedIndex.substring(sEnd);
}

fs.writeFileSync(indexPath, updatedIndex, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/dashboard.html'), updatedIndex, 'utf8');

console.log('Successfully generated dedicated admin pages:');
console.log(' - public/admin-email.html');
console.log(' - public/admin-team.html');
console.log(' - public/admin-forms.html');
console.log(' - public/knowledge-base.html');
console.log(' - public/index.html & public/dashboard.html (Cleaned)');


