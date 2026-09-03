require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const redirectRoutes = require('./routes/redirect');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);

// redirect routes root pe rakhte hain (/xY3kP9 seedha kaam kare, /api ke bina)
// isliye SABSE AAKHIR mein daala hai, taaki /api routes pehle match ho jayein
app.use('/', redirectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
