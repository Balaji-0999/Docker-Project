const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const redisClient = require('../redisClient');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const router = express.Router();

router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const result = await pool.query('SELECT * FROM links WHERE short_code = $1', [shortCode]);
    if (result.rows.length === 0) return res.status(404).send('Link not found');

    const link = result.rows[0];

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      await redisClient.del(shortCode);
      return res.status(410).send('This link has expired');
    }

    // Password-protected link → frontend ke unlock page pe bhej do
    if (link.password_hash) {
      return res.redirect(`${process.env.FRONTEND_URL}/unlock/${shortCode}`);
    }

    let originalUrl = await redisClient.get(shortCode);
    if (!originalUrl) {
      originalUrl = link.original_url;
      await redisClient.set(shortCode, originalUrl);
    }

    recordClick(shortCode, req);
    res.redirect(originalUrl);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Password verify karke asli URL wapas dena (frontend unlock page yahi call karega)
router.post('/verify/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const { password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM links WHERE short_code = $1', [shortCode]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });

    const link = result.rows[0];

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    if (!link.password_hash) {
      return res.json({ originalUrl: link.original_url });
    }

    const match = await bcrypt.compare(password, link.password_hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    recordClick(shortCode, req);
    res.json({ originalUrl: link.original_url });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

async function recordClick(shortCode, req) {
  const linkResult = await pool.query('SELECT id FROM links WHERE short_code = $1', [shortCode]);
  if (linkResult.rows.length === 0) return;
  const linkId = linkResult.rows[0].id;

  const parser = new UAParser(req.headers['user-agent']);
  const device = parser.getDevice().type || 'desktop';
  const browser = parser.getBrowser().name || 'unknown';

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const geo = geoip.lookup(ip);
  const country = geo ? geo.country : 'unknown';

  await pool.query(
    'INSERT INTO clicks (link_id, device, browser, country, referrer) VALUES ($1, $2, $3, $4, $5)',
    [linkId, device, browser, country, req.headers['referer'] || 'direct']
  );
}

module.exports = router;
