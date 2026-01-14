<?php
// Serve static files with correct MIME types
// This is a workaround for servers that don't respect .htaccess MIME settings

$request = $_SERVER['REQUEST_URI'];
$file = __DIR__ . $request;

// Remove query string
$file = preg_replace('/\?.*$/', '', $file);

// Security: prevent directory traversal
$file = realpath($file);
if ($file === false || strpos($file, __DIR__) !== 0) {
    http_response_code(404);
    exit('Not found');
}

// If it's a directory, serve index.html
if (is_dir($file)) {
    $file = rtrim($file, '/') . '/index.html';
}

// If file doesn't exist, serve index.html (SPA routing)
if (!file_exists($file)) {
    $file = __DIR__ . '/index.html';
}

// Get file extension
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

// MIME types mapping
$mimeTypes = [
    'html' => 'text/html; charset=utf-8',
    'htm' => 'text/html; charset=utf-8',
    'js' => 'application/javascript; charset=utf-8',
    'mjs' => 'application/javascript; charset=utf-8',
    'css' => 'text/css; charset=utf-8',
    'json' => 'application/json; charset=utf-8',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    'ico' => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf' => 'font/ttf',
    'eot' => 'application/vnd.ms-fontobject',
];

// Set content type
$contentType = $mimeTypes[$ext] ?? 'application/octet-stream';
header('Content-Type: ' . $contentType);

// Set caching headers for assets
if (in_array($ext, ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2'])) {
    header('Cache-Control: public, max-age=31536000'); // 1 year
}

// Output file
readfile($file);
