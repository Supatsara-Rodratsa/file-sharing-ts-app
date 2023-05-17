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

type SharedUser = {
  sharedUserId: string[];
};

router.post('/:fileId', verifyToken, async function (_req: CustomRequest, res) {
  try {
    const { fileId } = _req.params;
    const { sharedUserId } = _req.body as SharedUser;

    /**
     * 400 Status: Invalid Body Request
     */
    if (!sharedUserId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        description: HTTP_STATUS_DESC.BAD_REQUEST,
        error: HTTP_STATUS_ERROR_MSG.BAD_REQUEST,
      });
    }

    // Update data in mongoDB
    const updateResult = await collections.files?.updateOne(
      { _id: new ObjectId(fileId) },
      {
        $set: {
          sharedTo: sharedUserId.length > 0 ? [...sharedUserId] : null,
        },
      }
    );

    if (updateResult?.matchedCount === 0) {
      /**
       * 404 Status: File Not Found
       */
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        description: HTTP_STATUS_DESC.NOT_FOUND,
        error: HTTP_STATUS_ERROR_MSG.FILE_NOT_FOUND,
      });
    }

    return res
      .status(HTTP_STATUS.SUCCESS)
      .json({ description: HTTP_STATUS_DESC.SHARED_FILE_SUCCESS });
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
