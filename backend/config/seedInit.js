const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const Request = require('../models/Request');

const initialBooks = [
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

async function seedInitialDataIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // Data already exists

    console.log('[MongoDB] Populating initial sample data for Compass inspection...');

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

    // Seed books
    const createdBooks = [];
    for (let i = 0; i < initialBooks.length; i++) {
      const owner = i < 3 ? user1._id : user2._id;
      const book = await Book.create({
        ...initialBooks[i],
        owner
      });
      createdBooks.push(book);
    }

    // Seed sample exchange request: Emma requests David's book
    const davidBook = createdBooks.find(b => b.owner.toString() === user2._id.toString());
    if (davidBook) {
      await Request.create({
        book: davidBook._id,
        requester: user1._id,
        owner: user2._id,
        status: 'Pending'
      });
    }

    console.log('[MongoDB] Sample data seeded: 2 users, 6 books, 1 request.');
  } catch (err) {
    console.warn('[MongoDB] Auto-seeding note:', err.message);
  }
}

module.exports = seedInitialDataIfEmpty;
