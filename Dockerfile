# Debian-based (not Alpine - Playwright's bundled Chromium needs glibc, not
# musl, so it will not run on an Alpine image) and pinned to the same Node
# version as package.json's engines field.
#
# This replaces Render's native Node runtime for one reason: the in-house
# Lead Prospector crawler needs `playwright install --with-deps chromium`,
# which apt-get-installs Chromium's shared libraries (libnss3, etc.) and
# requires root. Render's native runtime build container denies that
# ("su: Authentication failure" - confirmed live), which is why the
# previous buildCommand had to drop --with-deps and only fetch the browser
# binary itself - crawls then failed silently at runtime with a missing-
# shared-library error the moment chromium.launch() actually ran. A plain
# Docker build runs as root by default, so --with-deps works here.
FROM node:24.19.0-bookworm-slim

WORKDIR /usr/src/lilypad

# node-sass has no prebuilt binary for Node 24, so npm install falls back to
# compiling it from source via node-gyp - confirmed live this fails on the
# bare -slim image ("Could not find any Python installation to use") since
# -slim strips the compiler toolchain Render's native runtime buildpack
# normally provides for free. make/g++ are node-gyp's other two standard
# requirements alongside Python, added preemptively rather than one at a
# time through repeated failed deploys.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# No package-lock.json to copy - it's gitignored in this repo (yarn.lock is
# the tracked lockfile, but the native buildCommand this replaces always
# ran plain `npm install`, not `npm ci`, so no lock file is required here
# either).
COPY package.json ./
RUN npm install --legacy-peer-deps

RUN npx playwright install --with-deps chromium

COPY . .

EXPOSE 8118
CMD ["node", "app.js"]
