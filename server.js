const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// In-memory storage for demo purposes
let pinouts = [];
let categories = [
    { id: 1, name: '8-bit Microcontroller', icon: '🔧', color: '#3498db' },
    { id: 2, name: '16-bit Microcontroller', icon: '⚙️', color: '#e74c3c' },
    { id: 3, name: '32-bit Microcontroller', icon: '🔩', color: '#2ecc71' },
    { id: 4, name: 'Development Board', icon: '📱', color: '#f39c12' },
    { id: 5, name: 'Sensor & Module', icon: '📡', color: '#9b59b6' },
    { id: 6, name: 'Memory & Storage', icon: '💾', color: '#1abc9c' },
    { id: 7, name: 'Communication', icon: '📶', color: '#34495e' },
    { id: 8, name: 'Power Management', icon: '⚡', color: '#e67e22' },
    { id: 9, name: 'Custom/Other', icon: '🔧', color: '#95a5a6' }
];

// Demo users (in production, this would be in a database)
const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'editor', password: 'editor123', role: 'editor' }
];

let nextId = 1;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API Routes
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname, method, parsedUrl);
        return;
    }

    // Slug-based routing for published pinouts
    if (pathname !== '/' && !pathname.includes('.')) {
        handleSlugRoute(req, res, pathname);
        return;
    }

    // Serve static files
    serveStaticFile(req, res, pathname);
});

function handleApiRequest(req, res, pathname, method, parsedUrl) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            let data = body ? JSON.parse(body) : null;
            
            // Authentication endpoints
            if (pathname === '/api/auth/login') {
                if (method === 'POST') {
                    const { username, password } = data;
                    const user = users.find(u => u.username === username && u.password === password);
                    
                    if (user) {
                        // Generate a simple token (in production, use JWT)
                        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            token: token,
                            user: { id: user.id, username: user.username, role: user.role }
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Invalid username or password'
                        }));
                    }
                    return;
                }
            }

            if (pathname === '/api/auth/verify') {
                if (method === 'GET') {
                    const authHeader = req.headers.authorization;
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        const token = authHeader.substring(7);
                        try {
                            const decoded = Buffer.from(token, 'base64').toString();
                            const [userId] = decoded.split(':');
                            const user = users.find(u => u.id == userId);
                            
                            if (user) {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    success: true,
                                    user: { id: user.id, username: user.username, role: user.role }
                                }));
                            } else {
                                res.writeHead(401, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, message: 'Invalid token' }));
                            }
                        } catch (error) {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Invalid token' }));
                        }
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'No token provided' }));
                    }
                    return;
                }
            }

            // Categories endpoint
            if (pathname === '/api/pinouts.php/categories') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, data: categories }));
                return;
            }

            // Pinouts endpoints
            if (pathname === '/api/pinouts.php') {
                if (method === 'GET') {
                    // Get pinouts with pagination and filtering
                    const page = parseInt(parsedUrl.query.page) || 1;
                    const limit = parseInt(parsedUrl.query.limit) || 12;
                    const category = parsedUrl.query.category;
                    const search = parsedUrl.query.search;

                    let filteredPinouts = [...pinouts];

                    // Filter by category
                    if (category) {
                        filteredPinouts = filteredPinouts.filter(p => p.category_id == category);
                    }

                    // Filter by search
                    if (search) {
                        const searchLower = search.toLowerCase();
                        filteredPinouts = filteredPinouts.filter(p => 
                            p.chip_name.toLowerCase().includes(searchLower) ||
                            p.title.toLowerCase().includes(searchLower)
                        );
                    }

                    // Pagination
                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedPinouts = filteredPinouts.slice(startIndex, endIndex);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        data: {
                            pinouts: paginatedPinouts,
                            pagination: {
                                page,
                                limit,
                                total: filteredPinouts.length,
                                pages: Math.ceil(filteredPinouts.length / limit)
                            }
                        }
                    }));
                    return;
                }

                if (method === 'POST') {
                    // Create new pinout
                    if (!data) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'No data provided' }));
                        return;
                    }

                    // Ensure slug is unique
                    let slug = data.page_slug;
                    if (!slug) {
                        // Generate slug from title if not provided
                        slug = data.title ? data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') : `pinout-${nextId}`;
                    }
                    
                    // Make slug unique if it already exists
                    let uniqueSlug = slug;
                    let counter = 1;
                    while (pinouts.some(p => p.page_slug === uniqueSlug)) {
                        uniqueSlug = `${slug}-${counter}`;
                        counter++;
                    }

                    const pinout = {
                        id: nextId++,
                        ...data,
                        page_slug: uniqueSlug,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    pinouts.push(pinout);

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: pinout }));
                    return;
                }
            }

            // Individual pinout endpoints
            const pinoutMatch = pathname.match(/^\/api\/pinouts\.php\/(\d+)$/);
            if (pinoutMatch) {
                const id = parseInt(pinoutMatch[1]);
                const pinoutIndex = pinouts.findIndex(p => p.id === id);

                if (pinoutIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Pinout not found' }));
                    return;
                }

                if (method === 'GET') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: pinouts[pinoutIndex] }));
                    return;
                }

                if (method === 'PUT') {
                    if (!data) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'No data provided' }));
                        return;
                    }

                    // Handle slug uniqueness for updates
                    if (data.page_slug) {
                        let slug = data.page_slug;
                        let uniqueSlug = slug;
                        let counter = 1;
                        
                        // Check if slug is already used by another pinout
                        while (pinouts.some(p => p.page_slug === uniqueSlug && p.id !== id)) {
                            uniqueSlug = `${slug}-${counter}`;
                            counter++;
                        }
                        data.page_slug = uniqueSlug;
                    }

                    pinouts[pinoutIndex] = {
                        ...pinouts[pinoutIndex],
                        ...data,
                        updated_at: new Date().toISOString()
                    };

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data: pinouts[pinoutIndex] }));
                    return;
                }

                if (method === 'DELETE') {
                    pinouts.splice(pinoutIndex, 1);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Pinout deleted' }));
                    return;
                }
            }

            // 404 for unknown API routes
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    });
}

function handleSlugRoute(req, res, pathname) {
    // Remove leading slash from pathname
    const slug = pathname.substring(1);
    
    // Find pinout by slug
    const pinout = pinouts.find(p => p.page_slug === slug);
    
    if (pinout) {
        // Serve the pre-generated HTML content directly
        if (pinout.html_content) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(pinout.html_content);
        } else {
            // Fallback to preview.html template if html_content is not available
            const filePath = path.join(__dirname, 'preview.html');
            
            fs.readFile(filePath, (error, content) => {
                if (error) {
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                } else {
                    // Inject the pinout data into the HTML
                    let html = content.toString();
                    
                    // Add script to load pinout data
                    const scriptTag = `<script>window.pinoutData = ${JSON.stringify(pinout)}; window.pinoutId = ${pinout.id};</script>`;
                    
                    html = html.replace('</head>', scriptTag + '</head>');
                    
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                }
            });
        }
    } else {
        // Slug not found, return 404
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Pinout Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #e74c3c; }
                    a { color: #3498db; text-decoration: none; }
                </style>
            </head>
            <body>
                <h1>404 - Pinout Not Found</h1>
                <p>The pinout "${slug}" was not found.</p>
                <p><a href="/">← Back to Home</a></p>
            </body>
            </html>
        `);
    }
}

function serveStaticFile(req, res, pathname) {
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>404 Not Found</title></head>
                    <body>
                        <h1>404 - File Not Found</h1>
                        <p>The requested file ${pathname} was not found.</p>
                    </body>
                    </html>
                `);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`🚀 MicroPinouts server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api/`);
    console.log(`🔧 Categories: http://localhost:${PORT}/api/pinouts.php/categories`);
    console.log(`📱 Pinouts: http://localhost:${PORT}/api/pinouts.php`);
    console.log(`\nPress Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});