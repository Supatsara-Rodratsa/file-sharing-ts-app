import express from 'express';
import { HTTP_STATUS, HTTP_STATUS_DESC } from '@/constants/httpStatus.constant';
import { verifyToken } from '@/middlewares/validateToken';

const router = express.Router();

router.post('/', verifyToken, function (_req, res) {
  // Clear Session
  _req.session.accessToken = '';
  /**
   * STATUS CODE: 200 SUCCESS
   */
  return res
    .status(HTTP_STATUS.SUCCESS)
    .json({ description: HTTP_STATUS_DESC.SUCCESS });
});

export default router;
