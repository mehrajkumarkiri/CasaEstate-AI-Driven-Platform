/**
 * MongoDB Seed Script
 * Run with: node src/seed/seedData.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Unit = require('../models/Unit');
const Booking = require('../models/Booking');
const Ledger = require('../models/Ledger');
const { mockProjects, mockUnits, mockBookings, mockLedger } = require('./mockData');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aura-estates');
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing existing data...');
    await Promise.all([Project.deleteMany({}), Unit.deleteMany({}), Booking.deleteMany({}), Ledger.deleteMany({})]);

    console.log('🌱 Seeding projects...');
    const projects = await Project.insertMany(mockProjects.map(p => ({ ...p, _id: undefined })));
    console.log(`   ✓ ${projects.length} projects inserted`);

    console.log('🌱 Seeding units...');
    const units = await Unit.insertMany(mockUnits.slice(0, 40).map(u => ({ ...u, _id: undefined, projectId: projects[0]._id })));
    console.log(`   ✓ ${units.length} units inserted`);

    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
