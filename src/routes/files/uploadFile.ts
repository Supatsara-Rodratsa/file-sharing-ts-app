import {
  HTTP_STATUS,
  HTTP_STATUS_DESC,
  HTTP_STATUS_ERROR_MSG,
} from '@/constants/httpStatus.constant';
import { CustomRequest, CustomSession } from '@/interfaces/custom.interface';
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
        const bucketName = process.env.MY_AWS_BUCKET_NAME || '';
        const fileName = `${file.originalname}`;
        const session = _req.session as CustomSession;

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
          ownerName: session.username || '-',
          filename: fileName,
          size: calculateFileSize(file.size),
          format: file.mimetype,
          dateCreated: new Date(),
        });

        const updatedDocuments =
          (await collections.files
            ?.find({
              $or: [
                { ownerId: _req.decodedToken?.id },
                { sharedTo: { $elemMatch: { $eq: _req.decodedToken?.id } } },
              ],
            })
            .toArray()) || [];

        // Handle the response based on the content-type header
        if (_req.headers['response-type'] === 'application/json') {
          return res
            .status(200)
            .json({ description: HTTP_STATUS_DESC.UPLOAD_FILE_SUCCESS });
        }

        // Render File Screen
        return res.status(200).json({ files: updatedDocuments });
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

function calculateFileSize(size: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (size == 0) return '0 Bytes';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${Math.round(size / Math.pow(1024, i))} ${sizes[i]}`;
}

export default router;
