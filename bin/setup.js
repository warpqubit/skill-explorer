#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEST_NAME = 'skill-explorer';
const desktopPath = path.join(os.homedir(), 'Desktop', DEST_NAME);

// Archivos y carpetas a copiar (relativo a la raíz del paquete)
const PKG_ROOT = path.join(__dirname, '..');
const FILES = [
  'index.html',
  'launch.bat',
  path.join('css', 'styles.css'),
  path.join('js', 'app.js'),
  path.join('assets', 'logo.png'),
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

console.log('\n🚀  Skill Explorer — Setup\n');
console.log(`📁  Destino: ${desktopPath}\n`);

try {
  ensureDir(desktopPath);

  for (const file of FILES) {
    const src = path.join(PKG_ROOT, file);
    const dest = path.join(desktopPath, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
      console.log(`  ✓  ${file}`);
    } else {
      console.warn(`  ⚠  No encontrado: ${file}`);
    }
  }

  console.log('\n✅  Proyecto copiado al Escritorio.');
  console.log('\n👉  Para abrir la app:\n');
  console.log(`    cd "${desktopPath}"`);
  console.log('    launch.bat\n');
} catch (err) {
  console.error('\n❌  Error:', err.message);
  process.exit(1);
}
