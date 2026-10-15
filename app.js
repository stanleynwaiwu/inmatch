const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.MONGO_URI) {
  console.error('Startup failed: MONGO_URI is missing from .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Startup failed: JWT_SECRET is missing from .env');
  process.exit(1);
}

app.use(express.json({ limit: '1mb' }));

// Public InMatch website.
app.use(express.static(path.join(__dirname, 'frontend-UI')));

// Admin dashboard and login pages.
app.use('/admin', express.static(path.join(__dirname, 'frontend-admin')));

// Basic health endpoint.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes.
app.use('/api/leagues', require('./routes/leagueRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/match-details', require('./routes/matchDetails'));
app.use('/api/admins', require('./routes/adminRoutes'));

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinMatch', (matchId) => {
    if (typeof matchId === 'string' && mongoose.isValidObjectId(matchId)) {
      socket.join(matchId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.set('io', io);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`InMatch server running at http://localhost:${PORT}`);
      console.log(`Public website: http://localhost:${PORT}/`);
      console.log(`Admin login: http://localhost:${PORT}/admin/admin-login.html`);
    });
  } catch (error) {
    console.error('Unable to connect to MongoDB. Server was not started.');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
