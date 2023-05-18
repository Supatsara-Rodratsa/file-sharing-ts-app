import express from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { CustomSession } from '@/interfaces/custom.interface';
import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CONSTANT } from '@/constants/constant';
import { collections } from '@/services/database.service';
import User from '@/models/user';

const router = express.Router();

/* GET sign up page. */
router.get('/', function (_req, res) {
  res.render('signup', { title: 'Sign up' });
});

router.post('/', async function (_req, res) {
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
  const existingUsername = await collections.users?.findOne({ username });
  if (existingUsername) {
    /**
     * STATUS CODE: 409 CONFLICT
     */
    return res.status(HTTP_STATUS.CONFLICT).json({
      description: HTTP_STATUS_DESC.CONFLICT,
      error: HTTP_STATUS_ERROR_MSG.EXIST_USERNAME,
    });
  }

  const result = await collections.users?.insertOne({ ..._req.body });

  const token = jwt.sign(
    { id: result?.insertedId },
    process.env[CONSTANT.SECRET_KEY] as Secret,
    { expiresIn: '1h' }
  );

  // Keep Access Token in Session
  const session = _req.session as CustomSession;
  session.accessToken = token;
  session.username = username;

  if (
    _req.headers['content-type'] === 'application/x-www-form-urlencoded' &&
    session.accessToken
  ) {
    return res.redirect('/auth/login');
  }

  /**
   * STATUS CODE: 200 SUCCESS
   */
  res
    .status(HTTP_STATUS.SUCCESS)
    .json({ accessToken: token, description: HTTP_STATUS_DESC.SUCCESS });
});

export default router;
