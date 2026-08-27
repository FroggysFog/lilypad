const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8118;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// In-Memory Seed Storage for Preview Server
const intakeFormsSeed = [
  {
    name: 'IT & Hardware Request',
    slug: 'it-hardware',
    icon: 'ti-device-laptop',
    target: 'internal',
    defaultPriority: 'Normal',
    fields: [
      { name: 'hardwareType', label: 'Hardware Item', type: 'select', required: true, options: [{ label: 'MacBook Pro 16"', value: 'macbook' }, { label: 'Dell XPS 15', value: 'dell' }] },
      { name: 'department', label: 'Department', type: 'select', required: true, options: [{ label: 'Engineering', value: 'eng' }, { label: 'Sales', value: 'sales' }] },
      { name: 'assetTag', label: 'Asset Tag', type: 'text', required: false },
      { name: 'businessJustification', label: 'Business Justification', type: 'textarea', required: true }
    ]
  },
  {
    name: 'Client ERP Setup & Onboarding',
    slug: 'client-onboarding',
    icon: 'ti-building-skyscraper',
    target: 'both',
    defaultPriority: 'High',
    fields: [
      { name: 'clientCompanyName', label: 'Client Company Name', type: 'text', required: true },
      { name: 'userSeats', label: 'User Seats Required', type: 'number', required: true, defaultValue: 10 },
      { name: 'targetGoLiveDate', label: 'Target Go-Live Date', type: 'date', required: true }
    ]
  },
  {
    name: 'Software Bug & Issue Report',
    slug: 'bug-report',
    icon: 'ti-bug',
    target: 'both',
    defaultPriority: 'High',
    fields: [
      { name: 'affectedModule', label: 'Affected Module', type: 'select', options: [{ label: 'Invoicing', value: 'invoicing' }, { label: 'Inventory', value: 'inventory' }] },
      { name: 'stepsToReproduce', label: 'Steps to Reproduce', type: 'textarea', required: true }
    ]
  }
];

let ticketsSeed = [
  {
    _id: '1',
    uid: 1001,
    formattedUid: 'LP-1001',
    title: 'MacBook Pro 16" Developer Workstation Request',
    description: 'New senior engineer onboarding next Monday.',
    status: 'To-Do',
    priority: 'High',
    categoryName: 'IT & Hardware Request',
    reporter: { fullname: 'Sarah Connor' },
    externalReporter: { name: 'Sarah Connor (Engineering Lead)' },
    assignee: { fullname: 'Scott Karan' },
    formData: {
      hardwareType: 'MacBook Pro 16"',
      department: 'Engineering',
      assetTag: 'New Hire',
      businessJustification: 'Local Docker and Kubernetes cluster workloads.'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    uid: 1002,
    formattedUid: 'LP-1002',
    title: 'Acme Logistics ERP Onboarding & DB Provisioning',
    description: 'External client onboarding for 50 initial operator seats.',
    status: 'To-Do',
    priority: 'Urgent',
    categoryName: 'Client ERP Setup & Onboarding',
    reporter: null,
    externalReporter: { name: 'Robert Johnson', company: 'Acme Logistics Inc.' },
    assignee: { fullname: 'Alex Morgan' },
    formData: {
      clientCompanyName: 'Acme Logistics Inc.',
      userSeats: 50,
      targetGoLiveDate: '2026-09-15'
    },
    createdAt: new Date().toISOString()
  }
];

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // JSON API Endpoints
  if (pathname === '/api/v1/lilypad/intake-forms') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, data: intakeFormsSeed }));
  }

  if (pathname === '/api/v1/lilypad/tickets/todo') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      counts: {
        todo: ticketsSeed.filter(t => t.status === 'To-Do').length,
        inProgress: ticketsSeed.filter(t => t.status === 'In Progress').length,
        complete: ticketsSeed.filter(t => t.status === 'Complete').length,
        total: ticketsSeed.length
      },
      data: ticketsSeed
    }));
  }

  // URL Rewrites for clean paths
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (pathname === '/dashboard') {
    pathname = '/dashboard.html';
  } else if (pathname === '/tickets') {
    pathname = '/tickets.html';
  } else if (pathname === '/login') {
    pathname = '/login.html';
  } else if (pathname === '/client-portal' || pathname === '/portal') {
    pathname = '/client-portal.html';
  }

  // Handle Mock POST endpoints
  if (req.method === 'POST') {
    if (pathname === '/forgotpass') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('Password reset email sent!');
    }
    if (pathname === '/login') {
      res.writeHead(302, { Location: '/dashboard.html' });
      return res.end();
    }
  }

  let filePath = path.normalize(path.join(PUBLIC_DIR, pathname));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        filePath = htmlPath;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
    } else if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 LilyPad ERP Full Interactive Ticketing Server LIVE!`);
  console.log(`  👉 Uniform To-Do Board: http://localhost:${PORT}/tickets`);
  console.log(`  👉 Login Screen:        http://localhost:${PORT}/login`);
  console.log(`======================================================\n`);
});
