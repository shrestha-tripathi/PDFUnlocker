/**
 * Post-build script to update manifest.json and sw.js with the correct base path
 * for GitHub Pages deployment.
 */

const fs = require('fs');
const path = require('path');

const basePath = '';
const outDir = path.join(__dirname, '..', 'out');

console.log(`Updating manifest and service worker with basePath: "${basePath}"`);

// Update manifest.json
const manifestPath = path.join(outDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  // Update start_url and scope
  manifest.start_url = `${basePath}/`;
  manifest.scope = `${basePath}/`;
  
  // Update icon paths
  if (manifest.icons) {
    manifest.icons = manifest.icons.map(icon => ({
      ...icon,
      src: `${basePath}${icon.src.startsWith('/') ? icon.src : '/' + icon.src}`
    }));
  }
  
  // Update screenshot paths if they exist
  if (manifest.screenshots) {
    manifest.screenshots = manifest.screenshots.map(screenshot => ({
      ...screenshot,
      src: `${basePath}${screenshot.src.startsWith('/') ? screenshot.src : '/' + screenshot.src}`
    }));
  }
  
  // Update file_handlers
  if (manifest.file_handlers) {
    manifest.file_handlers = manifest.file_handlers.map(handler => ({
      ...handler,
      action: `${basePath}${handler.action.startsWith('/') ? handler.action : '/' + handler.action}`
    }));
  }
  
  // Update share_target
  if (manifest.share_target) {
    manifest.share_target.action = `${basePath}${manifest.share_target.action.startsWith('/') ? manifest.share_target.action : '/' + manifest.share_target.action}`;
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✓ Updated manifest.json');
}

// Update sw.js
const swPath = path.join(outDir, 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf-8');
  
  // Update PRECACHE_ASSETS paths
  swContent = swContent.replace(
    /const PRECACHE_ASSETS = \[([\s\S]*?)\];/,
    `const PRECACHE_ASSETS = [
  '${basePath}/',
  '${basePath}/manifest.json',
  '${basePath}/icons/icon.svg',
];`
  );
  
  // Update the fallback route for navigation
  swContent = swContent.replace(
    /const indexResponse = await caches\.match\('\/'\);/,
    `const indexResponse = await caches.match('${basePath}/');`
  );
  
  fs.writeFileSync(swPath, swContent);
  console.log('✓ Updated sw.js');
}

console.log('Post-build updates complete!');
