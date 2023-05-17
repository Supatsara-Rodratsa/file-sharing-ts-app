import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest, CustomSession } from '@/interfaces/custom.interface';
import jwt, { Secret } from 'jsonwebtoken';
import { collections } from '@/services/database.service';
import express from 'express';
import { CONSTANT } from '@/constants/constant';
import User from '@/models/user';

const router = express.Router();

router.post('/', async function (_req: CustomRequest, res) {
  try {
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

    const existingUsername = await collections.users?.findOne({ username });

    if (!existingUsername) {
      /**
       * STATUS CODE: 404 USERNAME NOT FOUND
       */
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        description: HTTP_STATUS_DESC.NOT_FOUND,
        error: HTTP_STATUS_ERROR_MSG.USERNAME_NOT_FOUND,
      });
    }

    // Return Unauthorized when username and password doesn't match
    if (
      existingUsername &&
      (username !== existingUsername.username ||
        password !== existingUsername.password)
    ) {
      /**
       * STATUS CODE: 401 INVALID USERNAME AND PASSWORD
       */
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        description: HTTP_STATUS_DESC.UNAUTHORIZED,
        error: HTTP_STATUS_ERROR_MSG.LOGIN_UNAUTHORIZED,
      });
    } else {
      // Create new access token
      const accessToken = jwt.sign(
        { id: existingUsername._id },
        process.env[CONSTANT.SECRET_KEY] as Secret,
        { expiresIn: '1h' }
      );
      // Store access token in session
      const session = _req.session as CustomSession;
      if (accessToken) session.accessToken = accessToken;
      /**
       * STATUS CODE: 200 SUCCESS
       */
      res.status(HTTP_STATUS.SUCCESS).json({
        accessToken: accessToken,
        description: HTTP_STATUS_DESC.SUCCESS,
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error:: ', err.message);
    }
    /**
     * STATUS CODE: 500 INTERNAL SERVER ERROR
     */
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      description: HTTP_STATUS_DESC.INTERNAL_SERVER_ERROR,
      error: HTTP_STATUS_ERROR_MSG.INTERNAL_SERVER_ERROR,
    });
  }
});

export default router;
