import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest } from '@/interfaces/custom.interface';
import { verifyToken } from '@/middlewares/validateToken';
import AWSService from '@/services/aws.service';
import { collections } from '@/services/database.service';
import express from 'express';
import { ObjectId } from 'mongodb';
import multer from 'multer';

const router = express.Router();
const awsService = new AWSService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

router.post(
  '/',
  verifyToken,
  upload.single('file'),
  async function (_req: CustomRequest, res) {
    try {
      const currentUser = await collections.users?.findOne({
        _id: new ObjectId(_req.decodedToken?.id),
      });

      if (!currentUser) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          description: HTTP_STATUS_DESC.NOT_FOUND,
          error: HTTP_STATUS_ERROR_MSG.USER_ID_NOT_FOUND,
        });
      }

      const file = _req.file;
      if (file) {
        const bucketName = process.env.AWS_BUCKET_NAME || '';
        const fileName = `${file.originalname}`;

        // Upload File to AWS S3
        const url = await awsService.uploadFile(
          bucketName,
          fileName,
          file.buffer
        );

        // Insert File Object to MongoDB
        await collections.files?.insertOne({
          url,
          ownerId: _req.decodedToken?.id,
          filename: fileName,
          size: file.size,
          format: file.mimetype,
          dateCreated: new Date(),
        });

        res
          .status(200)
          .json({ description: HTTP_STATUS_DESC.UPLOAD_FILE_SUCCESS });
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ description: HTTP_STATUS_DESC.BAD_REQUEST });
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
  }
);

export default router;
