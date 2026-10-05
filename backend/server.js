const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedInitialDataIfEmpty = require('./config/seedInit');

// Load environment variables
dotenv.config();

// Connect to MongoDB & initialize seed data if empty
connectDB().then(() => {
  seedInitialDataIfEmpty();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'BookLoop – Book Sharing & Exchange Platform',
    timestamp: new Date().toISOString()
  });
});

// Default 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Catch-all route to serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` BookLoop is running!`);
  console.log(` Server URL : http://localhost:${PORT}`);
  console.log(` Frontend   : http://localhost:${PORT}/index.html`);
  console.log(` Mode       : ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
