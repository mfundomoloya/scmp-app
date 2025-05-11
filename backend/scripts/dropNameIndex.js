const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env');
  process.exit(1);
}

async function dropNameIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const db = mongoose.connection.db;
    const indexes = await db.collection('users').indexes();
    console.log('Current indexes:', indexes);

    if (indexes.some(index => index.name === 'name_1')) {
      await db.collection('users').dropIndex('name_1');
      console.log('Dropped name_1 index');
    } else {
      console.log('name_1 index not found');
    }

    console.log('Updated indexes:', await db.collection('users').indexes());
  } catch (err) {
    console.error('Error dropping index:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

dropNameIndex();