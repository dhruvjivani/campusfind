/**
 * resetPasswords.js
 * Run once to fix all user passwords in the database.
 *
 * Usage:  node resetPasswords.js
 *
 * After running:
 *   Staff  : staff@conestogac.on.ca     → Staff@123
 *   Staff  : djivani@conestogac.on.ca   → Admin@123
 *   Student: student@conestogac.on.ca   → Student@123
 *   Student: maya@conestogac.on.ca      → Student@123
 *   Student: alex@conestogac.on.ca      → Student@123
 *   Student: sarah@conestogac.on.ca     → Student@123
 */

const bcrypt = require('bcryptjs');
const pool   = require('./config/database');
require('dotenv').config();

async function resetPasswords() {
  try {
    console.log('🔑 Resetting all user passwords...\n');

    // Hash all passwords fresh with bcryptjs ($2a$ format — works with Node)
    const [staffHash1, staffHash2, studentHash] = await Promise.all([
      bcrypt.hash('Admin@123',   10),
      bcrypt.hash('Staff@123',   10),
      bcrypt.hash('Student@123', 10),
    ]);

    // Update each account individually
    const updates = [
      { email: 'djivani@conestogac.on.ca', hash: staffHash1,  label: 'Admin@123'   },
      { email: 'staff@conestogac.on.ca',   hash: staffHash2,  label: 'Staff@123'   },
      { email: 'student@conestogac.on.ca', hash: studentHash, label: 'Student@123' },
      { email: 'maya@conestogac.on.ca',    hash: studentHash, label: 'Student@123' },
      { email: 'alex@conestogac.on.ca',    hash: studentHash, label: 'Student@123' },
      { email: 'sarah@conestogac.on.ca',   hash: studentHash, label: 'Student@123' },
    ];

    for (const u of updates) {
      const result = await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, role',
        [u.hash, u.email]
      );
      if (result.rows.length > 0) {
        const { email, role } = result.rows[0];
        console.log(`  ✅  [${role.padEnd(7)}] ${email.padEnd(35)} → ${u.label}`);
      } else {
        console.log(`  ⚠️  Not found: ${u.email}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ✅  All passwords reset successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('  STAFF LOGIN');
    console.log('  Email   : staff@conestogac.on.ca');
    console.log('  Password: Staff@123');
    console.log('───────────────────────────────────────────────────');
    console.log('  STAFF LOGIN (admin)');
    console.log('  Email   : djivani@conestogac.on.ca');
    console.log('  Password: Admin@123');
    console.log('───────────────────────────────────────────────────');
    console.log('  STUDENT LOGIN');
    console.log('  Email   : student@conestogac.on.ca');
    console.log('  Password: Student@123');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetPasswords();
