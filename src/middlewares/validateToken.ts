import { CONSTANT } from '@/constants/constant';
import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest, CustomSession } from '@/interfaces/Custom.interface';
import { User } from '@/interfaces/User.type';
import { Response } from 'express';
import jwt, { Secret, TokenExpiredError } from 'jsonwebtoken';

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  isPassingDecodedValue = false
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    /**
     * STATUS CODE: 401 EXPIRED ACCESS TOKEN
     */
    return res.status(401).json({
      description: HTTP_STATUS_DESC.UNAUTHORIZED,
      error: HTTP_STATUS_ERROR_MSG.UNAUTHORIZED,
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env[CONSTANT.SECRET_KEY] as Secret
    ) as User;

    const session = req.session as CustomSession;
    // Store accessToken in session
    if (!session.accessToken) session.accessToken = token;

    // Return decode value
    if (isPassingDecodedValue && decoded) {
      return decoded;
    }
  } catch (error) {
    // Clear Session when invalid token
    req.session.accessToken = '';
    if (error instanceof TokenExpiredError) {
      /**
       * STATUS CODE: 401 EXPIRED ACCESS TOKEN
       */
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        description: HTTP_STATUS_DESC.UNAUTHORIZED,
        error: HTTP_STATUS_ERROR_MSG.EXPIRED_ACCESS_TOKEN,
      });
      throw new Error(HTTP_STATUS_ERROR_MSG.EXPIRED_ACCESS_TOKEN);
    } else {
      /**
       * STATUS CODE: 401 INVALID ACCESS TOKEN
       */
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        description: HTTP_STATUS_DESC.UNAUTHORIZED,
        error: HTTP_STATUS_ERROR_MSG.INVALID_ACCESS_TOKEN,
      });
      throw new Error(HTTP_STATUS_ERROR_MSG.INVALID_ACCESS_TOKEN);
    }
  }
};
