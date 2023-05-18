import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

class AWSService {
  private s3Client: S3Client;
  private readonly S3_BASE_URL = `https://s3.${process.env.MY_AWS_REGION}.amazonaws.com`;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.MY_AWS_REGION || '',
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.MY_AWS_SECRET_KEY_1 || '',
      },
    });
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    fileData: Buffer
  ): Promise<string> {
    const s3Params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileData,
    };

    await this.s3Client.send(new PutObjectCommand(s3Params));
    // Return the URL of the uploaded file
    const fileUrl = `${this.S3_BASE_URL}/${bucketName}/${fileName}`;
    return fileUrl;
  }
}

export default AWSService;
