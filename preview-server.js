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
  { name: 'Computer/Laptop Issue', slug: 'computer-laptop', icon: 'ti-device-laptop', target: 'internal', defaultPriority: 'Normal' },
  { name: 'Customer Support Request', slug: 'customer-support', icon: 'ti-headset', target: 'both', defaultPriority: 'Normal' },
  { name: 'Fluid Finder Update', slug: 'fluid-finder', icon: 'ti-flask', target: 'internal', defaultPriority: 'Normal' },
  { name: 'FX Machine Support', slug: 'fx-machine', icon: 'ti-cpu', target: 'both', defaultPriority: 'High' },
  { name: 'IT AI Process/UI Development', slug: 'it-ai-ui', icon: 'ti-sparkles', target: 'internal', defaultPriority: 'High' },
  { name: 'Rep Assignment Change', slug: 'rep-assignment', icon: 'ti-user-check', target: 'internal', defaultPriority: 'Normal' },
  { name: 'Vendor Purchase Order', slug: 'vendor-po', icon: 'ti-file-invoice', target: 'internal', defaultPriority: 'Normal' },
  { name: 'Website Frontend Update', slug: 'website-frontend', icon: 'ti-world-www', target: 'both', defaultPriority: 'Normal' }
];

let ticketsSeed = [];

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

  if (pathname === '/') {
    pathname = '/login.html';
  } else if (pathname === '/login') {
    pathname = '/login.html';
  } else if (pathname === '/dashboard') {
    pathname = '/dashboard.html';
  } else if (pathname === '/tickets') {
    pathname = '/tickets.html';
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
      res.writeHead(302, { Location: '/tickets' });
      return res.end();
    }
  }

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
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
