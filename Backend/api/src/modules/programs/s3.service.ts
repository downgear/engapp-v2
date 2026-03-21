import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class ProgramS3Service {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_S3_REGION || 'ap-southeast-1';
    this.bucket = process.env.AWS_S3_BUCKET || 'fixingapp';
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `${folder}/${randomUUID()}.${ext}`;
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
