import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest, CustomSession } from '@/interfaces/custom.interface';
import { verifyToken } from '@/middlewares/validateToken';
import User from '@/models/user';
import { collections } from '@/services/database.service';
import axios from 'axios';
import express from 'express';

const router = express.Router();

router.get('/', verifyToken, async function (_req: CustomRequest, res) {
  try {
    // const documents = (await collections.files?.find().toArray()) || [];
    const documents =
      (await collections.files
        ?.find({
          $or: [
            { ownerId: _req.decodedToken?.id },
            { sharedTo: { $elemMatch: { $eq: _req.decodedToken?.id } } },
          ],
        })
        .toArray()) || [];

    if (_req.headers['content-type'] === 'application/json') {
      return res.status(HTTP_STATUS.SUCCESS).json([...documents]);
    }

    const session = _req.session as CustomSession;
    const users: User[] =
      (await fetchUsers(
        _req.protocol + '://' + _req.get('host'),
        session.accessToken
      )) || [];

    // Render File Screen
    return res.render('files', {
      files: [...documents],
      users: [...users],
      token: session.accessToken,
      username: session.username,
    });
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

// Fetch user data
async function fetchUsers(url: string, token: string) {
  try {
    const response = await axios
      .create({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .get(`${url}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export default router;
