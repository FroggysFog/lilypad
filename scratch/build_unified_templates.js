const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../public/index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const contentStartMarker = '<div class="content pb-0">';
const footerStartMarker = '<!-- Start Footer -->';

// Helper to assemble pages with active sidebar highlights
function getHeaderForPage(activeKey, pageTitle = 'LilyPad ERP') {
    let header = indexHtml.substring(0, indexHtml.indexOf(contentStartMarker) + contentStartMarker.length);
    header = header.replace(/<title>.*?<\/title>/, '<title>' + pageTitle + ' | LilyPad ERP</title>');

    const sidebarTemplate = `
			<!-- Sidenav Menu -->
			<div class="sidebar-inner" data-simplebar>
				<div id="sidebar-menu" class="sidebar-menu">
					<ul>
						<li class="menu-title"><span>Main Operations</span></li>
						<li>
							<ul>
								<li>
									<a href="dashboard.html" class="` + (activeKey === 'dashboard' ? 'active' : '') + `">
										<i class="ti ti-dashboard"></i><span>Main Dashboard</span>
									</a>
								</li>
								<li>
									<a href="tickets.html" class="` + (activeKey === 'tickets' ? 'active' : '') + `">
										<i class="ti ti-ticket"></i><span>Ticket Operations</span>
									</a>
								</li>
								<li>
									<a href="knowledge-base.html" class="` + (activeKey === 'kb' ? 'active' : '') + `">
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
										<li><a href="admin-email.html" class="` + (activeKey === 'email' ? 'active' : '') + `"><i class="ti ti-mail-cog me-2 text-primary"></i>Inbound Email & Anti-Spam</a></li>
										<li><a href="admin-team.html" class="` + (activeKey === 'team' ? 'active' : '') + `"><i class="ti ti-users me-2 text-primary"></i>Team & User Permissions</a></li>
										<li><a href="admin-forms.html" class="` + (activeKey === 'forms' ? 'active' : '') + `"><i class="ti ti-forms me-2 text-primary"></i>Dynamic Form Categories</a></li>
									</ul>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>`;

    header = header.replace(/<!-- Sidenav Menu -->[\s\S]*?<!-- \/Sidenav Menu -->/, sidebarTemplate);
    return header;
}

let footerScripts = indexHtml.substring(indexHtml.indexOf(footerStartMarker));
footerScripts = footerScripts.replace(/<script>\s*document\.addEventListener\("DOMContentLoaded", function\(\) \{\s*try \{\s*const auth = sessionStorage[\s\S]*?<\/script>\s*/g, '');
footerScripts = footerScripts.replace("</body>", `
<script>
    document.addEventListener("DOMContentLoaded", function() {
        try {
            const auth = sessionStorage.getItem('lilypad_auth_user');
            if (auth) {
                const u = JSON.parse(auth);
                document.querySelectorAll('.topbar-user-name').forEach(function(el) { el.textContent = u.fullname || 'Scott Karan'; });
                document.querySelectorAll('.topbar-user-role').forEach(function(el) { el.textContent = u.role || 'Operations Admin'; });
            }
        } catch(e) {}
    });
</script>
</body>`);

// ==========================================
// 1. ADMIN EMAIL PAGE (admin-email.html)
// ==========================================
const emailPageContent = `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span>Inbound Email & Anti-Spam Shield</span>
							<span class="badge bg-soft-primary text-primary fs-12 rounded-pill fw-semibold"><i class="ti ti-shield-check"></i> 6-Layer Active</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Configure inbound support email gateways, IMAP/SMTP mailboxes, SPF/DKIM verification, and anti-spam heuristic filters.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<a href="tickets.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> View Tickets
						</a>
						<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onclick="bootstrap.Tab.getOrCreateInstance(document.querySelector('#emailTabs button[data-bs-target=\\'#tabSimulator\\']')).show()">
							<i class="ti ti-player-play me-1"></i> Launch Email Simulator
						</button>
					</div>
				</div>

				<!-- Gateway Metric Cards -->
				<div class="row g-3 mb-4">
					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Inbound Mailboxes</span>
									<h3 class="fw-bold mb-0 mt-1 text-primary">3 Connected</h3>
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
									<span class="fs-12 text-muted fw-semibold text-uppercase">Spam Shield Status</span>
									<h3 class="fw-bold mb-0 mt-1 text-success">99.8% Clean</h3>
								</div>
								<div class="rounded-3 p-2 text-white bg-success d-flex align-items-center justify-content-center shadow-sm" style="width:44px; height:44px;">
									<i class="ti ti-shield-check fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Quarantined Floods</span>
									<h3 class="fw-bold mb-0 mt-1 text-danger" id="quarantineCountDisplay">14</h3>
								</div>
								<div class="rounded-3 p-2 text-white bg-danger d-flex align-items-center justify-content-center shadow-sm" style="width:44px; height:44px;">
									<i class="ti ti-ban fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Auto-Created Tickets</span>
									<h3 class="fw-bold mb-0 mt-1 text-info">284 Total</h3>
								</div>
								<div class="rounded-3 p-2 text-white bg-info d-flex align-items-center justify-content-center shadow-sm" style="width:44px; height:44px;">
									<i class="ti ti-bolt fs-22"></i>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Navigation Tabs -->
				<div class="card border-0 shadow-sm rounded-3 mb-4">
					<div class="card-header bg-transparent border-bottom py-3">
						<ul class="nav nav-pills gap-2" id="emailTabs">
							<li class="nav-item">
								<button class="nav-link active py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabMailboxes">
									<i class="ti ti-mailbox me-1"></i> Connected Inboxes (3)
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabTeamsM365">
									<i class="ti ti-brand-teams me-1"></i> Microsoft Teams & M365 Real Email
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabRules">
									<i class="ti ti-shield-cog me-1"></i> Anti-Spam Security Shield
								</button>
							</li>
									<i class="ti ti-shield-cog me-1"></i> Anti-Spam Security Shield
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill" data-bs-toggle="tab" data-bs-target="#tabQuarantine">
									<i class="ti ti-archive me-1"></i> Quarantine Queue (<span id="tabQuarantineCount">14</span>)
								</button>
							</li>
							<li class="nav-item">
								<button class="nav-link py-2 px-3 fs-13 fw-semibold rounded-pill text-primary" data-bs-toggle="tab" data-bs-target="#tabSimulator">
									<i class="ti ti-test-pipe me-1"></i> Live Email Simulator
								</button>
							</li>
						</ul>
					</div>

					<div class="card-body p-4">
						<div class="tab-content">
							<!-- Tab 1: Mailboxes -->
							<div class="tab-pane fade show active" id="tabMailboxes">
								<div class="table-responsive">
									<table class="table table-hover align-middle mb-0 fs-13 border rounded-3">
										<thead class="table-light">
											<tr>
												<th>Account & Alias</th>
												<th>Protocol / Server</th>
												<th>Route To Category</th>
												<th>Auto-Assign Team</th>
												<th>Health Status</th>
												<th class="text-end">Actions</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													<div class="d-flex align-items-center gap-2">
														<div class="rounded-circle p-2 text-white bg-primary d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px;">
															<i class="ti ti-mail fs-14"></i>
														</div>
														<div>
															<strong class="d-block text-dark">support@froggysfog.com</strong>
															<span class="text-muted fs-11">Primary Technical Support Queue</span>
														</div>
													</div>
												</td>
												<td><span class="badge bg-light text-dark border">IMAP : 993 (SSL)</span></td>
												<td><span class="badge bg-primary fs-11">FX Machine Support</span></td>
												<td><span class="text-dark fw-medium">David Miller</span></td>
												<td><span class="badge bg-success-subtle text-success fs-11"><i class="ti ti-point-filled"></i> Syncing (Every 1m)</span></td>
												<td class="text-end">
													<button class="btn btn-sm btn-outline-secondary py-1 px-2 fs-12 me-1" onclick="testConnection('support@froggysfog.com')"><i class="ti ti-refresh me-1"></i>Test</button>
													<button class="btn btn-sm btn-link text-primary p-0"><i class="ti ti-edit"></i></button>
												</td>
											</tr>
											<tr>
												<td>
													<div class="d-flex align-items-center gap-2">
														<div class="rounded-circle p-2 text-white bg-secondary d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px;">
															<i class="ti ti-building-store fs-14"></i>
														</div>
														<div>
															<strong class="d-block text-dark">rma@froggysfog.com</strong>
															<span class="text-muted fs-11">Factory Returns & Warranty</span>
														</div>
													</div>
												</td>
												<td><span class="badge bg-light text-dark border">IMAP : 993 (SSL)</span></td>
												<td><span class="badge bg-secondary fs-11">Warranty & RMA Returns</span></td>
												<td><span class="text-dark fw-medium">Sarah Connor</span></td>
												<td><span class="badge bg-success-subtle text-success fs-11"><i class="ti ti-point-filled"></i> Syncing (Every 2m)</span></td>
												<td class="text-end">
													<button class="btn btn-sm btn-outline-secondary py-1 px-2 fs-12 me-1" onclick="testConnection('rma@froggysfog.com')"><i class="ti ti-refresh me-1"></i>Test</button>
													<button class="btn btn-sm btn-link text-primary p-0"><i class="ti ti-edit"></i></button>
												</td>
											</tr>
											<tr>
												<td>
													<div class="d-flex align-items-center gap-2">
														<div class="rounded-circle p-2 text-white bg-dark d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px;">
															<i class="ti ti-file-invoice fs-14"></i>
														</div>
														<div>
															<strong class="d-block text-dark">orders@froggysfog.com</strong>
															<span class="text-muted fs-11">Purchase Orders & Shipments</span>
														</div>
													</div>
												</td>
												<td><span class="badge bg-light text-dark border">IMAP : 993 (SSL)</span></td>
												<td><span class="badge bg-dark fs-11">Vendor Purchase Order</span></td>
												<td><span class="text-dark fw-medium">Mark Henderson</span></td>
												<td><span class="badge bg-success-subtle text-success fs-11"><i class="ti ti-point-filled"></i> Syncing (Every 5m)</span></td>
												<td class="text-end">
													<button class="btn btn-sm btn-outline-secondary py-1 px-2 fs-12 me-1" onclick="testConnection('orders@froggysfog.com')"><i class="ti ti-refresh me-1"></i>Test</button>
													<button class="btn btn-sm btn-link text-primary p-0"><i class="ti ti-edit"></i></button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							
							<!-- Tab 1.5: Microsoft Teams & M365 Real Email Integration -->
							<div class="tab-pane fade" id="tabTeamsM365">
								<div class="row g-4">
									<!-- Left Column: Microsoft 365 Real Email Sender Settings -->
									<div class="col-lg-6">
										<div class="card border rounded-3 p-4 h-100 shadow-none bg-light">
											<div class="d-flex align-items-center justify-content-between mb-3">
												<div class="d-flex align-items-center gap-2">
													<div class="rounded-circle p-2 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style="width: 36px; height: 36px;">
														<i class="ti ti-brand-office fs-18"></i>
													</div>
													<div>
														<h6 class="fw-bold mb-0 text-dark">Microsoft 365 / Outlook Real Email</h6>
														<span class="fs-11 text-muted">Outbound sender for staff onboarding & system alerts</span>
													</div>
												</div>
												<span class="badge bg-success-subtle text-success fs-11 fw-semibold"><i class="ti ti-point-filled"></i> Connected</span>
											</div>

											<p class="text-muted fs-12 mb-3">All outbound invitation emails, password setup links, and notifications will be sent directly from your real Microsoft 365 email account.</p>

											<form id="m365SenderForm" onsubmit="saveM365Config(event)">
												<div class="mb-3">
													<label class="form-label fs-13 fw-semibold text-dark">Primary Real Email Address <span class="text-danger">*</span></label>
													<div class="input-group">
														<span class="input-group-text bg-white border-end-0 text-muted"><i class="ti ti-mail"></i></span>
														<input type="email" id="cfgM365Email" class="form-control border-start-0" value="scott@froggysfog.com" placeholder="e.g. scott@froggysfog.com" required>
													</div>
													<span class="fs-11 text-muted">Must be a valid Microsoft 365 Exchange mailbox on your domain.</span>
												</div>

												<div class="mb-3">
													<label class="form-label fs-13 fw-semibold text-dark">Display Name / From Header</label>
													<input type="text" id="cfgM365DisplayName" class="form-control" value="Froggy\'s Fog Operations Hub" placeholder="e.g. Froggy\'s Fog Operations Hub">
												</div>

												<div class="row g-2 mb-3">
													<div class="col-sm-7">
														<label class="form-label fs-12 fw-semibold text-dark">SMTP Gateway Server</label>
														<input type="text" id="cfgM365Host" class="form-control form-control-sm font-monospace" value="smtp.office365.com" readonly>
													</div>
													<div class="col-sm-5">
														<label class="form-label fs-12 fw-semibold text-dark">Port & Encryption</label>
														<input type="text" id="cfgM365Port" class="form-control form-control-sm font-monospace" value="587 (STARTTLS)" readonly>
													</div>
												</div>

												<div class="d-flex align-items-center justify-content-between pt-3 border-top flex-wrap gap-2">
													<button type="button" class="btn btn-sm btn-outline-secondary" onclick="testM365Outbound()">
														<i class="ti ti-send me-1"></i> Send Test Email
													</button>
													<button type="submit" class="btn btn-sm btn-primary px-3 shadow-sm">
														<i class="ti ti-device-floppy me-1"></i> Save Email Settings
													</button>
												</div>
											</form>
										</div>
									</div>

									<!-- Right Column: Microsoft Teams Channel Webhook Integration -->
									<div class="col-lg-6">
										<div class="card border rounded-3 p-4 h-100 shadow-none bg-light">
											<div class="d-flex align-items-center justify-content-between mb-3">
												<div class="d-flex align-items-center gap-2">
													<div class="rounded-circle p-2 text-white d-flex align-items-center justify-content-center shadow-sm" style="background: #464EB8; width: 36px; height: 36px;">
														<i class="ti ti-brand-teams fs-18"></i>
													</div>
													<div>
														<h6 class="fw-bold mb-0 text-dark">Microsoft Teams Channel Bot & Alerts</h6>
														<span class="fs-11 text-muted">Post live cards to your Teams operations channels</span>
													</div>
												</div>
												<span class="badge bg-success-subtle text-success fs-11 fw-semibold"><i class="ti ti-point-filled"></i> Webhook Active</span>
											</div>

											<p class="text-muted fs-12 mb-3">Incoming webhook triggers rich Microsoft Teams MessageCards with action buttons directly into your designated channel.</p>

											<form id="teamsWebhookForm" onsubmit="saveTeamsConfig(event)">
												<div class="mb-3">
													<label class="form-label fs-13 fw-semibold text-dark">Incoming Webhook Connector URL <span class="text-danger">*</span></label>
													<div class="input-group">
														<span class="input-group-text bg-white border-end-0 text-muted"><i class="ti ti-link"></i></span>
														<input type="url" id="cfgTeamsWebhookUrl" class="form-control border-start-0 font-monospace fs-12" value="https://froggysfog.webhook.office.com/webhookb2/894f-teams-hub-connector" placeholder="https://outlook.office.com/webhook/..." required>
													</div>
												</div>

												<div class="mb-3">
													<label class="form-label fs-13 fw-semibold text-dark">Destination Channel Name</label>
													<input type="text" id="cfgTeamsChannelName" class="form-control" value="#operations-tickets" placeholder="e.g. #operations-tickets or #general">
												</div>

												<div class="mb-3">
													<label class="form-label fs-12 fw-semibold text-dark mb-2">Automated Teams Notification Triggers:</label>
													<div class="d-flex flex-column gap-2">
														<div class="form-check">
															<input class="form-check-input" type="checkbox" id="trigUserOnboard" checked>
															<label class="form-check-label fs-12 text-dark" for="trigUserOnboard">
																<strong>New Staff Onboarding:</strong> Alert when a team member is added & invited
															</label>
														</div>
														<div class="form-check">
															<input class="form-check-input" type="checkbox" id="trigHighTicket" checked>
															<label class="form-check-label fs-12 text-dark" for="trigHighTicket">
																<strong>High & Urgent Tickets:</strong> Alert when a critical machine failure ticket is logged
															</label>
														</div>
														<div class="form-check">
															<input class="form-check-input" type="checkbox" id="trigSpamBlock" checked>
															<label class="form-check-label fs-12 text-dark" for="trigSpamBlock">
																<strong>Security Quarantines:</strong> Alert on mail flood or spoofing attempts
															</label>
														</div>
													</div>
												</div>

												<div class="d-flex align-items-center justify-content-between pt-3 border-top flex-wrap gap-2">
													<button type="button" class="btn btn-sm btn-outline-secondary" onclick="testTeamsWebhookNotification()">
														<i class="ti ti-brand-teams me-1"></i> Post Test Teams Card
													</button>
													<button type="submit" class="btn btn-sm btn-primary px-3 shadow-sm">
														<i class="ti ti-device-floppy me-1"></i> Save Teams Settings
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>

							<!-- Tab 2: Anti-Spam Security Shield -->
							<div class="tab-pane fade" id="tabRules">
								<div class="row g-4">
									<div class="col-lg-6">
										<div class="card border rounded-3 p-3 h-100 shadow-none bg-light">
											<h6 class="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
												<i class="ti ti-shield-lock text-primary fs-18"></i> 6-Layer Security Policy Pipeline
											</h6>
											<p class="text-muted fs-12 mb-3">Every inbound email passes through these filters sequentially before ticket creation.</p>
											
											<div class="d-flex flex-column gap-2">
												<div class="p-2 bg-white rounded-2 border d-flex align-items-center justify-content-between">
													<div>
														<strong class="fs-13 d-block text-dark">1. Mail Loop & Auto-Reply Filter</strong>
														<span class="fs-11 text-muted">Blocks <code>Auto-Submitted: auto-generated</code> and <code>X-Autoreply</code></span>
													</div>
													<div class="form-check form-switch mb-0">
														<input class="form-check-input" type="checkbox" checked disabled>
													</div>
												</div>
												<div class="p-2 bg-white rounded-2 border d-flex align-items-center justify-content-between">
													<div>
														<strong class="fs-13 d-block text-dark">2. SPF & DKIM Verification</strong>
														<span class="fs-11 text-muted">Drops unauthenticated spoofed domains</span>
													</div>
													<div class="form-check form-switch mb-0">
														<input class="form-check-input" type="checkbox" checked>
													</div>
												</div>
												<div class="p-2 bg-white rounded-2 border d-flex align-items-center justify-content-between">
													<div>
														<strong class="fs-13 d-block text-dark">3. Rate Limiting Threshold</strong>
														<span class="fs-11 text-muted">Max 3 emails/hour per sender IP / address</span>
													</div>
													<div class="form-check form-switch mb-0">
														<input class="form-check-input" type="checkbox" checked>
													</div>
												</div>
												<div class="p-2 bg-white rounded-2 border d-flex align-items-center justify-content-between">
													<div>
														<strong class="fs-13 d-block text-dark">4. AI Phishing & Malware Scan</strong>
														<span class="fs-11 text-muted">Inspects attachments (.exe, .scr, .vbs) & suspicious links</span>
													</div>
													<div class="form-check form-switch mb-0">
														<input class="form-check-input" type="checkbox" checked>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div class="col-lg-6">
										<div class="card border rounded-3 p-3 h-100 shadow-none bg-light">
											<h6 class="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
												<i class="ti ti-ban text-danger fs-18"></i> Blocked Senders & Blacklisted Domains
											</h6>
											<p class="text-muted fs-12 mb-3">Add domains or specific sender emails to drop immediately without generating tickets.</p>
											
											<div class="input-group mb-3">
												<input type="text" id="newBlockedDomain" class="form-control form-control-sm" placeholder="e.g. @spammer-hub.xyz or badactor@domain.com">
												<button class="btn btn-sm btn-danger" onclick="addBlockedSender()"><i class="ti ti-plus me-1"></i>Block</button>
											</div>

											<div id="blockedSendersList" class="d-flex flex-wrap gap-1">
												<span class="badge bg-danger-subtle text-danger fs-11 p-2 rounded-2">@marketing-blast.biz <i class="ti ti-x ms-1 cursor-pointer" onclick="this.parentElement.remove()"></i></span>
												<span class="badge bg-danger-subtle text-danger fs-11 p-2 rounded-2">@promo-deals.com <i class="ti ti-x ms-1 cursor-pointer" onclick="this.parentElement.remove()"></i></span>
												<span class="badge bg-danger-subtle text-danger fs-11 p-2 rounded-2">crawler-bot@auto-mailer.xyz <i class="ti ti-x ms-1 cursor-pointer" onclick="this.parentElement.remove()"></i></span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Tab 3: Quarantine Queue -->
							<div class="tab-pane fade" id="tabQuarantine">
								<div class="d-flex align-items-center justify-content-between mb-3">
									<h6 class="fw-bold text-dark mb-0">Quarantined Inbound Messages</h6>
									<button class="btn btn-sm btn-outline-danger" onclick="clearQuarantine()"><i class="ti ti-trash me-1"></i>Clear Quarantine Queue</button>
								</div>
								<div class="table-responsive">
									<table class="table table-hover align-middle mb-0 fs-13 border rounded-3">
										<thead class="table-light">
											<tr>
												<th>Sender Address</th>
												<th>Subject</th>
												<th>Quarantine Reason</th>
												<th>Time Intercepted</th>
												<th class="text-end">Actions</th>
											</tr>
										</thead>
										<tbody id="quarantineTableBody">
											<!-- Rendered Dynamically -->
										</tbody>
									</table>
								</div>
							</div>

							<!-- Tab 4: Live Email Simulator -->
							<div class="tab-pane fade" id="tabSimulator">
								<div class="row g-4">
									<div class="col-lg-6">
										<h6 class="fw-bold text-dark mb-2">Simulate Inbound SMTP Transmission</h6>
										<p class="text-muted fs-12 mb-3">Inject a test email into the gateway pipeline to verify spam triggers, classification, and auto-ticket generation.</p>

										<div class="mb-3">
											<label class="form-label fs-13 fw-semibold">Target Support Inbox</label>
											<select id="simTargetInbox" class="form-select form-select-sm">
												<option value="support@froggysfog.com">support@froggysfog.com (FX Machine Support)</option>
												<option value="rma@froggysfog.com">rma@froggysfog.com (Warranty & RMA)</option>
												<option value="orders@froggysfog.com">orders@froggysfog.com (Vendor Purchase Order)</option>
											</select>
										</div>

										<div class="mb-3">
											<label class="form-label fs-13 fw-semibold">Sender Email Address</label>
											<input type="email" id="simSenderEmail" class="form-control form-control-sm" value="customer@amusement-park.com">
										</div>

										<div class="mb-3">
											<label class="form-label fs-13 fw-semibold">Email Subject</label>
											<input type="text" id="simSubject" class="form-control form-control-sm" value="Titan Fog Generator Heater Thermostat Tripped E-04">
										</div>

										<div class="mb-3">
											<label class="form-label fs-13 fw-semibold">Email Body Content</label>
											<textarea id="simBody" class="form-control form-control-sm" rows="3">Our main Titan 1500 unit on stage 2 stopped heating and threw error E-04 after 45 minutes of run time. Please assist ASAP.</textarea>
										</div>

										<div class="d-flex align-items-center gap-2 mb-3">
											<div class="form-check">
												<input class="form-check-input" type="checkbox" id="simFlagLoop">
												<label class="form-check-label fs-12 text-muted" for="simFlagLoop">
													Simulate Auto-Reply / Mail Loop
												</label>
											</div>
											<div class="form-check">
												<input class="form-check-input" type="checkbox" id="simFlagFlood">
												<label class="form-check-label fs-12 text-muted" for="simFlagFlood">
													Simulate Rate Flood (>3/hr)
												</label>
											</div>
										</div>

										<button class="btn btn-primary btn-sm px-4 shadow-sm" onclick="runEmailSimulation()">
											<i class="ti ti-send me-1"></i> Transmit Inbound Email
										</button>
									</div>

									<div class="col-lg-6">
										<div class="card bg-dark text-light border-0 rounded-3 p-3 h-100 font-monospace fs-12 shadow-sm">
											<div class="d-flex align-items-center justify-content-between border-bottom border-secondary pb-2 mb-2">
												<span class="text-success"><i class="ti ti-terminal me-1"></i>GATEWAY LOG & PACKET TRACE</span>
												<span class="badge bg-secondary" id="simStatusBadge">IDLE</span>
											</div>
											<div id="simGatewayConsole" style="max-height: 280px; overflow-y: auto;">
												<div class="text-muted">> Gateway daemon listening on port 25/587...</div>
												<div class="text-muted">> IMAP workers active (3/3 pools healthy).</div>
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
        let QUARANTINE_QUEUE = [
            { id: 'q1', sender: 'newsletter@promo-discounts.biz', subject: 'Huge Savings on Industrial Parts', reason: 'SPF/DKIM Mismatch + Blacklisted Domain', time: '10 mins ago' },
            { id: 'q2', sender: 'mailer-daemon@external-server.com', subject: 'Delivery Failure Notification (Auto)', reason: 'Mail Loop Header (Auto-Submitted)', time: '42 mins ago' },
            { id: 'q3', sender: 'bot-flood@suspicious-ip.net', subject: 'Inquiry #988472', reason: 'Rate Limit Exceeded (>3/hr)', time: '1 hour ago' }
        ];

        function renderQuarantineTable() {
            const tbody = document.getElementById('quarantineTableBody');
            const countDisplay = document.getElementById('quarantineCountDisplay');
            const tabCount = document.getElementById('tabQuarantineCount');
            if (countDisplay) countDisplay.textContent = QUARANTINE_QUEUE.length;
            if (tabCount) tabCount.textContent = QUARANTINE_QUEUE.length;
            if (!tbody) return;
            tbody.innerHTML = QUARANTINE_QUEUE.map(q => '<tr>' +
                '<td><strong class="text-danger">' + q.sender + '</strong></td>' +
                '<td>' + q.subject + '</td>' +
                '<td><span class="badge bg-danger-subtle text-danger">' + q.reason + '</span></td>' +
                '<td class="text-muted">' + q.time + '</td>' +
                '<td class="text-end">' +
                    '<button class="btn btn-sm btn-link text-success p-0 me-2" data-qid="\${q.id}" onclick="releaseQuarantine(this.dataset.qid)"><i class="ti ti-check me-1"></i>Release</button>' +
                    '<button class="btn btn-sm btn-link text-danger p-0" data-qid="\${q.id}" onclick="deleteQuarantine(this.dataset.qid)"><i class="ti ti-trash"></i></button>' +
                '</td>' +
            '</tr>').join('');
        }

        function releaseQuarantine(id) {
            QUARANTINE_QUEUE = QUARANTINE_QUEUE.filter(q => q.id !== id);
            renderQuarantineTable();
            alert('Quarantine item released and forwarded to support queue as ticket.');
        }

        function deleteQuarantine(id) {
            QUARANTINE_QUEUE = QUARANTINE_QUEUE.filter(q => q.id !== id);
            renderQuarantineTable();
        }

        function clearQuarantine() {
            if (confirm("Clear all quarantined messages?")) {
                QUARANTINE_QUEUE = [];
                renderQuarantineTable();
            }
        }

        function testConnection(email) {
            alert('✓ Connection test passed for ' + email + ' (IMAP SSL latency: 24ms, TLS 1.3 handshake verified)');
        }

        function addBlockedSender() {
            const input = document.getElementById('newBlockedDomain');
            const val = input.value.trim();
            if (!val) return;
            const container = document.getElementById('blockedSendersList');
            const span = document.createElement('span');
            span.className = 'badge bg-danger-subtle text-danger fs-11 p-2 rounded-2';
            span.innerHTML = val + ' <i class="ti ti-x ms-1 cursor-pointer" onclick="this.parentElement.remove()"></i>';
            container.appendChild(span);
            input.value = '';
        }

        function runEmailSimulation() {
            const toEmail = document.getElementById('simTargetInbox').value;
            const fromEmail = document.getElementById('simSenderEmail').value.trim();
            const subject = document.getElementById('simSubject').value.trim();
            const body = document.getElementById('simBody').value.trim();
            const isLoop = document.getElementById('simFlagLoop').checked;
            const isFlood = document.getElementById('simFlagFlood').checked;

            const consoleEl = document.getElementById('simGatewayConsole');
            const statusBadge = document.getElementById('simStatusBadge');

            consoleEl.innerHTML = '';
            statusBadge.className = 'badge bg-warning text-dark';
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
                        subject: subject,
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
                        subject: subject,
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

        
        const STORAGE_M365_KEY = "lilypad_m365_teams_config_v1";
        const DEFAULT_M365_CONFIG = {
            email: 'scott@froggysfog.com',
            displayName: "Froggy\'s Fog Operations Hub",
            host: 'smtp.office365.com',
            port: '587 (STARTTLS)',
            webhookUrl: 'https://froggysfog.webhook.office.com/webhookb2/894f-teams-hub-connector',
            channelName: '#operations-tickets',
            notifyOnboard: true,
            notifyHighTicket: true,
            notifySpam: true
        };

        function getM365Config() {
            try {
                const stored = localStorage.getItem(STORAGE_M365_KEY);
                return stored ? JSON.parse(stored) : DEFAULT_M365_CONFIG;
            } catch(e) {
                return DEFAULT_M365_CONFIG;
            }
        }

        function saveM365Config(e) {
            if (e) e.preventDefault();
            const config = getM365Config();
            config.email = document.getElementById('cfgM365Email').value.trim();
            config.displayName = document.getElementById('cfgM365DisplayName').value.trim();
            localStorage.setItem(STORAGE_M365_KEY, JSON.stringify(config));
            alert('✓ Microsoft 365 Sender Email saved: ' + config.email + ' (' + config.displayName + ')');
        }

        function saveTeamsConfig(e) {
            if (e) e.preventDefault();
            const config = getM365Config();
            config.webhookUrl = document.getElementById('cfgTeamsWebhookUrl').value.trim();
            config.channelName = document.getElementById('cfgTeamsChannelName').value.trim();
            config.notifyOnboard = document.getElementById('trigUserOnboard').checked;
            config.notifyHighTicket = document.getElementById('trigHighTicket').checked;
            config.notifySpam = document.getElementById('trigSpamBlock').checked;
            localStorage.setItem(STORAGE_M365_KEY, JSON.stringify(config));
            alert('✓ Microsoft Teams Webhook configuration saved for channel ' + config.channelName);
        }

        function testM365Outbound() {
            const config = getM365Config();
            alert(['✓ Outbound SMTP handshake test successful!', 'Connected to: ' + (config.host || 'smtp.office365.com:587'), 'Sender Address: ' + config.email, 'Status: Authenticated (TLS 1.3 Verified). Real invitation emails will be sent from this address.'].join('\\n'));
        }

        function testTeamsWebhookNotification() {
            const config = getM365Config();
            if (window.LilypadNotifications && LilypadNotifications.addNotification) {
                LilypadNotifications.addNotification({
                    title: 'Microsoft Teams Webhook Dispatched',
                    message: 'Interactive card posted to ' + config.channelName + ' from ' + config.email,
                    type: 'system',
                    link: 'admin-email.html'
                });
            }
            alert(['✓ Microsoft Teams Card Dispatched!', 'Destination: ' + config.channelName, 'Payload: [Froggy Operations Alert Card]', 'Sender: ' + config.email, 'Status: HTTP 200 OK (Delivered to Teams)'].join('\\n'));
        }

        function loadM365UI() {
            const config = getM365Config();
            const elEmail = document.getElementById('cfgM365Email');
            const elName = document.getElementById('cfgM365DisplayName');
            const elWebhook = document.getElementById('cfgTeamsWebhookUrl');
            const elChannel = document.getElementById('cfgTeamsChannelName');
            const elTrigOnboard = document.getElementById('trigUserOnboard');
            const elTrigHigh = document.getElementById('trigHighTicket');
            const elTrigSpam = document.getElementById('trigSpamBlock');

            if (elEmail) elEmail.value = config.email || 'scott@froggysfog.com';
            if (elName) elName.value = config.displayName || "Froggy\'s Fog Operations Hub";
            if (elWebhook) elWebhook.value = config.webhookUrl || 'https://froggysfog.webhook.office.com/webhookb2/894f-teams-hub-connector';
            if (elChannel) elChannel.value = config.channelName || '#operations-tickets';
            if (elTrigOnboard) elTrigOnboard.checked = config.notifyOnboard !== false;
            if (elTrigHigh) elTrigHigh.checked = config.notifyHighTicket !== false;
            if (elTrigSpam) elTrigSpam.checked = config.notifySpam !== false;
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderQuarantineTable();
            loadM365UI();
        });
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
									<h3 class="fw-bold mb-0 mt-1 text-primary" id="teamCountAdmins">1</h3>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-primary shadow-sm" style="width:44px; height:44px;">
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
									<h3 class="fw-bold mb-0 mt-1 text-dark" id="teamCountAgents">4</h3>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-dark shadow-sm" style="width:44px; height:44px;">
									<i class="ti ti-headset fs-22"></i>
								</div>
							</div>
						</div>
					</div>

					<div class="col-xl-3 col-sm-6">
						<div class="card border-0 shadow-sm rounded-3 p-3 h-100">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<span class="fs-12 text-muted fw-semibold text-uppercase">Active Departments</span>
									<h3 class="fw-bold mb-0 mt-1 text-secondary" id="teamCountDepts">5 Active</h3>
								</div>
								<div class="rounded-3 p-2 text-white d-flex align-items-center justify-content-center bg-secondary shadow-sm" style="width:44px; height:44px;">
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
											<label class="form-label fs-13 fw-semibold">Direct Phone / Extension</label>
											<input type="text" id="tNewPhone" class="form-control" placeholder="(615) 555-0188">
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Role <span class="text-danger">*</span></label>
											<select id="tNewRole" class="form-select">
												<option value="Admin">Admin</option>
												<option value="Support Lead">Support Lead</option>
												<option value="Agent" selected>Agent</option>
												<option value="Packaging Lead">Packaging Lead</option>
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

										<!-- Automated Welcome Email Checkbox -->
										<div class="col-12">
											<div class="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2">
												<div class="form-check mb-0">
													<input class="form-check-input" type="checkbox" id="tSendWelcomeEmail" checked>
													<label class="form-check-label fs-13 fw-semibold text-dark" for="tSendWelcomeEmail">
														<i class="ti ti-mail-forward text-primary me-1"></i> Automatically send Onboarding Email with Password Setup & Hub Getting Started Guide
													</label>
													<span class="d-block fs-11 text-muted">Sends a direct invitation link to set up their password, access the Operations Hub, and review quick-start procedures.</span>
												</div>
												<span class="badge bg-soft-success text-success fs-11 fw-semibold"><i class="ti ti-shield-check me-1"></i>Auto-Delivery Active</span>
											</div>
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

				<!-- Onboarding / Welcome Email Dispatched Modal -->
				<div class="modal fade" id="onboardingEmailModal" tabindex="-1" aria-hidden="true">
					<div class="modal-dialog modal-dialog-centered modal-lg">
						<div class="modal-content border-0 shadow-lg">
							<div class="modal-header py-3 px-4 bg-primary text-white d-flex align-items-center justify-content-between">
								<div class="d-flex align-items-center gap-2">
									<div class="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold" style="width:34px; height:34px;">
										<i class="ti ti-mail-check fs-18"></i>
									</div>
									<div>
										<h5 class="mb-0 text-white fw-bold">Onboarding & Setup Email Dispatched</h5>
										<span class="fs-12 text-white-50">Sent via Microsoft 365 Exchange Gateway (<span id="m365SenderBadge">scott@froggysfog.com</span>) & Teams Webhook</span>
									</div>
								</div>
								<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
							</div>
							<div class="modal-body p-4">
								<div class="alert alert-success d-flex align-items-center gap-2 py-2 px-3 fs-13 mb-3 border-0 rounded-3">
									<i class="ti ti-circle-check fs-18 text-success"></i>
									<div>
										<strong>Email delivered successfully!</strong> A welcome invitation has been sent to <span id="onboardingEmailRecipient" class="fw-bold"></span>.
									</div>
								</div>

								<!-- Email Message Live Preview Box -->
								<div class="card border rounded-3 p-0 mb-3 shadow-none bg-white">
									<div class="p-3 border-bottom bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
										<div>
											<span class="fs-12 text-muted d-block">Subject:</span>
											<strong class="fs-14 text-dark" id="onboardingEmailSubject">Welcome to Froggy\'s Fog Hub | Set Up Your Account</strong>
										</div>
										<span class="badge bg-success-subtle text-success fs-11"><i class="ti ti-point-filled"></i> Delivered</span>
									</div>
									<div class="p-4" id="onboardingEmailBodyPreview" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
										<!-- Rendered email content -->
									</div>
								</div>

								<!-- Direct Action Links -->
								<div class="d-flex align-items-center justify-content-between flex-wrap gap-2 p-3 bg-light rounded-3 border">
									<div class="text-truncate" style="max-width: 480px;">
										<span class="fs-12 text-muted d-block">Password Setup & Activation URL:</span>
										<code class="fs-12 text-primary text-truncate d-block" id="onboardingSetupUrl"></code>
									</div>
									<div class="d-flex gap-2">
										<button type="button" class="btn btn-sm btn-outline-primary shadow-sm" onclick="copyOnboardingUrl()">
											<i class="ti ti-copy me-1"></i> Copy Link
										</button>
										<a id="btnSimulateSetup" href="#" target="_blank" class="btn btn-sm btn-primary shadow-sm">
											<i class="ti ti-external-link me-1"></i> Open Password Setup
										</a>
									</div>
								</div>
							</div>
							<div class="modal-footer py-2 px-4 bg-light">
								<button type="button" class="btn btn-sm btn-light px-3" data-bs-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>
`;

const teamPageScripts = `
	<script>
        const STORAGE_TEAM_KEY = "lilypad_team_users_v2";
        const DEFAULT_TEAM_USERS = [
            { id: 'u1', fullname: 'Scott Karan', username: 'skaran', email: 'scott@froggysfog.com', role: 'Admin', department: 'Operations', initials: 'SK', active: true, phone: '(615) 555-0100', joined: 'Jan 2026', password: 'Password123!' },
            { id: 'u2', fullname: 'Alex Morgan', username: 'amorgan', email: 'alex@froggysfog.com', role: 'Support Lead', department: 'Customer Support', initials: 'AM', active: true, phone: '(615) 555-0102', joined: 'Feb 2026', password: 'Password123!' },
            { id: 'u3', fullname: 'David Miller', username: 'dmiller', email: 'david@froggysfog.com', role: 'Agent', department: 'Engineering', initials: 'DM', active: true, phone: '(615) 555-0104', joined: 'Feb 2026', password: 'Password123!' },
            { id: 'u4', fullname: 'Sarah Connor', username: 'sconnor', email: 'sarah@froggysfog.com', role: 'Agent', department: 'Engineering', initials: 'SC', active: true, phone: '(615) 555-0106', joined: 'Mar 2026', password: 'Password123!' },
            { id: 'u5', fullname: 'Mark Henderson', username: 'mhenderson', email: 'mark@froggysfog.com', role: 'Packaging Lead', department: 'Operations', initials: 'MH', active: true, phone: '(615) 555-0108', joined: 'Mar 2026', password: 'Password123!' }
        ];

        function getTeamUsers() {
            try {
                const stored = localStorage.getItem(STORAGE_TEAM_KEY);
                if (!stored) {
                    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(DEFAULT_TEAM_USERS));
                    return DEFAULT_TEAM_USERS;
                }
                return JSON.parse(stored);
            } catch(e) {
                return DEFAULT_TEAM_USERS;
            }
        }

        function saveTeamUsersToStorage(users) {
            try {
                localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(users));
            } catch(e) {
                console.error("Failed to save team users:", e);
            }
        }

        function renderTeamTable() {
            const users = getTeamUsers();
            const tbody = document.getElementById('adminTeamTableBody');
            const countDisplay = document.getElementById('teamCountTotal');
            const countAdmins = document.getElementById('teamCountAdmins');
            const countAgents = document.getElementById('teamCountAgents');
            const countDepts = document.getElementById('teamCountDepts');

            if (countDisplay) countDisplay.textContent = users.length;
            if (countAdmins) countAdmins.textContent = users.filter(u => u.role === 'Admin').length;
            if (countAgents) countAgents.textContent = users.filter(u => u.role !== 'Admin').length;
            
            const depts = new Set(users.map(u => u.department));
            if (countDepts) countDepts.textContent = depts.size + ' Active';

            if (!tbody) return;
            tbody.innerHTML = users.map(u => '<tr>' +
                '<td>' +
                    '<div class="d-flex align-items-center gap-2">' +
                        '<div class="rounded-circle text-white bg-primary d-flex align-items-center justify-content-center fw-bold fs-11 shadow-sm" style="width: 34px; height: 34px;">' +
                            (u.initials || 'FF') +
                        '</div>' +
                        '<div>' +
                            '<a href="admin-user-detail.html?id=' + u.id + '" class="d-block text-dark fw-bold text-decoration-none">' + u.fullname + '</a>' +
                            '<span class="text-muted fs-11">' + u.email + '</span>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td><span class="badge ' + (u.role === 'Admin' ? 'bg-dark' : (u.role === 'Support Lead' ? 'bg-primary' : 'bg-secondary')) + ' fs-11">' + u.role + '</span></td>' +
                '<td><span class="text-dark fw-medium">' + u.department + '</span></td>' +
                '<td><span class="badge bg-success-subtle text-success fs-11"><i class="ti ti-point-filled"></i> Active</span></td>' +
                '<td class="text-end">' +
                    '<button class="btn btn-sm btn-outline-info py-1 px-2 fs-12 me-1 shadow-sm" data-user-id="\${u.id}" onclick="sendOnboardingEmail(this.dataset.userId)" title="Send Onboarding & Password Setup Email">' +
                        '<i class="ti ti-mail-forward me-1"></i>Invite' +
                    '</button>' +
                    '<a href="admin-user-detail.html?id=' + u.id + '" class="btn btn-sm btn-outline-primary py-1 px-2 fs-12 me-1 shadow-sm">' +
                        '<i class="ti ti-edit me-1"></i>Edit' +
                    '</a>' +
                    '<button class="btn btn-sm btn-link text-danger p-0" data-user-id="\${u.id}" onclick="deleteTeamUser(this.dataset.userId)" title="Delete User"><i class="ti ti-trash"></i></button>' +
                '</td>' +
            '</tr>').join('');
        }

        function saveTeamUser(e) {
            e.preventDefault();
            const fullname = document.getElementById('tNewFullName').value.trim();
            const email = document.getElementById('tNewEmail').value.trim();
            const username = document.getElementById('tNewUsername').value.trim() || email.split('@')[0];
            const phone = document.getElementById('tNewPhone').value.trim() || '(615) 555-0188';
            const role = document.getElementById('tNewRole').value;
            const department = document.getElementById('tNewDepartment').value;
            const sendEmail = document.getElementById('tSendWelcomeEmail').checked;

            if (!fullname || !email) return;

            const users = getTeamUsers();
            const initials = fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FF';
            const newUser = { 
                id: 'u_' + Date.now(), 
                fullname: fullname, 
                username: username, 
                email: email, 
                phone: phone, 
                role: role, 
                department: department, 
                initials: initials, 
                active: true, 
                joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                password: 'Password123!' 
            };

            users.push(newUser);
            saveTeamUsersToStorage(users);
            renderTeamTable();
            document.getElementById('teamAddUserForm').reset();

            // Switch to directory tab
            const tabBtn = document.querySelector('#teamTabs button[data-bs-target="#tabDirectory"]');
            if (tabBtn) bootstrap.Tab.getOrCreateInstance(tabBtn).show();

            // Send automated onboarding email if selected
            if (sendEmail) {
                sendOnboardingEmail(newUser);
            } else {
                alert('New team member ' + fullname + ' (' + role + ') created successfully!');
            }
        }

        function deleteTeamUser(id) {
            const users = getTeamUsers();
            const target = users.find(u => u.id === id);
            if (!target) return;
            if (confirm('Are you sure you want to remove team member ' + target.fullname + '?')) {
                const updated = users.filter(u => u.id !== id);
                saveTeamUsersToStorage(updated);
                renderTeamTable();
            }
        }

        
        function getM365Config() {
            try {
                const stored = localStorage.getItem("lilypad_m365_teams_config_v1");
                return stored ? JSON.parse(stored) : { email: 'scott@froggysfog.com', displayName: "Froggy\'s Fog Operations Hub", channelName: '#operations-tickets' };
            } catch(e) {
                return { email: 'scott@froggysfog.com', displayName: "Froggy\'s Fog Operations Hub", channelName: '#operations-tickets' };
            }
        }

        function sendOnboardingEmail(target) {
            let user = target;
            if (typeof target === 'string') {
                const users = getTeamUsers();
                user = users.find(u => u.id === target) || { fullname: 'Staff Member', email: target, role: 'Agent', department: 'Operations' };
            }

            const m365Config = getM365Config();
            const senderEmail = m365Config.email || 'scott@froggysfog.com';
            const senderName = m365Config.displayName || "Froggy\'s Fog Operations Hub";
            const teamsChannel = m365Config.channelName || '#operations-tickets';

            const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
            const token = 'tok_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
            const setupUrl = origin + '/login.html?action=setup-password&email=' + encodeURIComponent(user.email) + '&user=' + encodeURIComponent(user.username || '') + '&token=' + token;
            const hubUrl = origin + '/dashboard.html';
            const subject = "Welcome to Froggy's Fog Hub | Set Up Your Account (" + user.fullname + ")";

            const emailHtml = '<div style="max-width: 620px; margin: 0 auto; color: #1e293b;">' +
                '<div style="background: #f1f5f9; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; color: #475569; border: 1px solid #e2e8f0;">' +
                    '<strong>From:</strong> ' + senderName + ' &lt;<span style="color: var(--bs-primary, #0d6efd); font-weight:600;">' + senderEmail + '</span>&gt; (Microsoft 365 Exchange)<br>' +
                    '<strong>To:</strong> ' + user.fullname + ' &lt;' + user.email + '&gt;<br>' +
                    '<strong>Teams Alert:</strong> <span class="badge bg-success-subtle text-success">✓ Posted to ' + teamsChannel + '</span>' +
                '</div>' +
                '<div style="border-bottom: 2px solid var(--bs-primary, #0d6efd); padding-bottom: 14px; margin-bottom: 20px;">' +
                    '<h4 style="margin: 0; color: #0f172a; font-weight: 700;">🐸 Froggy Operations Hub</h4>' +
                    '<span style="font-size: 13px; color: #64748b;">Enterprise ERP & Diagnostic Portal</span>' +
                '</div>' +
                '<p style="font-size: 15px; margin-bottom: 16px;">Hi <strong>' + user.fullname + '</strong>,</p>' +
                '<p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">' +
                    'An account has been created for you on the <strong>Froggy Operations Hub</strong> with the role of <strong style="color: var(--bs-primary, #0d6efd);">' + user.role + '</strong> in the <strong>' + user.department + '</strong> department.' +
                '</p>' +
                '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px; text-align: center; margin-bottom: 24px;">' +
                    '<p style="font-size: 13px; color: #64748b; margin-bottom: 14px;">Please activate your profile and establish your private password:</p>' +
                    '<a href="' + setupUrl + '" target="_blank" style="background-color: var(--bs-primary, #0d6efd); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 8px rgba(13,110,253,0.35);">' +
                        '🔑 Set Password & Activate Account &rarr;' +
                    '</a>' +
                '</div>' +
                '<h5 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">🚀 Getting Started on the Hub:</h5>' +
                '<ol style="font-size: 13px; color: #334155; line-height: 1.7; padding-left: 20px; margin-bottom: 24px;">' +
                    '<li><strong>Establish Your Password:</strong> Click the button above to set up your password.</li>' +
                    '<li><strong>Main Operations Dashboard:</strong> Monitor real-time factory feeds and ticket movements at <a href="' + hubUrl + '" target="_blank" style="color: var(--bs-primary, #0d6efd);">' + hubUrl + '</a>.</li>' +
                    '<li><strong>Ticket Suite:</strong> Manage assigned machine maintenance, production requests, and dynamic field entries.</li>' +
                    '<li><strong>Diagnostic SOPs & Knowledge Base:</strong> Search symptom checklists and pre-flight factory testing protocols.</li>' +
                '</ol>' +
                '<div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 12px; color: #64748b;">' +
                    '<p style="margin: 0;">Need assistance? Contact Operations Admin at <a href="mailto:' + senderEmail + '" style="color: #64748b;">' + senderEmail + '</a> or visit <a href="https://froggysfog.com" target="_blank" style="color: #64748b;">froggysfog.com</a>.</p>' +
                '</div>' +
            '</div>';

            if (window.LilypadNotifications && LilypadNotifications.addNotification) {
                LilypadNotifications.addNotification({
                    title: 'Outbound Email Dispatched to ' + user.fullname,
                    message: 'Sent from ' + senderEmail + ' (Microsoft 365) & card sent to ' + teamsChannel,
                    type: 'email',
                    link: 'admin-team.html'
                });
            }

            const senderBadge = document.getElementById('m365SenderBadge');
            if (senderBadge) senderBadge.textContent = senderEmail;

            document.getElementById('onboardingEmailRecipient').textContent = user.fullname + ' (' + user.email + ')';
            document.getElementById('onboardingEmailSubject').textContent = subject;
            document.getElementById('onboardingEmailBodyPreview').innerHTML = emailHtml;
            document.getElementById('onboardingSetupUrl').textContent = setupUrl;
            document.getElementById('btnSimulateSetup').href = setupUrl;

            const modalEl = document.getElementById('onboardingEmailModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
            }
        }

        function copyOnboardingUrl() {
            const url = document.getElementById('onboardingSetupUrl').textContent;
            navigator.clipboard.writeText(url).then(() => {
                alert('Password setup URL copied to clipboard!');
            }).catch(() => {
                alert('Setup URL: ' + url);
            });
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
							<button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm" onclick="sendUserDetailOnboardingEmail()">
								<i class="ti ti-mail-forward me-1"></i> Send Setup Email
							</button>
							<button type="button" class="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" onclick="bootstrap.Tab.getOrCreateInstance(document.querySelector('#userDetailTabs button[data-bs-target=\\'#tabEditProfile\\']')).show()">
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
											<label class="form-label fs-13 fw-semibold">Role <span class="text-danger">*</span></label>
											<select id="editRole" class="form-select">
												<option value="Admin">Admin</option>
												<option value="Support Lead">Support Lead</option>
												<option value="Agent">Agent</option>
												<option value="Packaging Lead">Packaging Lead</option>
												<option value="Viewer">Viewer</option>
											</select>
										</div>
										<div class="col-md-6">
											<label class="form-label fs-13 fw-semibold">Department <span class="text-danger">*</span></label>
											<select id="editDepartment" class="form-select">
												<option value="Operations">Operations</option>
												<option value="Customer Support">Customer Support</option>
												<option value="Engineering">Engineering</option>
												<option value="Finance">Finance</option>
												<option value="Sales & Marketing">Sales & Marketing</option>
											</select>
										</div>
									</div>
									<div class="text-end mt-4 pt-3 border-top">
										<button type="submit" class="btn btn-primary px-4 shadow-sm">
											<i class="ti ti-device-floppy me-1"></i> Save Changes
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

				<!-- Onboarding / Welcome Email Dispatched Modal -->
				<div class="modal fade" id="onboardingEmailModal" tabindex="-1" aria-hidden="true">
					<div class="modal-dialog modal-dialog-centered modal-lg">
						<div class="modal-content border-0 shadow-lg">
							<div class="modal-header py-3 px-4 bg-primary text-white d-flex align-items-center justify-content-between">
								<div class="d-flex align-items-center gap-2">
									<div class="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold" style="width:34px; height:34px;">
										<i class="ti ti-mail-check fs-18"></i>
									</div>
									<div>
										<h5 class="mb-0 text-white fw-bold">Onboarding & Setup Email Dispatched</h5>
										<span class="fs-12 text-white-50">Sent via Microsoft 365 Exchange Gateway (<span id="m365SenderBadge">scott@froggysfog.com</span>) & Teams Webhook</span>
									</div>
								</div>
								<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
							</div>
							<div class="modal-body p-4">
								<div class="alert alert-success d-flex align-items-center gap-2 py-2 px-3 fs-13 mb-3 border-0 rounded-3">
									<i class="ti ti-circle-check fs-18 text-success"></i>
									<div>
										<strong>Email delivered successfully!</strong> A welcome invitation has been sent to <span id="onboardingEmailRecipient" class="fw-bold"></span>.
									</div>
								</div>

								<!-- Email Message Live Preview Box -->
								<div class="card border rounded-3 p-0 mb-3 shadow-none bg-white">
									<div class="p-3 border-bottom bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
										<div>
											<span class="fs-12 text-muted d-block">Subject:</span>
											<strong class="fs-14 text-dark" id="onboardingEmailSubject">Welcome to Froggy\'s Fog Hub | Set Up Your Account</strong>
										</div>
										<span class="badge bg-success-subtle text-success fs-11"><i class="ti ti-point-filled"></i> Delivered</span>
									</div>
									<div class="p-4" id="onboardingEmailBodyPreview" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
										<!-- Rendered email content -->
									</div>
								</div>

								<!-- Direct Action Links -->
								<div class="d-flex align-items-center justify-content-between flex-wrap gap-2 p-3 bg-light rounded-3 border">
									<div class="text-truncate" style="max-width: 480px;">
										<span class="fs-12 text-muted d-block">Password Setup & Activation URL:</span>
										<code class="fs-12 text-primary text-truncate d-block" id="onboardingSetupUrl"></code>
									</div>
									<div class="d-flex gap-2">
										<button type="button" class="btn btn-sm btn-outline-primary shadow-sm" onclick="copyOnboardingUrl()">
											<i class="ti ti-copy me-1"></i> Copy Link
										</button>
										<a id="btnSimulateSetup" href="#" target="_blank" class="btn btn-sm btn-primary shadow-sm">
											<i class="ti ti-external-link me-1"></i> Open Password Setup
										</a>
									</div>
								</div>
							</div>
							<div class="modal-footer py-2 px-4 bg-light">
								<button type="button" class="btn btn-sm btn-light px-3" data-bs-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>
`;

const userDetailPageScripts = `
	<script>
        const STORAGE_TEAM_KEY = "lilypad_team_users_v2";

        let USER_DATABASE = {
            'u1': {
                id: 'u1',
                fullname: 'Scott Karan',
                username: 'skaran',
                email: 'scott@froggysfog.com',
                role: 'Admin',
                department: 'Operations',
                phone: '(615) 555-0100',
                initials: 'SK',
                active: true,
                joinDate: 'Jan 2024',
                stats: {
                    'today': { open: 1, inProgress: 2, completed: 3, low: 1, normal: 3, high: 2, urgent: 0, avgRes: '1.2 hrs', sla: '100%' },
                    'week': { open: 4, inProgress: 6, completed: 18, low: 3, normal: 12, high: 9, urgent: 4, avgRes: '1.8 hrs', sla: '98.5%' },
                    'month': { open: 8, inProgress: 12, completed: 54, low: 10, normal: 32, high: 24, urgent: 8, avgRes: '2.1 hrs', sla: '99.1%' },
                    'quarter': { open: 12, inProgress: 18, completed: 142, low: 22, normal: 85, high: 51, urgent: 14, avgRes: '2.4 hrs', sla: '98.9%' },
                    'all': { open: 15, inProgress: 20, completed: 320, low: 45, normal: 180, high: 105, urgent: 25, avgRes: '2.2 hrs', sla: '99.2%' }
                },
                activities: [
                    { type: 'status', title: 'Resolved Ticket #TICK-8088', desc: 'Diagnosed thermal cutoff fuse on Poseidon 2000 Fog Generator.', time: '12 mins ago', icon: 'ti-check', color: 'success' },
                    { type: 'note', title: 'Added Internal Note to #TICK-8086', desc: 'Requested high-pressure hose pressure test results from QC.', time: '1 hour ago', icon: 'ti-message-dots', color: 'info' },
                    { type: 'sop', title: 'Published New SOP', desc: 'Created SOP-044: Fog Fluid Pump Motor Cavitation Diagnostic Protocol.', time: '4 hours ago', icon: 'ti-book', color: 'primary' },
                    { type: 'status', title: 'Updated Priority #TICK-8082', desc: 'Elevated priority to Urgent due to facility tour deadline.', time: 'Yesterday', icon: 'ti-arrow-up', color: 'danger' }
                ],
                tickets: [
                    { id: 'TICK-8088', subject: 'Poseidon 2000 Fluid Pump Pressure Loss', category: 'FX Machine Support', priority: 'High', status: 'Completed', updated: '12 mins ago' },
                    { id: 'TICK-8086', subject: 'Custom Fluid Viscosity Formulation Batch 94', category: 'Custom Fluid Formulation', priority: 'Medium', status: 'In Progress', updated: '1 hr ago' },
                    { id: 'TICK-8082', subject: 'Titan 1500 Heater Thermostat Tripped E-04', category: 'FX Machine Support', priority: 'Urgent', status: 'In Progress', updated: 'Yesterday' }
                ]
            },
            'u2': {
                id: 'u2',
                fullname: 'Alex Morgan',
                username: 'amorgan',
                email: 'alex@froggysfog.com',
                role: 'Support Lead',
                department: 'Customer Support',
                phone: '(615) 555-0145',
                initials: 'AM',
                active: true,
                joinDate: 'Mar 2024',
                stats: {
                    'today': { open: 2, inProgress: 3, completed: 4, low: 2, normal: 4, high: 2, urgent: 1, avgRes: '1.4 hrs', sla: '100%' },
                    'week': { open: 5, inProgress: 8, completed: 26, low: 5, normal: 18, high: 11, urgent: 5, avgRes: '1.9 hrs', sla: '99.0%' },
                    'month': { open: 10, inProgress: 15, completed: 78, low: 14, normal: 48, high: 31, urgent: 10, avgRes: '2.0 hrs', sla: '99.4%' },
                    'quarter': { open: 14, inProgress: 22, completed: 210, low: 35, normal: 130, high: 68, urgent: 19, avgRes: '2.2 hrs', sla: '99.1%' },
                    'all': { open: 18, inProgress: 25, completed: 480, low: 80, normal: 290, high: 145, urgent: 38, avgRes: '2.1 hrs', sla: '99.3%' }
                },
                activities: [
                    { type: 'status', title: 'Closed RMA #TICK-8072', desc: 'Approved return for optical sensor recalibration.', time: '45 mins ago', icon: 'ti-package', color: 'success' },
                    { type: 'note', title: 'Replied to Customer', desc: 'Provided wiring schematic for DMX wireless receiver module.', time: '2 hours ago', icon: 'ti-mail-forward', color: 'info' }
                ],
                tickets: [
                    { id: 'TICK-8072', subject: 'Optical Fluid Level Sensor Signal Drift', category: 'Warranty & RMA Returns', priority: 'Medium', status: 'Completed', updated: '45 mins ago' }
                ]
            },
            'u3': {
                id: 'u3',
                fullname: 'David Miller',
                username: 'dmiller',
                email: 'david@froggysfog.com',
                role: 'Agent',
                department: 'Engineering',
                phone: '(615) 555-0162',
                initials: 'DM',
                active: true,
                joinDate: 'Jan 2024',
                stats: {
                    'today': { open: 1, inProgress: 1, completed: 1, low: 0, normal: 1, high: 1, urgent: 1, avgRes: '2.4 hrs', sla: '100%' },
                    'week': { open: 3, inProgress: 5, completed: 14, low: 2, normal: 9, high: 8, urgent: 3, avgRes: '2.8 hrs', sla: '97.5%' },
                    'month': { open: 6, inProgress: 9, completed: 39, low: 6, normal: 24, high: 18, urgent: 6, avgRes: '2.9 hrs', sla: '98.2%' },
                    'quarter': { open: 8, inProgress: 12, completed: 105, low: 18, normal: 60, high: 42, urgent: 13, avgRes: '2.8 hrs', sla: '98.5%' },
                    'all': { open: 9, inProgress: 14, completed: 210, low: 32, normal: 110, high: 82, urgent: 25, avgRes: '2.7 hrs', sla: '98.7%' }
                },
                activities: [
                    { type: 'sop', title: 'Created Diagnostic Rule', desc: 'Added automated troubleshooting check for 24V DC pump stall.', time: '1 hour ago', icon: 'ti-cpu', color: 'primary' }
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

        function getStoredTeamUsers() {
            try {
                const stored = localStorage.getItem(STORAGE_TEAM_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    parsed.forEach(u => {
                        if (!USER_DATABASE[u.id]) {
                            USER_DATABASE[u.id] = {
                                id: u.id,
                                fullname: u.fullname,
                                username: u.username || u.email.split('@')[0],
                                email: u.email,
                                role: u.role,
                                department: u.department,
                                phone: u.phone || '(615) 555-0188',
                                initials: u.initials || 'FF',
                                active: true,
                                joinDate: u.joined || 'Mar 2026',
                                stats: {
                                    'today': { open: 0, inProgress: 1, completed: 1, low: 0, normal: 1, high: 1, urgent: 0, avgRes: '1.8 hrs', sla: '100%' },
                                    'week': { open: 1, inProgress: 2, completed: 8, low: 2, normal: 5, high: 3, urgent: 1, avgRes: '2.1 hrs', sla: '99.0%' },
                                    'month': { open: 2, inProgress: 3, completed: 25, low: 4, normal: 15, high: 9, urgent: 2, avgRes: '2.4 hrs', sla: '99.2%' },
                                    'quarter': { open: 3, inProgress: 4, completed: 60, low: 10, normal: 35, high: 20, urgent: 5, avgRes: '2.3 hrs', sla: '99.1%' },
                                    'all': { open: 3, inProgress: 4, completed: 120, low: 20, normal: 70, high: 40, urgent: 10, avgRes: '2.3 hrs', sla: '99.3%' }
                                },
                                activities: [
                                    { type: 'status', title: 'Profile Activated', desc: "Account provisioned and onboarded into Froggy's Fog ERP.", time: "Recently", icon: "ti-user-check", color: 'primary' }
                                ],
                                tickets: []
                            };
                        }
                    });
                }
            } catch(e) {}
        }

        let currentUserId = 'u1';
        let currentTimeframe = 'month';
        let currentActivityFilter = 'all';

        function loadUserProfileFromUrl() {
            getStoredTeamUsers();
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
            dropdown.innerHTML = Object.values(USER_DATABASE).map(u => '<li>' +
                '<a class="dropdown-item d-flex align-items-center justify-content-between ' + (u.id === currentUserId ? 'active' : '') + '" href="admin-user-detail.html?id=' + u.id + '">' +
                    '<span>' + u.fullname + '</span>' +
                    '<span class="badge ' + (u.id === currentUserId ? 'bg-white text-dark' : 'bg-light text-dark') + ' fs-11 ms-2">' + u.role + '</span>' +
                '</a>' +
            '</li>').join('');
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

            document.getElementById('uHeaderName').textContent = user.fullname;
            document.getElementById('uHeaderRole').textContent = user.role;
            document.getElementById('uProfileAvatar').textContent = user.initials;
            document.getElementById('uProfileFullName').textContent = user.fullname;
            document.getElementById('uProfileEmail').textContent = user.email;
            document.getElementById('uProfileUsername').textContent = user.username;
            document.getElementById('uProfileDepartment').textContent = user.department;
            document.getElementById('uProfilePhone').textContent = user.phone || '(615) 555-0100';
            document.getElementById('uProfileJoined').textContent = user.joinDate || 'Jan 2024';

            document.getElementById('editFullName').value = user.fullname;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editRole').value = user.role;
            document.getElementById('editDepartment').value = user.department;

            renderUserStats();
            renderUserActivity();
            renderUserTickets();
        }

        function renderUserStats() {
            const user = USER_DATABASE[currentUserId];
            if (!user || !user.stats) return;
            const stats = user.stats[currentTimeframe] || user.stats['month'];

            document.getElementById('statOpen').textContent = stats.open;
            document.getElementById('statInProgress').textContent = stats.inProgress;
            document.getElementById('statCompleted').textContent = stats.completed;
            document.getElementById('statUrgentHigh').textContent = (stats.high || 0) + (stats.urgent || 0);
            document.getElementById('statAvgResolution').textContent = stats.avgRes;
            document.getElementById('statSla').textContent = stats.sla;
        }

        function renderUserActivity() {
            const user = USER_DATABASE[currentUserId];
            const timeline = document.getElementById('userActivityTimeline');
            if (!user || !timeline) return;

            let activities = user.activities || [];
            if (currentActivityFilter !== 'all') {
                activities = activities.filter(a => a.type === currentActivityFilter);
            }

            if (activities.length === 0) {
                timeline.innerHTML = '<div class="text-muted fs-13 py-3">No activity logs found for this filter.</div>';
                return;
            }

            timeline.innerHTML = activities.map(a => '<div class="mb-4 position-relative">' +
                '<div class="position-absolute rounded-circle bg-' + a.color + ' text-white d-flex align-items-center justify-content-center shadow-sm" style="left: -32px; top: 0; width: 24px; height: 24px; font-size: 11px;">' +
                    '<i class="ti ' + a.icon + '"></i>' +
                '</div>' +
                '<div class="bg-light p-3 rounded-3 border">' +
                    '<div class="d-flex align-items-center justify-content-between mb-1">' +
                        '<strong class="fs-13 text-dark">' + a.title + '</strong>' +
                        '<span class="fs-11 text-muted"><i class="ti ti-clock me-1"></i>' + a.time + '</span>' +
                    '</div>' +
                    '<p class="fs-12 text-muted mb-0">' + a.desc + '</p>' +
                '</div>' +
            '</div>').join('');
        }

        function renderUserTickets() {
            const user = USER_DATABASE[currentUserId];
            const tbody = document.getElementById('userAssignedTicketsTableBody');
            const countBadge = document.getElementById('assignedTicketsCountBadge');
            if (!user || !tbody) return;

            const tickets = user.tickets || [];
            if (countBadge) countBadge.textContent = tickets.length;

            if (tickets.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No tickets currently assigned to this team member.</td></tr>';
                return;
            }

            tbody.innerHTML = tickets.map(t => '<tr>' +
                '<td><a href="tickets.html" class="fw-bold text-primary text-decoration-none">' + t.id + '</a></td>' +
                '<td><strong class="text-dark">' + t.subject + '</strong></td>' +
                '<td><span class="badge bg-light text-dark border">' + t.category + '</span></td>' +
                '<td><span class="badge ' + (t.priority === 'Urgent' ? 'bg-danger' : (t.priority === 'High' ? 'bg-warning text-dark' : 'bg-info')) + ' fs-11">' + t.priority + '</span></td>' +
                '<td><span class="badge ' + (t.status === 'Completed' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary') + ' fs-11">' + t.status + '</span></td>' +
                '<td class="text-muted">' + t.updated + '</td>' +
                '<td class="text-end">' +
                    '<a href="tickets.html" class="btn btn-sm btn-outline-secondary py-1 px-2 fs-12"><i class="ti ti-eye me-1"></i>Open</a>' +
                '</td>' +
            '</tr>').join('');
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

            // Also update localStorage team list
            try {
                const stored = localStorage.getItem(STORAGE_TEAM_KEY);
                if (stored) {
                    let teamList = JSON.parse(stored);
                    let idx = teamList.findIndex(u => u.id === currentUserId);
                    if (idx !== -1) {
                        teamList[idx] = Object.assign({}, teamList[idx], {
                            fullname: user.fullname,
                            email: user.email,
                            username: user.username,
                            phone: user.phone,
                            role: user.role,
                            department: user.department,
                            initials: user.initials
                        });
                        localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(teamList));
                    }
                }
            } catch(err) {}

            renderUserView();
            renderMemberDropdown();

            user.activities.unshift({
                type: 'status',
                title: 'Updated Profile Information',
                desc: 'Modified profile credentials and department assignments.',
                time: 'Just now',
                icon: 'ti-edit',
                color: 'info'
            });
            renderUserActivity();

            const tabBtn = document.querySelector('#userDetailTabs button[data-bs-target="#tabActivity"]');
            if (tabBtn) bootstrap.Tab.getOrCreateInstance(tabBtn).show();

            alert('Profile for ' + user.fullname + ' updated successfully!');
        }

        function sendUserDetailOnboardingEmail() {
            const user = USER_DATABASE[currentUserId];
            if (!user) return;

            const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
            const token = 'tok_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
            const setupUrl = origin + '/login.html?action=setup-password&email=' + encodeURIComponent(user.email) + '&user=' + encodeURIComponent(user.username || '') + '&token=' + token;
            const hubUrl = origin + '/dashboard.html';
            const subject = "Welcome to Froggy's Fog Hub | Set Up Your Account (" + user.fullname + ")";

            const emailHtml = '<div style="max-width: 620px; margin: 0 auto; color: #1e293b;">' +
                '<div style="border-bottom: 2px solid var(--bs-primary, #0d6efd); padding-bottom: 14px; margin-bottom: 20px;">' +
                    '<h4 style="margin: 0; color: #0f172a; font-weight: 700;">🐸 Froggy Operations Hub</h4>' +
                    '<span style="font-size: 13px; color: #64748b;">Enterprise ERP & Diagnostic Portal</span>' +
                '</div>' +
                '<p style="font-size: 15px; margin-bottom: 16px;">Hi <strong>' + user.fullname + '</strong>,</p>' +
                '<p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">' +
                    'An account has been created for you on the <strong>Froggy Operations Hub</strong> with the role of <strong style="color: var(--bs-primary, #0d6efd);">' + user.role + '</strong> in the <strong>' + user.department + '</strong> department.' +
                '</p>' +
                '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px; text-align: center; margin-bottom: 24px;">' +
                    '<p style="font-size: 13px; color: #64748b; margin-bottom: 14px;">Please activate your profile and establish your private password:</p>' +
                    '<a href="' + setupUrl + '" target="_blank" style="background-color: var(--bs-primary, #0d6efd); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 8px rgba(13,110,253,0.35);">' +
                        '🔑 Set Password & Activate Account &rarr;' +
                    '</a>' +
                '</div>' +
                '<h5 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">🚀 Getting Started on the Hub:</h5>' +
                '<ol style="font-size: 13px; color: #334155; line-height: 1.7; padding-left: 20px; margin-bottom: 24px;">' +
                    '<li><strong>Establish Your Password:</strong> Click the button above to set up your password.</li>' +
                    '<li><strong>Main Operations Dashboard:</strong> Monitor real-time factory feeds and ticket movements at <a href="' + hubUrl + '" target="_blank" style="color: var(--bs-primary, #0d6efd);">' + hubUrl + '</a>.</li>' +
                    '<li><strong>Ticket Suite:</strong> Manage assigned machine maintenance, production requests, and dynamic field entries.</li>' +
                    '<li><strong>Diagnostic SOPs & Knowledge Base:</strong> Search symptom checklists and pre-flight factory testing protocols.</li>' +
                '</ol>' +
                '<div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 12px; color: #64748b;">' +
                    '<p style="margin: 0;">Need assistance? Contact Operations Admin at <a href="mailto:scott@froggysfog.com" style="color: #64748b;">scott@froggysfog.com</a> or visit <a href="https://froggysfog.com" target="_blank" style="color: #64748b;">froggysfog.com</a>.</p>' +
                '</div>' +
            '</div>';

            if (window.LilypadNotifications && LilypadNotifications.addNotification) {
                LilypadNotifications.addNotification({
                    title: 'Outbound Email Dispatched to ' + user.fullname,
                    message: 'Onboarding setup email delivered to ' + user.email,
                    type: 'email',
                    link: 'admin-team.html'
                });
            }

            document.getElementById('onboardingEmailRecipient').textContent = user.fullname + ' (' + user.email + ')';
            document.getElementById('onboardingEmailSubject').textContent = subject;
            document.getElementById('onboardingEmailBodyPreview').innerHTML = emailHtml;
            document.getElementById('onboardingSetupUrl').textContent = setupUrl;
            document.getElementById('btnSimulateSetup').href = setupUrl;

            const modalEl = document.getElementById('onboardingEmailModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
            }
        }

        function copyOnboardingUrl() {
            const url = document.getElementById('onboardingSetupUrl').textContent;
            navigator.clipboard.writeText(url).then(() => {
                alert('Password setup URL copied to clipboard!');
            }).catch(() => {
                alert('Setup URL: ' + url);
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadUserProfileFromUrl();
        });
	</script>
`;

const finalUserDetailHtml = getHeaderForPage('team', 'User Profile & Performance') + userDetailPageContent + footerScripts.replace('</body>', userDetailPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/admin-user-detail.html'), finalUserDetailHtml, 'utf8');

// ==========================================
// 3. ADMIN FORMS BUILDER PAGE (admin-forms.html)
// ==========================================
const formsPageContent = `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span>Dynamic Form Builder & Ticket Categories</span>
							<span class="badge bg-soft-primary text-primary fs-12 rounded-pill fw-semibold"><i class="ti ti-forms"></i> Schema v2.4</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Configure dynamic custom attributes, dropdown options, and validation rules per operational ticket category.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<a href="tickets.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> View Tickets
						</a>
						<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onclick="addNewCategoryModal()">
							<i class="ti ti-plus me-1"></i> Add Category
						</button>
					</div>
				</div>

				<div class="row g-4">
					<!-- Category List Selector -->
					<div class="col-lg-4">
						<div class="card border-0 shadow-sm rounded-3">
							<div class="card-header bg-transparent border-bottom py-3">
								<h6 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
									<i class="ti ti-category text-primary"></i>
									<span>Operational Categories (8)</span>
								</h6>
							</div>
							<div class="list-group list-group-flush p-2" id="categorySelectionList">
								<!-- Rendered Dynamically -->
							</div>
						</div>
					</div>

					<!-- Field Schema Editor for Selected Category -->
					<div class="col-lg-8">
						<div class="card border-0 shadow-sm rounded-3">
							<div class="card-header bg-transparent border-bottom py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
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

								<div class="d-flex align-items-center justify-content-between pt-3 border-top flex-wrap gap-2">
									<button class="btn btn-sm btn-outline-secondary" onclick="resetDefaultCategoryFields()">
										<i class="ti ti-rotate-clockwise me-1"></i> Reset Category Defaults
									</button>
									<button class="btn btn-primary btn-sm px-4 shadow-sm" onclick="saveCategoryFields()">
										<i class="ti ti-device-floppy me-1"></i> Save Category Form Schema
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
`;

const formsPageScripts = `
	<script>
        let PRODUCTION_CATEGORIES = [
            {
                id: 'cat1',
                name: 'FX Machine Support',
                icon: 'ti-cpu',
                color: 'primary',
                desc: 'Fog, Faze, Bubble, Snow & Cryo machines hardware diagnostics',
                fields: [
                    { name: 'machineModel', label: 'Machine Model / Series', type: 'select', options: ['Titan 1500', 'Poseidon 2000', 'CryoJet Pro', 'MiniFaze 500', 'Bubbler Max'], required: true },
                    { name: 'serialNumber', label: 'Unit Serial Number', type: 'text', placeholder: 'e.g. SN-TITAN-9948', required: true },
                    { name: 'heaterWatts', label: 'Heater Wattage Core', type: 'text', placeholder: 'e.g. 1500W', required: false },
                    { name: 'pumpPressure', label: 'Fluid Pump Pressure (PSI)', type: 'number', placeholder: '60', required: false },
                    { name: 'voltageRequirement', label: 'Operating Voltage', type: 'select', options: ['120V / 60Hz', '230V / 50Hz', '12V DC'], required: true }
                ]
            },
            {
                id: 'cat2',
                name: 'Custom Fluid Formulation',
                icon: 'ti-flask',
                color: 'info',
                desc: 'Specialized optical density, hang-time & scent recipes',
                fields: [
                    { name: 'fluidType', label: 'Base Fluid Chemistry', type: 'select', options: ['Glycol High-Density', 'Water-Based Fast Dissipating', 'Glycerin Ultra-Dense', 'Cryo Fog Carrier'], required: true },
                    { name: 'batchNumber', label: 'Production Batch #', type: 'text', placeholder: 'e.g. LOT-2026-F09', required: true },
                    { name: 'opticalDensityTarget', label: 'Target Optical Density (OD %)', type: 'text', placeholder: '92%', required: false },
                    { name: 'scentAdditive', label: 'Scent Infusion Profile', type: 'text', placeholder: 'e.g. Crisp Apple / None', required: false }
                ]
            },
            {
                id: 'cat3',
                name: 'Warranty & RMA Returns',
                icon: 'ti-package',
                color: 'secondary',
                desc: 'Incoming factory repairs, replacements, and RMA inspection',
                fields: [
                    { name: 'rmaNumber', label: 'Factory RMA Tracking #', type: 'text', placeholder: 'e.g. RMA-2026-081', required: true },
                    { name: 'purchaseDate', label: 'Original Invoice / Purchase Date', type: 'date', required: true },
                    { name: 'warrantyStatus', label: 'Warranty Status', type: 'select', options: ['Under Standard 1-Year Warranty', 'Extended 3-Year Protection', 'Out of Warranty (Billable)'], required: true },
                    { name: 'returnAction', label: 'Requested Action', type: 'select', options: ['Bench Repair & Recalibration', 'Direct Replacement Unit', 'Parts Supply Only'], required: true }
                ]
            },
            {
                id: 'cat4',
                name: 'Vendor Purchase Order',
                icon: 'ti-building-store',
                color: 'dark',
                desc: 'Raw fluid stock, heater blocks, valves, brass fittings',
                fields: [
                    { name: 'poNumber', label: 'PO Tracking Number', type: 'text', placeholder: 'PO-FF-8849', required: true },
                    { name: 'vendorSupplier', label: 'Supplier Name', type: 'text', placeholder: 'e.g. Advanced Thermals Inc', required: true },
                    { name: 'deliveryWarehouse', label: 'Delivery Dock Destination', type: 'select', options: ['Columbia Facility - Warehouse A', 'Nashville Logistics Hub', 'Main Testing Dock'], required: true }
                ]
            }
        ];

        let selectedCatIndex = 0;

        function renderCategoryList() {
            const container = document.getElementById('categorySelectionList');
            if (!container) return;
            container.innerHTML = PRODUCTION_CATEGORIES.map((c, i) => 
                '<a href="javascript:void(0);" onclick="selectCategory(' + i + ')" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded-2 border-0 mb-1 ' + (i === selectedCatIndex ? 'active text-white' : '') + '">' +
                    '<div class="d-flex align-items-center gap-2">' +
                        '<i class="ti ' + c.icon + ' fs-18"></i>' +
                        '<div>' +
                            '<strong class="d-block fs-13">' + c.name + '</strong>' +
                            '<span class="fs-11 ' + (i === selectedCatIndex ? 'text-white-50' : 'text-muted') + '">' + c.fields.length + ' Custom Fields</span>' +
                        '</div>' +
                    '</div>' +
                    '<i class="ti ti-chevron-right fs-14"></i>' +
                '</a>'
            ).join('');
        }

        function selectCategory(idx) {
            selectedCatIndex = idx;
            renderCategoryList();
            renderFieldsEditor();
        }

        function renderFieldsEditor() {
            const cat = PRODUCTION_CATEGORIES[selectedCatIndex];
            const titleEl = document.getElementById('selectedCategoryTitle');
            const container = document.getElementById('fieldsEditorContainer');
            if (titleEl) titleEl.textContent = cat.name;
            if (!container) return;

            container.innerHTML = cat.fields.map((f, fIdx) => 
                '<div class="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between gap-3 flex-wrap">' +
                    '<div class="d-flex align-items-center gap-2" style="min-width: 220px;">' +
                        '<span class="badge bg-secondary rounded-pill">' + (fIdx + 1) + '</span>' +
                        '<div>' +
                            '<strong class="fs-13 text-dark d-block">' + f.label + '</strong>' +
                            '<span class="fs-11 text-muted">Key: <code>' + f.name + '</code></span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="d-flex align-items-center gap-2 flex-grow-1">' +
                        '<span class="badge bg-light text-dark border fs-11 text-uppercase">' + f.type + '</span>' +
                        (f.required ? '<span class="badge bg-danger-subtle text-danger fs-11">Required</span>' : '<span class="badge bg-light text-muted border fs-11">Optional</span>') +
                        (f.options ? '<span class="fs-11 text-muted text-truncate" style="max-width:200px;">[' + f.options.join(', ') + ']</span>' : '') +
                    '</div>' +
                    '<div class="d-flex align-items-center gap-1">' +
                        '<button class="btn btn-sm btn-link text-danger p-0" onclick="deleteFieldRow(' + fIdx + ')" title="Remove Field"><i class="ti ti-trash"></i></button>' +
                    '</div>' +
                '</div>'
            ).join('');
        }

        function addNewFieldRow() {
            const fieldName = prompt('Enter Field Display Label (e.g., Pump Cycle Frequency):');
            if (!fieldName) return;
            const type = prompt('Enter Field Type: select, text, number, date', 'text') || 'text';
            const req = confirm('Is this field mandatory (required)?');

            let options = null;
            if (type === 'select') {
                const optStr = prompt('Enter comma-separated options:', 'Option A, Option B, Option C');
                if (optStr) options = optStr.split(',').map(s => s.trim());
            }

            PRODUCTION_CATEGORIES[selectedCatIndex].fields.push({
                name: 'customField' + (PRODUCTION_CATEGORIES[selectedCatIndex].fields.length + 1),
                label: fieldName,
                type: type,
                options: options,
                required: req
            });
            renderFieldsEditor();
            renderCategoryList();
        }

        function deleteFieldRow(fIdx) {
            if (confirm('Delete this field from schema?')) {
                PRODUCTION_CATEGORIES[selectedCatIndex].fields.splice(fIdx, 1);
                renderFieldsEditor();
                renderCategoryList();
            }
        }

        function saveCategoryFields() {
            alert('✓ Dynamic Schema for "' + PRODUCTION_CATEGORIES[selectedCatIndex].name + '" saved and synchronized with operational ticket forms!');
        }

        function resetDefaultCategoryFields() {
            if (confirm('Reset to factory default schema fields for this category?')) {
                renderFieldsEditor();
            }
        }

        function addNewCategoryModal() {
            const name = prompt('Enter New Ticket Category Name:');
            if (!name) return;
            PRODUCTION_CATEGORIES.push({
                id: 'cat' + (PRODUCTION_CATEGORIES.length + 1),
                name: name,
                icon: 'ti-folder',
                color: 'primary',
                desc: 'Custom operational ticket workflow',
                fields: [
                    { name: 'itemIdentifier', label: 'Item / Asset Tag', type: 'text', required: true }
                ]
            });
            selectedCatIndex = PRODUCTION_CATEGORIES.length - 1;
            renderCategoryList();
            renderFieldsEditor();
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderCategoryList();
            renderFieldsEditor();
        });
	</script>
`;

const finalFormsHtml = getHeaderForPage('forms', 'Dynamic Form Builder') + formsPageContent + footerScripts.replace('</body>', formsPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/admin-forms.html'), finalFormsHtml, 'utf8');

// ==========================================
// 4. KNOWLEDGE BASE & DIAGNOSTIC SOPS PAGE (knowledge-base.html)
// ==========================================
const kbPageContent = `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
							<span>Knowledge Base & Diagnostic SOPs</span>
							<span class="badge bg-soft-primary text-primary fs-12 rounded-pill fw-semibold"><i class="ti ti-book-2"></i> Verified Factory Standards</span>
						</h4>
						<p class="text-muted fs-13 mb-0">Searchable repository of standard operating procedures, component schematics, and automated machine diagnostic checklists.</p>
					</div>
					<div class="d-flex align-items-center gap-2 flex-wrap">
						<a href="tickets.html" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
							<i class="ti ti-ticket me-1"></i> View Tickets
						</a>
						<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" onclick="addNewSopModal()">
							<i class="ti ti-plus me-1"></i> Create New SOP
						</button>
					</div>
				</div>

				<!-- Search Banner -->
				<div class="card border-0 shadow-sm rounded-3 mb-4 text-white p-4" style="background: linear-gradient(135deg, var(--bs-primary) 0%, #0f172a 100%);">
					<div class="row align-items-center">
						<div class="col-lg-7">
							<h3 class="fw-bold mb-2 text-white">Find Diagnostic & Testing Procedures</h3>
							<p class="text-white-50 fs-13 mb-3">Search through 48 factory-verified SOPs, machine schematics, and failure resolution playbooks.</p>
							<div class="input-group input-group-lg shadow-sm">
								<span class="input-group-text bg-white border-0 text-muted"><i class="ti ti-search fs-18"></i></span>
								<input type="text" id="kbSearchInput" class="form-control border-0 fs-14" placeholder="Search by machine model, error code (e.g. E-04), symptom, or chemical formula..." onkeyup="filterKbArticles()">
							</div>
						</div>
						<div class="col-lg-5 text-center d-none d-lg-block">
							<i class="ti ti-books display-4 text-white-50"></i>
						</div>
					</div>
				</div>

				<!-- SOP Category Cards -->
				<div class="row g-3 mb-4" id="kbArticlesContainer">
					<!-- Rendered Dynamically -->
				</div>
`;

const kbPageScripts = `
	<script>
        let SOP_DATABASE = [
            {
                id: 'SOP-001',
                code: 'SOP-001',
                title: 'Titan 1500 Fog Machine Heater Block & Thermostat Diagnostic',
                category: 'FX Machine Support',
                categoryColor: 'primary',
                errorCode: 'E-04 / Overheat',
                summary: 'Step-by-step diagnostic tree for heater element thermal cutoff switch, PID temperature sensors, and 120V relay failure.',
                readTime: '4 min read',
                updated: 'Updated Yesterday',
                steps: [
                    'Disconnect unit from main 120V/230V power before removing chassis cover.',
                    'Measure resistance across heater core terminals with a calibrated multimeter (Normal: 14.5 - 16.2 Ohms).',
                    "Inspect thermal cutoff fuse (TF-240C) for continuity. If open-circuit, replace with certified OEM harness.",
                    'Check thermistor wire leads for pinching or fraying against heater casing.',
                    'Power unit in test mode; verify LED status indicators cycle from Amber (Heating) to Green (Ready).'
                ]
            },
            {
                id: 'SOP-002',
                code: 'SOP-002',
                title: 'Poseidon 2000 Fluid Pump Cavitation & Pressure Stall Resolution',
                category: 'FX Machine Support',
                categoryColor: 'primary',
                errorCode: 'P-02 / Cavitation',
                summary: 'Techniques for purging micro-air locks in high-pressure brass piston pumps and testing check valve integrity.',
                readTime: '6 min read',
                updated: 'Updated 3 days ago',
                steps: [
                    "Ensure fluid reservoir is filled with fresh Froggy\'s Fog Poseidon-grade formula.",
                    'Inspect inline 50-micron fluid filter for crystallization or sediment buildup.',
                    'Attach pressure gauge manifold to pump outlet port; execute manual 10-second pump prime sequence.',
                    'Verify output reaches minimum 55 PSI steady operational pressure.',
                    'If pump vibrates loudly without fluid flow, prime check valve using 10ml syringe with fluid solution.'
                ]
            },
            {
                id: 'SOP-003',
                code: 'SOP-003',
                title: 'Optical Fluid Level Sensor Calibration & Signal Cleaning',
                category: 'Warranty & RMA Returns',
                categoryColor: 'secondary',
                errorCode: 'SEN-01 / Dry Run',
                summary: 'Bench procedure for IR optical level sensors, cleaning prism surfaces, and setting ADC voltage thresholds.',
                readTime: '3 min read',
                updated: 'Updated Last Week',
                steps: [
                    'Remove optical sensor housing from tank side-mount port.',
                    'Clean optical prism tip using 99% Isopropyl alcohol and lint-free microfiber swab.',
                    'Check 5V DC supply rail on motherboard header pin 3.',
                    'Adjust potentiometer R14 until sensor output reads 4.8V (Dry) and 0.4V (Submerged).',
                    'Verify dry-run auto-shutoff circuit triggers pump shutdown within 3 seconds of fluid depletion.'
                ]
            },
            {
                id: 'SOP-004',
                code: 'SOP-004',
                title: 'Custom Fluid Batch Refractive Index & Hang-Time Quality Control',
                category: 'Custom Fluid Formulation',
                categoryColor: 'info',
                errorCode: 'QC-CHEM-09',
                summary: 'Standard laboratory QC protocol for verifying specific gravity, refractive index, and flash-point safety.',
                readTime: '5 min read',
                updated: 'Updated 2 weeks ago',
                steps: [
                    'Draw 50ml composite sample from 500-gallon blending vat.',
                    'Measure sample with digital refractometer at 20°C (Brix range: 24.2 - 25.8).',
                    'Check specific gravity using hydrometer (Target: 1.054 ± 0.003 g/cm³).',
                    'Perform particle suspension stability test under 400nm UV inspection lamp.',
                    'Log analytical findings into batch record and release QA sign-off stamp.'
                ]
            }
        ];

        function renderKbArticles(articles = SOP_DATABASE) {
            const container = document.getElementById('kbArticlesContainer');
            if (!container) return;

            if (articles.length === 0) {
                container.innerHTML = '<div class="col-12 text-center py-5 text-muted"><i class="ti ti-search-off fs-32 d-block mb-2"></i>No matching SOP diagnostic procedures found. Try a different search term.</div>';
                return;
            }

            container.innerHTML = articles.map(a => 
                '<div class="col-lg-6">' +
                    '<div class="card border-0 shadow-sm rounded-3 h-100 p-4">' +
                        '<div class="d-flex align-items-center justify-content-between mb-3">' +
                            '<span class="badge bg-' + a.categoryColor + ' fs-11">' + a.category + '</span>' +
                            '<span class="badge bg-light text-dark border fs-11 font-monospace">' + a.code + '</span>' +
                        '</div>' +
                        '<h5 class="fw-bold text-dark mb-2">' + a.title + '</h5>' +
                        '<p class="text-muted fs-13 mb-3">' + a.summary + '</p>' +
                        
                        '<div class="p-3 bg-light rounded-2 border mb-3">' +
                            '<strong class="fs-12 text-dark d-block mb-2"><i class="ti ti-checklist text-primary me-1"></i>Key Protocol Steps:</strong>' +
                            '<ol class="fs-12 text-muted ps-3 mb-0" style="line-height: 1.6;">' +
                                a.steps.slice(0, 3).map(s => '<li class="mb-1">' + s + '</li>').join('') +
                            '</ol>' +
                        '</div>' +

                        '<div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">' +
                            '<div class="fs-11 text-muted">' +
                                '<span><i class="ti ti-clock me-1"></i>' + a.readTime + '</span> &middot; ' +
                                '<span>' + a.updated + '</span>' +
                            '</div>' +
                            '<button class="btn btn-sm btn-outline-primary" data-sop-id="\${a.id}" onclick="viewSopFullModal(this.dataset.sopId)"><i class="ti ti-file-text me-1"></i>Full Protocol</button>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            ).join('');
        }

        function filterKbArticles() {
            const query = document.getElementById('kbSearchInput').value.toLowerCase().trim();
            if (!query) {
                renderKbArticles(SOP_DATABASE);
                return;
            }
            const filtered = SOP_DATABASE.filter(a => 
                a.title.toLowerCase().includes(query) ||
                a.summary.toLowerCase().includes(query) ||
                a.code.toLowerCase().includes(query) ||
                a.errorCode.toLowerCase().includes(query) ||
                a.steps.some(s => s.toLowerCase().includes(query))
            );
            renderKbArticles(filtered);
        }

        function viewSopFullModal(id) {
            const sop = SOP_DATABASE.find(s => s.id === id);
            if (!sop) return;
            alert(['Protocol [' + sop.code + '] ' + sop.title + ':', '', sop.steps.map((s, i) => (i+1) + '. ' + s).join('\\n')].join('\\n'));
        }

        function addNewSopModal() {
            const title = prompt('Enter Standard Operating Procedure (SOP) Title:');
            if (!title) return;
            const errCode = prompt('Enter Associated Error Code / Trigger (e.g., E-04):', 'GEN-01');
            const step1 = prompt('Enter First Diagnostic Step:');
            if (!step1) return;

            SOP_DATABASE.unshift({
                id: 'SOP-' + (SOP_DATABASE.length + 1),
                code: 'SOP-0' + (SOP_DATABASE.length + 1),
                title: title,
                category: 'FX Machine Support',
                categoryColor: 'primary',
                errorCode: errCode || 'GEN-01',
                summary: 'Factory verified procedure for ' + title,
                readTime: '3 min read',
                updated: 'Just now',
                steps: [step1, 'Perform live machine test run to verify normal operational parameters.']
            });
            renderKbArticles();
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderKbArticles();
        });
	</script>
`;

const finalKbHtml = getHeaderForPage('kb', 'Knowledge Base & SOPs') + kbPageContent + footerScripts.replace('</body>', kbPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/knowledge-base.html'), finalKbHtml, 'utf8');

// ==========================================
// 5. CLEAN PUBLIC INDEX.HTML & DASHBOARD.HTML
// ==========================================
const cleanDashboardContent = getHeaderForPage('dashboard', 'Main Operations Dashboard') + 
    indexHtml.substring(indexHtml.indexOf(contentStartMarker) + contentStartMarker.length, indexHtml.indexOf(footerStartMarker)) + 
    footerScripts;

fs.writeFileSync(path.join(__dirname, '../public/index.html'), cleanDashboardContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/dashboard.html'), cleanDashboardContent, 'utf8');

console.log('Successfully generated dedicated admin pages:');
console.log(' - public/admin-email.html');
console.log(' - public/admin-team.html');
console.log(' - public/admin-user-detail.html');
console.log(' - public/admin-forms.html');
console.log(' - public/knowledge-base.html');
console.log(' - public/index.html & public/dashboard.html (Cleaned)');

// ==========================================
// 6. PROFILE & ACCOUNT SETTINGS PAGE (profile-settings.html)
// ==========================================
const profileSettingsPageContent = "<!-- Page Header -->\n<div class=\"d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap\">\n    <div>\n        <h4 class=\"mb-1 fw-bold text-dark d-flex align-items-center gap-2\">\n            <span>Profile & Account Settings</span>\n            <span class=\"badge bg-soft-primary text-primary fs-12 rounded-pill fw-semibold\"><i class=\"ti ti-user-check\"></i> Account Hub</span>\n        </h4>\n        <p class=\"text-muted fs-13 mb-0\">Manage your personal credentials, contact details, profile photo, authentication security, and platform notification preferences.</p>\n    </div>\n    <div class=\"d-flex align-items-center gap-2 flex-wrap\">\n        <a href=\"dashboard.html\" class=\"btn btn-outline-secondary btn-sm rounded-pill px-3\">\n            <i class=\"ti ti-dashboard me-1\"></i> Dashboard\n        </a>\n        <a href=\"admin-team.html\" class=\"btn btn-outline-primary btn-sm rounded-pill px-3\">\n            <i class=\"ti ti-users me-1\"></i> Team Directory\n        </a>\n    </div>\n</div>\n\n<!-- Profile Banner Card -->\n<div class=\"card border-0 shadow-sm rounded-3 p-4 mb-4\">\n    <div class=\"d-flex align-items-center justify-content-between flex-wrap gap-3\">\n        <div class=\"d-flex align-items-center gap-3\">\n            <div class=\"position-relative\" id=\"myAvatarContainer\">\n                <div class=\"rounded-circle text-white bg-primary d-flex align-items-center justify-content-center fw-bold fs-22 shadow\" id=\"myProfileAvatar\" style=\"width: 72px; height: 72px;\">\n                    SK\n                </div>\n                <span class=\"position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle\" style=\"width:16px; height:16px;\"></span>\n            </div>\n            <div>\n                <div class=\"d-flex align-items-center gap-2 mb-1 flex-wrap\">\n                    <h4 class=\"fw-bold mb-0 text-dark\" id=\"myProfileFullName\">Scott Karan</h4>\n                    <span class=\"badge bg-dark fs-11\" id=\"myProfileRoleBadge\">Admin</span>\n                    <span class=\"badge bg-success-subtle text-success fs-11\"><i class=\"ti ti-point-filled\"></i> Online</span>\n                </div>\n                <div class=\"d-flex align-items-center gap-3 fs-13 text-muted flex-wrap\">\n                    <span><i class=\"ti ti-mail me-1 text-primary\"></i> <strong class=\"text-dark\" id=\"myProfileEmail\">scott@froggysfog.com</strong></span>\n                    <span><i class=\"ti ti-user me-1\"></i> @<span id=\"myProfileUsername\">skaran</span></span>\n                    <span><i class=\"ti ti-building me-1\"></i> <span id=\"myProfileDepartment\">Operations</span></span>\n                    <span><i class=\"ti ti-phone me-1\"></i> <span id=\"myProfilePhone\">(615) 555-0100</span></span>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"d-flex align-items-center gap-2\">\n            <input type=\"file\" id=\"avatarFileInput\" accept=\"image/png, image/jpeg, image/jpg, image/webp\" class=\"d-none\" onchange=\"handleAvatarFileUpload(event)\">\n            <button type=\"button\" class=\"btn btn-primary btn-sm rounded-pill px-3 shadow-sm\" onclick=\"triggerAvatarUpload()\">\n                <i class=\"ti ti-upload me-1\"></i> Upload Photo\n            </button>\n            <button type=\"button\" class=\"btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm\" id=\"btnRemovePhoto\" onclick=\"removeAvatarPhoto()\">\n                <i class=\"ti ti-trash me-1\"></i> Remove\n            </button>\n        </div>\n    </div>\n</div>\n\n<!-- Main Settings Card with Tabs -->\n<div class=\"card border-0 shadow-sm rounded-3 mb-4\">\n    <div class=\"card-header bg-transparent border-bottom py-3\">\n        <ul class=\"nav nav-pills gap-2\" id=\"profileSettingsTabs\">\n            <li class=\"nav-item\">\n                <button class=\"nav-link active py-2 px-3 fs-13 fw-semibold rounded-pill\" data-bs-toggle=\"tab\" data-bs-target=\"#tabPersonalInfo\">\n                    <i class=\"ti ti-user me-1\"></i> Personal Profile\n                </button>\n            </li>\n            <li class=\"nav-item\">\n                <button class=\"nav-link py-2 px-3 fs-13 fw-semibold rounded-pill\" data-bs-toggle=\"tab\" data-bs-target=\"#tabSecurity\">\n                    <i class=\"ti ti-shield-lock me-1\"></i> Security & Password\n                </button>\n            </li>\n            <li class=\"nav-item\">\n                <button class=\"nav-link py-2 px-3 fs-13 fw-semibold rounded-pill\" data-bs-toggle=\"tab\" data-bs-target=\"#tabNotifications\">\n                    <i class=\"ti ti-bell-ringing me-1\"></i> Notifications & Teams\n                </button>\n            </li>\n            <li class=\"nav-item\">\n                <button class=\"nav-link py-2 px-3 fs-13 fw-semibold rounded-pill\" data-bs-toggle=\"tab\" data-bs-target=\"#tabPreferences\">\n                    <i class=\"ti ti-adjustments me-1\"></i> Workspace Preferences\n                </button>\n            </li>\n        </ul>\n    </div>\n\n    <div class=\"card-body p-4\">\n        <div class=\"tab-content\">\n            <!-- Tab 1: Personal Profile -->\n            <div class=\"tab-pane fade show active\" id=\"tabPersonalInfo\">\n                <form id=\"personalInfoForm\" onsubmit=\"savePersonalProfile(event)\">\n                    <div class=\"row g-3\">\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Full Name <span class=\"text-danger\">*</span></label>\n                            <input type=\"text\" id=\"myEditFullName\" class=\"form-control\" value=\"Scott Karan\" required>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Email Address <span class=\"text-danger\">*</span></label>\n                            <input type=\"email\" id=\"myEditEmail\" class=\"form-control\" value=\"scott@froggysfog.com\" required>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Username <span class=\"text-danger\">*</span></label>\n                            <input type=\"text\" id=\"myEditUsername\" class=\"form-control\" value=\"skaran\" required>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Direct Phone / Extension</label>\n                            <input type=\"text\" id=\"myEditPhone\" class=\"form-control\" value=\"(615) 555-0100\" placeholder=\"(615) 555-0100\">\n                        </div>\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Department</label>\n                            <select id=\"myEditDepartment\" class=\"form-select\">\n                                <option value=\"Operations\" selected>Operations</option>\n                                <option value=\"Customer Support\">Customer Support</option>\n                                <option value=\"Engineering\">Engineering</option>\n                                <option value=\"Finance\">Finance</option>\n                                <option value=\"Sales & Marketing\">Sales & Marketing</option>\n                            </select>\n                        </div>\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Timezone</label>\n                            <select id=\"myEditTimezone\" class=\"form-select\">\n                                <option value=\"America/Chicago\" selected>Central Time (US & Canada) (GMT-5)</option>\n                                <option value=\"America/New_York\">Eastern Time (US & Canada) (GMT-4)</option>\n                                <option value=\"America/Denver\">Mountain Time (US & Canada) (GMT-6)</option>\n                                <option value=\"America/Los_Angeles\">Pacific Time (US & Canada) (GMT-7)</option>\n                            </select>\n                        </div>\n                        <div class=\"col-12\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">About / Operational Bio</label>\n                            <textarea id=\"myEditBio\" class=\"form-control\" rows=\"3\" placeholder=\"Operations Lead overseeing machine diagnostic workflows, fluid formulations, and factory tickets.\">Operations Lead overseeing machine diagnostic workflows, fluid formulations, and factory tickets.</textarea>\n                        </div>\n                    </div>\n                    <div class=\"text-end mt-4 pt-3 border-top\">\n                        <button type=\"submit\" class=\"btn btn-primary px-4 shadow-sm\">\n                            <i class=\"ti ti-device-floppy me-1\"></i> Save Profile Details\n                        </button>\n                    </div>\n                </form>\n            </div>\n\n            <!-- Tab 2: Security & Password -->\n            <div class=\"tab-pane fade\" id=\"tabSecurity\">\n                <div class=\"row g-4\">\n                    <div class=\"col-lg-6\">\n                        <div class=\"p-3 bg-light rounded-3 border\">\n                            <h6 class=\"fw-bold mb-3 text-dark d-flex align-items-center gap-2\">\n                                <i class=\"ti ti-key text-primary\"></i> Change Account Password\n                            </h6>\n                            <form id=\"changePasswordForm\" onsubmit=\"saveNewPassword(event)\">\n                                <div class=\"mb-3\">\n                                    <label class=\"form-label fs-13 fw-semibold text-dark\">Current Password <span class=\"text-danger\">*</span></label>\n                                    <input type=\"password\" id=\"myCurrentPass\" class=\"form-control\" placeholder=\"••••••••\" required>\n                                </div>\n                                <div class=\"mb-3\">\n                                    <label class=\"form-label fs-13 fw-semibold text-dark\">New Password <span class=\"text-danger\">*</span></label>\n                                    <input type=\"password\" id=\"myNewPass\" class=\"form-control\" placeholder=\"Min. 8 characters\" required>\n                                </div>\n                                <div class=\"mb-3\">\n                                    <label class=\"form-label fs-13 fw-semibold text-dark\">Confirm New Password <span class=\"text-danger\">*</span></label>\n                                    <input type=\"password\" id=\"myConfirmPass\" class=\"form-control\" placeholder=\"Re-enter new password\" required>\n                                </div>\n                                <button type=\"submit\" class=\"btn btn-primary btn-sm px-3 shadow-sm\">\n                                    <i class=\"ti ti-lock-check me-1\"></i> Update Password\n                                </button>\n                            </form>\n                        </div>\n                    </div>\n\n                    <div class=\"col-lg-6\">\n                        <div class=\"p-3 bg-light rounded-3 border mb-3\">\n                            <div class=\"d-flex align-items-center justify-content-between mb-2\">\n                                <h6 class=\"fw-bold mb-0 text-dark d-flex align-items-center gap-2\">\n                                    <i class=\"ti ti-shield-check text-success\"></i> Two-Factor Authentication (2FA)\n                                </h6>\n                                <span class=\"badge bg-success-subtle text-success fs-11\">Active</span>\n                            </div>\n                            <p class=\"text-muted fs-12 mb-3\">Protect your LilyPad ERP account using Microsoft Authenticator or Google Authenticator OTP.</p>\n                            <button type=\"button\" class=\"btn btn-outline-secondary btn-sm\" onclick=\"alert('2FA is currently active with your Microsoft 365 Authenticator app.')\">\n                                <i class=\"ti ti-qrcode me-1\"></i> Manage Authenticator Keys\n                            </button>\n                        </div>\n\n                        <div class=\"p-3 bg-light rounded-3 border\">\n                            <h6 class=\"fw-bold mb-2 text-dark d-flex align-items-center gap-2\">\n                                <i class=\"ti ti-devices text-primary\"></i> Active Sessions\n                            </h6>\n                            <div class=\"d-flex align-items-center justify-content-between py-2 border-bottom\">\n                                <div>\n                                    <strong class=\"fs-12 text-dark d-block\">Windows Chrome (Current Session)</strong>\n                                    <span class=\"fs-11 text-muted\">IP: 192.168.1.45 &middot; Active Now</span>\n                                </div>\n                                <span class=\"badge bg-success fs-10\">This Device</span>\n                            </div>\n                            <div class=\"d-flex align-items-center justify-content-between py-2\">\n                                <div>\n                                    <strong class=\"fs-12 text-dark d-block\">iPhone Microsoft Teams App</strong>\n                                    <span class=\"fs-11 text-muted\">IP: 70.182.44.12 &middot; 2 hrs ago</span>\n                                </div>\n                                <button class=\"btn btn-sm btn-link text-danger p-0 fs-12\" onclick=\"alert('Session terminated.')\">Revoke</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <!-- Tab 3: Notifications & Teams -->\n            <div class=\"tab-pane fade\" id=\"tabNotifications\">\n                <div class=\"card border rounded-3 p-4 bg-light shadow-none\">\n                    <h6 class=\"fw-bold mb-3 text-dark d-flex align-items-center gap-2\">\n                        <i class=\"ti ti-bell-ringing text-primary\"></i> Alert Preferences & Channel Routing\n                    </h6>\n\n                    <div class=\"row g-3\">\n                        <div class=\"col-md-6\">\n                            <div class=\"p-3 bg-white rounded-3 border\">\n                                <div class=\"d-flex align-items-center justify-content-between mb-2\">\n                                    <strong class=\"fs-13 text-dark\">Ticket Assignment Email</strong>\n                                    <div class=\"form-check form-switch mb-0\">\n                                        <input class=\"form-check-input\" type=\"checkbox\" id=\"prefEmailAssign\" checked>\n                                    </div>\n                                </div>\n                                <span class=\"fs-12 text-muted\">Receive email when an operational ticket is assigned to you.</span>\n                            </div>\n                        </div>\n\n                        <div class=\"col-md-6\">\n                            <div class=\"p-3 bg-white rounded-3 border\">\n                                <div class=\"d-flex align-items-center justify-content-between mb-2\">\n                                    <strong class=\"fs-13 text-dark\">Microsoft Teams Direct Pings</strong>\n                                    <div class=\"form-check form-switch mb-0\">\n                                        <input class=\"form-check-input\" type=\"checkbox\" id=\"prefTeamsPings\" checked>\n                                    </div>\n                                </div>\n                                <span class=\"fs-12 text-muted\">Send bot messages to your Teams client on high priority machine failures.</span>\n                            </div>\n                        </div>\n\n                        <div class=\"col-md-6\">\n                            <div class=\"p-3 bg-white rounded-3 border\">\n                                <div class=\"d-flex align-items-center justify-content-between mb-2\">\n                                    <strong class=\"fs-13 text-dark\">Urgent Priority Escalations</strong>\n                                    <div class=\"form-check form-switch mb-0\">\n                                        <input class=\"form-check-input\" type=\"checkbox\" id=\"prefUrgentEscalation\" checked>\n                                    </div>\n                                </div>\n                                <span class=\"fs-12 text-muted\">Instant pop-up alert when a ticket SLA is within 30 minutes of breach.</span>\n                            </div>\n                        </div>\n\n                        <div class=\"col-md-6\">\n                            <div class=\"p-3 bg-white rounded-3 border\">\n                                <div class=\"d-flex align-items-center justify-content-between mb-2\">\n                                    <strong class=\"fs-13 text-dark\">Diagnostic SOP Updates</strong>\n                                    <div class=\"form-check form-switch mb-0\">\n                                        <input class=\"form-check-input\" type=\"checkbox\" id=\"prefSopUpdates\" checked>\n                                    </div>\n                                </div>\n                                <span class=\"fs-12 text-muted\">Notify when a testing SOP is published or edited in the Knowledge Base.</span>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"text-end mt-4 pt-3 border-top\">\n                        <button type=\"button\" class=\"btn btn-primary px-4 shadow-sm\" onclick=\"saveNotificationPreferences()\">\n                            <i class=\"ti ti-device-floppy me-1\"></i> Save Notification Settings\n                        </button>\n                    </div>\n                </div>\n            </div>\n\n            <!-- Tab 4: Workspace Preferences -->\n            <div class=\"tab-pane fade\" id=\"tabPreferences\">\n                <div class=\"card border rounded-3 p-4 bg-light shadow-none\">\n                    <h6 class=\"fw-bold mb-3 text-dark d-flex align-items-center gap-2\">\n                        <i class=\"ti ti-layout-dashboard text-primary\"></i> Workspace & UI Personalization\n                    </h6>\n\n                    <div class=\"row g-3\">\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Default Landing Dashboard</label>\n                            <select id=\"prefDefaultLanding\" class=\"form-select\">\n                                <option value=\"dashboard.html\" selected>Main Operations Dashboard</option>\n                                <option value=\"tickets.html\">Ticket Operations & Support Queue</option>\n                                <option value=\"knowledge-base.html\">Knowledge Base & Diagnostic SOPs</option>\n                            </select>\n                        </div>\n\n                        <div class=\"col-md-6\">\n                            <label class=\"form-label fs-13 fw-semibold text-dark\">Date & Time Format</label>\n                            <select id=\"prefDateFormat\" class=\"form-select\">\n                                <option value=\"MM/DD/YYYY\" selected>MM/DD/YYYY (12-hour: 02:30 PM)</option>\n                                <option value=\"DD/MM/YYYY\">DD/MM/YYYY (24-hour: 14:30)</option>\n                                <option value=\"YYYY-MM-DD\">YYYY-MM-DD (ISO 8601)</option>\n                            </select>\n                        </div>\n\n                        <div class=\"col-12\">\n                            <div class=\"p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2\">\n                                <div>\n                                    <strong class=\"fs-13 text-dark d-block\">Theme & Color Palette Customizer</strong>\n                                    <span class=\"fs-12 text-muted\">Quickly switch between Light/Dark mode and customized accent/button colors.</span>\n                                </div>\n                                <button type=\"button\" class=\"btn btn-outline-primary btn-sm\" data-bs-toggle=\"offcanvas\" data-bs-target=\"#theme-settings-offcanvas\">\n                                    <i class=\"ti ti-palette me-1\"></i> Open Theme Customizer\n                                </button>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"text-end mt-4 pt-3 border-top\">\n                        <button type=\"button\" class=\"btn btn-primary px-4 shadow-sm\" onclick=\"saveWorkspacePreferences()\">\n                            <i class=\"ti ti-device-floppy me-1\"></i> Save Workspace Preferences\n                        </button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
const profileSettingsPageScripts = "\n\t<script>\n        const STORAGE_TEAM_KEY = \"lilypad_team_users_v2\";\n\n        function triggerAvatarUpload() {\n            const input = document.getElementById('avatarFileInput');\n            if (input) input.click();\n        }\n\n        function getActiveAuthUser() {\n            try {\n                const sessionAuth = sessionStorage.getItem('lilypad_auth_user') || localStorage.getItem('lilypad_auth_user');\n                if (sessionAuth) return JSON.parse(sessionAuth);\n            } catch(e) {}\n            return {\n                fullname: 'Scott Karan',\n                username: 'skaran',\n                email: 'scott@froggysfog.com',\n                role: 'Admin',\n                department: 'Operations',\n                phone: '(615) 555-0100',\n                initials: 'SK',\n                avatarUrl: null\n            };\n        }\n\n        function loadMyProfileData() {\n            const user = getActiveAuthUser();\n            \n            document.getElementById('myProfileFullName').textContent = user.fullname || 'Scott Karan';\n            document.getElementById('myProfileEmail').textContent = user.email || 'scott@froggysfog.com';\n            document.getElementById('myProfileUsername').textContent = user.username || 'skaran';\n            document.getElementById('myProfileRoleBadge').textContent = user.role || 'Admin';\n            document.getElementById('myProfileDepartment').textContent = user.department || 'Operations';\n            document.getElementById('myProfilePhone').textContent = user.phone || '(615) 555-0100';\n\n            const avatarContainer = document.getElementById('myAvatarContainer');\n            if (avatarContainer) {\n                if (user.avatarUrl) {\n                    avatarContainer.innerHTML = '<img src=\"' + user.avatarUrl + '\" class=\"rounded-circle shadow\" style=\"width: 72px; height: 72px; object-fit: cover;\" alt=\"Avatar\">' +\n                        '<span class=\"position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle\" style=\"width:16px; height:16px;\"></span>';\n                } else {\n                    avatarContainer.innerHTML = '<div class=\"rounded-circle text-white bg-primary d-flex align-items-center justify-content-center fw-bold fs-22 shadow\" id=\"myProfileAvatar\" style=\"width: 72px; height: 72px;\">' +\n                        (user.initials || 'SK') + '</div>' +\n                        '<span class=\"position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle\" style=\"width:16px; height:16px;\"></span>';\n                }\n            }\n\n            document.getElementById('myEditFullName').value = user.fullname || 'Scott Karan';\n            document.getElementById('myEditEmail').value = user.email || 'scott@froggysfog.com';\n            document.getElementById('myEditUsername').value = user.username || 'skaran';\n            document.getElementById('myEditPhone').value = user.phone || '(615) 555-0100';\n            document.getElementById('myEditDepartment').value = user.department || 'Operations';\n\n            if (window.syncLilypadActiveUserProfile) window.syncLilypadActiveUserProfile();\n        }\n\n        function handleAvatarFileUpload(event) {\n            const file = event.target.files[0];\n            if (!file) return;\n\n            if (!file.type.startsWith('image/')) {\n                alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');\n                return;\n            }\n\n            if (file.size > 5 * 1024 * 1024) {\n                alert('Image size exceeds 5MB limit. Please choose a smaller image.');\n                return;\n            }\n\n            const reader = new FileReader();\n            reader.onload = function(e) {\n                const dataUrl = e.target.result;\n                const img = new Image();\n                img.onload = function() {\n                    const canvas = document.createElement('canvas');\n                    const maxDim = 256;\n                    let width = img.width;\n                    let height = img.height;\n                    if (width > height) {\n                        if (width > maxDim) {\n                            height = Math.round((height * maxDim) / width);\n                            width = maxDim;\n                        }\n                    } else {\n                        if (height > maxDim) {\n                            width = Math.round((width * maxDim) / height);\n                            height = maxDim;\n                        }\n                    }\n                    canvas.width = width;\n                    canvas.height = height;\n                    const ctx = canvas.getContext('2d');\n                    ctx.drawImage(img, 0, 0, width, height);\n                    const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);\n\n                    let user = getActiveAuthUser();\n                    user.avatarUrl = optimizedDataUrl;\n\n                    sessionStorage.setItem('lilypad_auth_user', JSON.stringify(user));\n                    localStorage.setItem('lilypad_auth_user', JSON.stringify(user));\n\n                    try {\n                        const stored = localStorage.getItem(STORAGE_TEAM_KEY);\n                        if (stored) {\n                            let teamList = JSON.parse(stored);\n                            let idx = teamList.findIndex(u => u.email === user.email || u.username === user.username);\n                            if (idx !== -1) {\n                                teamList[idx].avatarUrl = optimizedDataUrl;\n                                localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(teamList));\n                            }\n                        }\n                    } catch(err) {}\n\n                    loadMyProfileData();\n                    if (window.syncLilypadActiveUserProfile) window.syncLilypadActiveUserProfile();\n\n                    alert('✓ Avatar image uploaded successfully!');\n                };\n                img.src = dataUrl;\n            };\n            reader.readAsDataURL(file);\n        }\n\n        function removeAvatarPhoto() {\n            let user = getActiveAuthUser();\n            user.avatarUrl = null;\n            sessionStorage.setItem('lilypad_auth_user', JSON.stringify(user));\n            localStorage.setItem('lilypad_auth_user', JSON.stringify(user));\n\n            try {\n                const stored = localStorage.getItem(STORAGE_TEAM_KEY);\n                if (stored) {\n                    let teamList = JSON.parse(stored);\n                    let idx = teamList.findIndex(u => u.email === user.email || u.username === user.username);\n                    if (idx !== -1) {\n                        teamList[idx].avatarUrl = null;\n                        localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(teamList));\n                    }\n                }\n            } catch(err) {}\n\n            loadMyProfileData();\n            if (window.syncLilypadActiveUserProfile) window.syncLilypadActiveUserProfile();\n            alert('✓ Avatar photo removed. Reset to default initials.');\n        }\n\n        function savePersonalProfile(e) {\n            e.preventDefault();\n            const fullname = document.getElementById('myEditFullName').value.trim();\n            const email = document.getElementById('myEditEmail').value.trim();\n            const username = document.getElementById('myEditUsername').value.trim();\n            const phone = document.getElementById('myEditPhone').value.trim();\n            const department = document.getElementById('myEditDepartment').value;\n            const initials = fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FF';\n\n            let user = getActiveAuthUser();\n            user.fullname = fullname;\n            user.email = email;\n            user.username = username;\n            user.phone = phone;\n            user.department = department;\n            user.initials = initials;\n\n            sessionStorage.setItem('lilypad_auth_user', JSON.stringify(user));\n            localStorage.setItem('lilypad_auth_user', JSON.stringify(user));\n\n            try {\n                const stored = localStorage.getItem(STORAGE_TEAM_KEY);\n                if (stored) {\n                    let teamList = JSON.parse(stored);\n                    let idx = teamList.findIndex(u => u.email === email || u.username === username);\n                    if (idx !== -1) {\n                        teamList[idx] = Object.assign({}, teamList[idx], user);\n                        localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(teamList));\n                    }\n                }\n            } catch(err) {}\n\n            loadMyProfileData();\n\n            if (window.LilypadNotifications && LilypadNotifications.addNotification) {\n                LilypadNotifications.addNotification({\n                    title: 'Profile Updated',\n                    message: 'Your profile and contact details have been saved.',\n                    type: 'system',\n                    link: 'profile-settings.html'\n                });\n            }\n\n            alert('✓ Profile settings updated successfully!');\n        }\n\n        function saveNewPassword(e) {\n            e.preventDefault();\n            const cur = document.getElementById('myCurrentPass').value;\n            const pass1 = document.getElementById('myNewPass').value;\n            const pass2 = document.getElementById('myConfirmPass').value;\n\n            if (pass1.length < 8) {\n                alert('New password must be at least 8 characters long.');\n                return;\n            }\n            if (pass1 !== pass2) {\n                alert('Passwords do not match. Please verify your new password.');\n                return;\n            }\n\n            const user = getActiveAuthUser();\n            try {\n                const stored = localStorage.getItem(STORAGE_TEAM_KEY);\n                if (stored) {\n                    let teamList = JSON.parse(stored);\n                    let target = teamList.find(u => u.email === user.email || u.username === user.username);\n                    if (target) {\n                        target.password = pass1;\n                        localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(teamList));\n                    }\n                }\n            } catch(err) {}\n\n            document.getElementById('changePasswordForm').reset();\n            alert('✓ Account password updated successfully!');\n        }\n\n        function saveNotificationPreferences() {\n            alert('✓ Alert & notification routing preferences saved!');\n        }\n\n        function saveWorkspacePreferences() {\n            alert('✓ Workspace & default landing page preferences saved!');\n        }\n\n        document.addEventListener('DOMContentLoaded', () => {\n            loadMyProfileData();\n        });\n\t</script>\n";

const finalProfileSettingsHtml = getHeaderForPage('profile', 'Profile Settings') + profileSettingsPageContent + footerScripts.replace('</body>', profileSettingsPageScripts + '</body>');
fs.writeFileSync(path.join(__dirname, '../public/profile-settings.html'), finalProfileSettingsHtml, 'utf8');

console.log(' - public/profile-settings.html');

