// ==========================================
// PRODUCT UPLOAD SERVER
// Run with: node server.js
// ==========================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PRODUCTS_JSON = path.join(__dirname, 'data', 'products.json');
const IMAGES_DIR = path.join(__dirname, 'assets', 'images', 'products');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Parse JSON body from request
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// Load products.json
function loadProducts() {
    try {
        const data = fs.readFileSync(PRODUCTS_JSON, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { products: [], categories: [], manufacturers: [] };
    }
}

// Save products.json
function saveProducts(data) {
    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(data, null, 2), 'utf8');
}

// Save base64 image to file
function saveImage(base64Data, productId, imageIndex = 1) {
    // Remove data URL prefix if present
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid image data');
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    const filename = `${productId}-${imageIndex}.${extension}`;
    const filepath = path.join(IMAGES_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    return productId; // Return the base name for the JSON
}

// Handle API requests
async function handleAPI(req, res) {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /api/products - Get all products
    if (url.pathname === '/api/products' && req.method === 'GET') {
        const data = loadProducts();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // POST /api/products - Add new product
    if (url.pathname === '/api/products' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const data = loadProducts();

            // Handle image upload
            if (body.imageData && body.imageData.startsWith('data:image')) {
                body.product.image = saveImage(body.imageData, body.product.id);
                body.product.imageType = 'file';
            }

            // Add product
            data.products.push(body.product);
            saveProducts(data);

            console.log(`[+] Added product: ${body.product.id} - ${body.product.title}`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, product: body.product }));
        } catch (e) {
            console.error('Error adding product:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // PUT /api/products/:id - Update product
    if (url.pathname.startsWith('/api/products/') && req.method === 'PUT') {
        try {
            const productId = url.pathname.split('/').pop();
            const body = await parseBody(req);
            const data = loadProducts();

            const index = data.products.findIndex(p => p.id === productId);
            if (index === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Product not found' }));
                return;
            }

            // Handle image upload
            if (body.imageData && body.imageData.startsWith('data:image')) {
                body.product.image = saveImage(body.imageData, body.product.id);
                body.product.imageType = 'file';
            }

            data.products[index] = body.product;
            saveProducts(data);

            console.log(`[~] Updated product: ${body.product.id} - ${body.product.title}`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, product: body.product }));
        } catch (e) {
            console.error('Error updating product:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // DELETE /api/products/:id - Delete product
    if (url.pathname.startsWith('/api/products/') && req.method === 'DELETE') {
        try {
            const productId = url.pathname.split('/').pop();
            const data = loadProducts();

            const product = data.products.find(p => p.id === productId);
            if (!product) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Product not found' }));
                return;
            }

            data.products = data.products.filter(p => p.id !== productId);
            saveProducts(data);

            console.log(`[-] Deleted product: ${productId}`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (e) {
            console.error('Error deleting product:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // POST /api/categories - Add category
    if (url.pathname === '/api/categories' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const data = loadProducts();

            data.categories.push(body.category);
            saveProducts(data);

            console.log(`[+] Added category: ${body.category.name}`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // POST /api/manufacturers - Add manufacturer
    if (url.pathname === '/api/manufacturers' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const data = loadProducts();

            data.manufacturers.push(body.manufacturer);
            saveProducts(data);

            console.log(`[+] Added manufacturer: ${body.manufacturer.name}`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // Unknown API endpoint
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Serve static files
function serveStatic(req, res) {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
}

// Create server
const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
        handleAPI(req, res);
    } else {
        serveStatic(req, res);
    }
});

server.listen(PORT, () => {
    console.log('');
    console.log('==========================================');
    console.log('  ELEKTRO DVORAK - Product Upload Server');
    console.log('==========================================');
    console.log('');
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log(`  Builder at:        http://localhost:${PORT}/builder/`);
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('');
    console.log('------------------------------------------');
    console.log('  Activity Log:');
    console.log('------------------------------------------');
});
