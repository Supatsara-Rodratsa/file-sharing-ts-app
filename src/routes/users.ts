import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest } from '@/interfaces/custom.interface';
import { verifyToken } from '@/middlewares/validateToken';
import { collections } from '@/services/database.service';
import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();

router.get('/', verifyToken, async function (_req: CustomRequest, res) {
  try {
    // Get All Users except current user
    const documents =
      (await collections.users
        ?.find({ _id: { $ne: new ObjectId(_req.decodedToken?.id) } })
        .toArray()) || [];

    return res.status(HTTP_STATUS.SUCCESS).json([...documents]);
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
