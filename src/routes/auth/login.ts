import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest } from '@/interfaces/custom.interface';
import { User } from '@/interfaces/user.type';
import { verifyToken } from '@/middlewares/validateToken';
import express from 'express';

const router = express.Router();

router.post('/', function (_req: CustomRequest, res) {
  const { username, password } = _req.body as User;

  // Return Bad Request when passing invalid body request
  if (!username || !password) {
    /**
     * STATUS CODE: 400 INVALID REQUEST BODY
     */
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      description: HTTP_STATUS_DESC.BAD_REQUEST,
      error: HTTP_STATUS_ERROR_MSG.BAD_REQUEST,
    });
  }

  try {
    const decoded = verifyToken(_req, res, true) as User;
    // Return Unauthorized when username and password doesn't match
    if (
      !decoded ||
      username !== decoded.username ||
      password !== decoded.password
    ) {
      /**
       * STATUS CODE: 401 INVALID USERNAME AND PASSWORD
       */
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        description: HTTP_STATUS_DESC.UNAUTHORIZED,
        error: HTTP_STATUS_ERROR_MSG.LOGIN_UNAUTHORIZED,
      });
    } else {
      /**
       * STATUS CODE: 200 SUCCESS
       */
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ description: HTTP_STATUS_DESC.SUCCESS });
    }
  } catch (err: unknown) {
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
