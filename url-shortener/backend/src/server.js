require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const redirectRoutes = require('./routes/redirect');

const app = express();
app.use(cors());
app.use(express.json());

// Login/register par strict limit — bots ko password guess karne se rokta hai
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute ki window
  max: 10, // is window mein max 10 requests
  message: { error: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Redirect par halka limit — normal users affect na ho, bas bulk abuse ruke
const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute ki window
  max: 60, // 1 minute mein max 60 requests per IP
  message: 'Too many requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => res.send('OK'));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/links', linkRoutes);
app.use('/', redirectLimiter, redirectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
