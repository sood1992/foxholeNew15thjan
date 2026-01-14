<?php
/**
 * Main entry point for Foxhole
 * Handles all requests and serves files with correct MIME types
 * This bypasses server MIME type configuration issues on Bluehost
 */

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Remove leading slash
$path = ltrim($path, '/');

// Default to index.html for root
if ($path === '' || $path === '/') {
    $path = 'index.html';
}

// Build file path
$file = __DIR__ . '/' . $path;

// Security: Prevent directory traversal
$realFile = realpath($file);
$realDir = realpath(__DIR__);

if ($realFile && strpos($realFile, $realDir) === 0 && file_exists($realFile) && !is_dir($realFile)) {
    // File exists, serve it with correct MIME type
    $ext = strtolower(pathinfo($realFile, PATHINFO_EXTENSION));

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
        'webp' => 'image/webp',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject',
        'pdf' => 'application/pdf',
        'xml' => 'application/xml',
        'txt' => 'text/plain; charset=utf-8',
    ];

    $contentType = isset($mimeTypes[$ext]) ? $mimeTypes[$ext] : 'application/octet-stream';

    // Set headers
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . filesize($realFile));

    // Cache static assets
    if (in_array($ext, ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'woff', 'woff2', 'ico'])) {
        header('Cache-Control: public, max-age=31536000, immutable');
    }

    // Output file
    readfile($realFile);
    exit;
}

// File not found or is a route - serve index.html (SPA fallback)
$indexFile = __DIR__ . '/index.html';
if (file_exists($indexFile)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($indexFile);
    exit;
}

// Nothing found
http_response_code(404);
echo 'Not Found';
