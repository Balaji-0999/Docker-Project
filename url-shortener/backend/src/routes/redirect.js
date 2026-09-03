const express = require('express');
const pool = require('../db');
const redisClient = require('../redisClient');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const router = express.Router();

router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    // STEP 1: Pehle Redis mein check karo (fast path)
    let originalUrl = await redisClient.get(shortCode);

    // STEP 2: Redis mein nahi mila to DB se lao
    if (!originalUrl) {
      const result = await pool.query('SELECT * FROM links WHERE short_code = $1', [shortCode]);
      if (result.rows.length === 0) return res.status(404).send('Link not found');
      originalUrl = result.rows[0].original_url;
      await redisClient.set(shortCode, originalUrl); // agli baar ke liye cache kar do
    }

    // STEP 3: Click ka analytics data record karo (background mein, redirect ko block kiye bina)
    recordClick(shortCode, req);

    // STEP 4: User ko original URL pe bhej do
    res.redirect(originalUrl);
  } catch (err) {
    res.status(500).send('Server error');
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
