import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadImageFromBuffer(
    buffer: Buffer,
    options?: {
      folder?: string;
      public_id?: string;
      transformation?: any[];
    },
  ) {
    const folder = options?.folder ?? 'devconnect/avatars';
    const public_id = options?.public_id;

    return new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id,
          resource_type: 'image',
          // automatic format, cropping centered on face if available:
          transformation: options?.transformation ?? [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          ],
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload error', error);
            return reject(error);
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async delete(publicId: string) {
    if (!publicId) return null;
    return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }
}
