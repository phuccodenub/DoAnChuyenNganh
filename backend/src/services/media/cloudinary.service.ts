import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'lms'
  ): Promise<{ url: string; publicId: string; format: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `lms/${folder}`,
          transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
            { format: 'webp' }
          ]
        },
        (error: unknown, result: any) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async generateThumbnail(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      transformation: [
        { width: 300, height: 200, crop: 'fill' },
        { quality: 'auto', format: 'webp' }
      ]
    });
  }
}
