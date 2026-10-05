/**
 * BookLoop - Database Seed Script
 * Pre-populates sample users and books for immediate testing.
 */

const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Book = require('./models/Book');
const Request = require('./models/Request');

dotenv.config();

const sampleBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Classic Fiction'
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Classic Fiction'
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Dystopian Fiction'
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Technology & Coding'
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help & Philosophy'
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History'
  }
];

async function seedData() {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Request.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});

    console.log('Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      name: 'Emma Watson',
      email: 'emma@example.com',
      password: hashedPassword
    });

    const user2 = await User.create({
      name: 'David Miller',
      email: 'david@example.com',
      password: hashedPassword
    });

    console.log('Seeding sample books...');
    // Give first 3 to Emma, next 3 to David
    for (let i = 0; i < sampleBooks.length; i++) {
      const owner = i < 3 ? user1._id : user2._id;
      await Book.create({
        ...sampleBooks[i],
        owner
      });
    }

    console.log('Sample book requests created...');
    const davidBook = await Book.findOne({ owner: user2._id });
    if (davidBook) {
      await Request.create({
        book: davidBook._id,
        requester: user1._id,
        owner: user2._id,
        status: 'Pending'
      });
    }

    console.log('\n=============================================');
    console.log(' ✅ Sample data successfully seeded!');
    console.log(' Sample Accounts:');
    console.log(' 1. Email: emma@example.com  | Password: password123');
    console.log(' 2. Email: david@example.com | Password: password123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
