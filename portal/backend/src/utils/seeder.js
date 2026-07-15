/**
 * seeder.js
 *
 * Creates ONLY the Super Admin account.
 * Run once after first deployment:
 *   npm run seed          (from portal/backend)
 *
 * After running, log in as Super Admin and create all other accounts
 * (Admin, Mentor, Student) through the User Management page in the portal.
 *
 * Super Admin credentials:
 *   Email    : superadmin@krmangalam.edu.in
 *   Password : KRMUSuperAdmin@2024
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User     = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Remove existing super admin only (leaves other data intact on re-runs) ──
  const existing = await User.findOne({ email: 'superadmin@krmangalam.edu.in' });
  if (existing) {
    console.log('⚠️  Super Admin already exists. Skipping creation.');
    console.log('\n──────────────────────────────────────────────');
    console.log('  Super Admin Login');
    console.log('──────────────────────────────────────────────');
    console.log('  Email    : superadmin@krmangalam.edu.in');
    console.log('  Password : KRMUSuperAdmin@2024');
    console.log('──────────────────────────────────────────────\n');
    process.exit(0);
  }

  // ── Create Super Admin ────────────────────────────────────────────────────
  await User.create({
    name:     'Super Admin',
    email:    'superadmin@krmangalam.edu.in',
    password: 'KRMUSuperAdmin@2024',
    role:     'superadmin',
    isActive: true,
  });

  console.log('\n✅ Super Admin account created successfully!\n');
  console.log('══════════════════════════════════════════════');
  console.log('  K.R. Mangalam University — Internship Portal');
  console.log('══════════════════════════════════════════════');
  console.log('  Super Admin Login Credentials');
  console.log('──────────────────────────────────────────────');
  console.log('  Email    : superadmin@krmangalam.edu.in');
  console.log('  Password : KRMUSuperAdmin@2024');
  console.log('──────────────────────────────────────────────');
  console.log('\n  IMPORTANT: Change this password after first login.');
  console.log('  Use the Super Admin account to create all other');
  console.log('  user accounts (Admin, Mentor, Student) from the');
  console.log('  User Management page inside the portal.\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});
