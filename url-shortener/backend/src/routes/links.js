const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const pool = require('../db');
const redisClient = require('../redisClient');
const verifyToken = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

router.post('/shorten', async (req, res) => {
  const { originalUrl, customAlias, expiresIn, password } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'URL required' });

  try {
    const existing = await pool.query(
      'SELECT * FROM links WHERE user_id = $1 AND original_url = $2',
      [req.userId, originalUrl]
    );

    if (existing.rows.length > 0) {
      const link = existing.rows[0];
      return res.status(200).json({
        shortUrl: `${process.env.BASE_URL}/${link.short_code}`,
        ...link,
        alreadyExists: true
      });
    }

    const shortCode = customAlias || nanoid(7);

    let expiresAt = null;
    if (expiresIn === '7d') {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (expiresIn === '30d') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      'INSERT INTO links (short_code, original_url, user_id, expires_at, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, short_code, original_url, user_id, created_at, expires_at',
      [shortCode, originalUrl, req.userId, expiresAt, passwordHash]
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

  const referrerBreakdown = await pool.query(
    `SELECT
       CASE WHEN referrer = 'direct' OR referrer IS NULL THEN 'Direct' ELSE referrer END AS referrer,
       COUNT(*) AS count
     FROM clicks WHERE link_id = $1
     GROUP BY referrer
     ORDER BY count DESC
     LIMIT 5`,
    [id]
  );

  res.json({
    dailyClicks: dailyClicks.rows,
    deviceBreakdown: deviceBreakdown.rows,
    referrerBreakdown: referrerBreakdown.rows
  });
});

module.exports = router;
