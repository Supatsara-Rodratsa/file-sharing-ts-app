import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function (_req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader(
    'Accept',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  );
  res.render('index', { title: 'File Sharing' });
});

export default router;
