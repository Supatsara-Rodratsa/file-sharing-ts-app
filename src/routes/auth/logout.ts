import express from 'express';
import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { verifyToken } from '@/middlewares/validateToken';

const router = express.Router();

router.post('/', function (_req, res) {
  try {
    verifyToken(_req, res);
    // Clear Session
    _req.session.accessToken = '';
    /**
     * STATUS CODE: 200 SUCCESS
     */
    res
      .status(HTTP_STATUS.SUCCESS)
      .json({ description: HTTP_STATUS_DESC.SUCCESS });
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error:: ', err.message);
    } else {
      /**
       * STATUS CODE: 500 INTERNAL SERVER ERROR
       */
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        description: HTTP_STATUS_DESC.INTERNAL_SERVER_ERROR,
        error: HTTP_STATUS_ERROR_MSG.INTERNAL_SERVER_ERROR,
      });
    }
  }
});

export default router;
