import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest, CustomSession } from '@/interfaces/custom.interface';
import User from '@/models/user';
import { collections } from '@/services/database.service';
import { Response, NextFunction, RequestHandler } from 'express';
import jwt, { Secret, TokenExpiredError } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export const verifyToken: RequestHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.headers.authorization?.split(' ')[1] || req.session.accessToken;

  if (!token) {
    /**
     * STATUS CODE: 401 EXPIRED ACCESS TOKEN
     */
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      description: HTTP_STATUS_DESC.UNAUTHORIZED,
      error: HTTP_STATUS_ERROR_MSG.UNAUTHORIZED,
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.MY_SECRET_KEY as Secret
    ) as User;

    const session = req.session as CustomSession;
    // Store accessToken in session
    if (!session.accessToken) session.accessToken = token;

    const currentUser = await collections.users?.findOne({
      _id: new ObjectId(decoded?.id),
    });

    if (!currentUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        description: HTTP_STATUS_DESC.NOT_FOUND,
        error: HTTP_STATUS_ERROR_MSG.USER_ID_NOT_FOUND,
      });
    }

    // Pass the decoded value to the next middleware or route handler
    req.decodedToken = decoded;
    next();
  } catch (error) {
    // Clear Session when invalid token
    req.session.accessToken = '';
    if (error instanceof TokenExpiredError) {
      /**
       * STATUS CODE: 401 EXPIRED ACCESS TOKEN
       */
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        description: HTTP_STATUS_DESC.UNAUTHORIZED,
        error: HTTP_STATUS_ERROR_MSG.EXPIRED_ACCESS_TOKEN,
      });
    } else {
      /**
       * STATUS CODE: 401 INVALID ACCESS TOKEN
       */
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        description: HTTP_STATUS_DESC.UNAUTHORIZED,
        error: HTTP_STATUS_ERROR_MSG.INVALID_ACCESS_TOKEN,
      });
    }
  }
};
