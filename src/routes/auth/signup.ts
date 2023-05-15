import express from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/interfaces/user.type';
import { CustomSession } from '@/interfaces/custom.interface';
import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CONSTANT } from '@/constants/constant';

const router = express.Router();

router.post('/', function (_req, res) {
  const { username, firstName, lastName, email, password } = _req.body as User;

  if (!username || !firstName || !lastName || !email || !password) {
    /**
     * STATUS CODE: 400 INVALID REQUEST BODY
     */
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      description: HTTP_STATUS_DESC.BAD_REQUEST,
      error: HTTP_STATUS_ERROR_MSG.BAD_REQUEST,
    });
  }

  // TODO: Create new user in DB
  const token = jwt.sign(
    { userId: uuidv4(), username, password },
    process.env[CONSTANT.SECRET_KEY] as Secret,
    { expiresIn: '1h' }
  );

  // Keep Access Token in Session
  const session = _req.session as CustomSession;
  session.accessToken = token;

  /**
   * STATUS CODE: 200 SUCCESS
   */
  res
    .status(HTTP_STATUS.SUCCESS)
    .json({ accessToken: token, description: HTTP_STATUS_DESC.SUCCESS });
});

export default router;
