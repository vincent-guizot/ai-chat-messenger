#!/usr/bin/env node
/**
 * Memastikan folder prisma/migrations berisi migrasi sebelum "prisma migrate deploy" dijalankan.
 *
 * Tanpa pengecekan ini, Prisma hanya menulis "No migration found" lalu lanjut,
 * sehingga tabel tidak pernah dibuat dan error baru muncul belakangan (mis. saat seed).
 */
const fs = require('fs');
const path = require('path');

const migrationsFolder = path.resolve(__dirname, '..', 'prisma', 'migrations');

function findMigrationNames() {
  if (!fs.existsSync(migrationsFolder)) {
    return [];
  }

  const entries = fs.readdirSync(migrationsFolder, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(migrationsFolder, entry.name, 'migration.sql')))
    .map((entry) => entry.name);
}

const migrationNames = findMigrationNames();

if (migrationNames.length === 0) {
  console.error('');
  console.error('[Migrasi] Tidak ada file migrasi di backend/prisma/migrations.');
  console.error('Tanpa file ini, tabel database tidak akan dibuat.');
  console.error('');
  console.error('Cara memperbaiki (pilih salah satu):');
  console.error('  1. Kembalikan folder dari git:   git restore backend/prisma/migrations');
  console.error('  2. Buat migrasi dari schema:     npx prisma migrate dev --name init');
  console.error('');
  process.exit(1);
}

console.log(`[Migrasi] ${migrationNames.length} migrasi ditemukan: ${migrationNames.join(', ')}`);
