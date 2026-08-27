const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../public/index.html');
const ticketsPath = path.join(__dirname, '../public/tickets.html');
const baseTemplatePath = path.join(__dirname, '../public/base-template.html');

const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Find split points in index.html
// 1. From start through <div class="page-wrapper">\s*<div class="content pb-0">
const contentStartMarker = '<div class="content pb-0">';
const footerStartMarker = '<!-- Start Footer -->';

const headerSidebarPart = indexHtml.substring(0, indexHtml.indexOf(contentStartMarker) + contentStartMarker.length);
const footerScriptsPart = indexHtml.substring(indexHtml.indexOf(footerStartMarker));

// Create Base Template
const baseTemplateContent = headerSidebarPart + `
				<!-- Page Header -->
				<div class="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
					<div>
						<h4 class="mb-0">Page Title</h4>
						<p class="text-muted fs-13 mb-0">Module subtitle or description goes here.</p>
					</div>
					<div class="gap-2 d-flex align-items-center flex-wrap">
						<button class="btn btn-primary btn-sm"><i class="ti ti-plus me-1"></i> New Action</button>
					</div>
				</div>

				<!-- Page Body Content Area -->
				<div class="card border-0 shadow-sm rounded-3 p-4 mb-4">
					<h5 class="fw-bold text-dark mb-2">Module Content Goes Here</h5>
					<p class="text-muted fs-13 mb-0">This master template shares 100% of the authentic theme header, search, modals, sidebar navigation, and scripts.</p>
				</div>
` + footerScriptsPart;

fs.writeFileSync(baseTemplatePath, baseTemplateContent, 'utf8');
console.log('Successfully generated public/base-template.html');

