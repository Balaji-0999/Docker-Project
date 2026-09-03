const express = require('express');
const { nanoid } = require('nanoid');
const pool = require('../db');
const redisClient = require('../redisClient');
const verifyToken = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken); // ab is file ke saare routes protected hain

router.post('/shorten', async (req, res) => {
  const { originalUrl, customAlias } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'URL required' });

  try {
    const shortCode = customAlias || nanoid(7);

    const result = await pool.query(
      'INSERT INTO links (short_code, original_url, user_id) VALUES ($1, $2, $3) RETURNING *',
      [shortCode, originalUrl, req.userId]
    );

    await redisClient.set(shortCode, originalUrl);

    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      ...result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Alias already taken' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT l.*, COUNT(c.id) AS total_clicks
     FROM links l LEFT JOIN clicks c ON l.id = c.link_id
     WHERE l.user_id = $1
     GROUP BY l.id ORDER BY l.created_at DESC`,
    [req.userId]
  );
  res.json(result.rows);
});

router.get('/:id/analytics', async (req, res) => {
  const { id } = req.params;

  const dailyClicks = await pool.query(
    `SELECT DATE(clicked_at) AS date, COUNT(*) AS clicks
     FROM clicks WHERE link_id = $1
     GROUP BY DATE(clicked_at) ORDER BY date`,
    [id]
  );

  const deviceBreakdown = await pool.query(
    `SELECT device, COUNT(*) AS count FROM clicks WHERE link_id = $1 GROUP BY device`,
    [id]
  );

  res.json({
    dailyClicks: dailyClicks.rows,
    deviceBreakdown: deviceBreakdown.rows
  });
});

module.exports = router;
