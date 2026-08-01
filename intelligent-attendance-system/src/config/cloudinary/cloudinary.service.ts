import { Inject, Injectable } from '@nestjs/common';
import { v2 as CloudinaryType } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly rootFolder = 'jobs-assets';

  constructor(@Inject(CLOUDINARY) private cloudinary: typeof CloudinaryType) {}

  private resolveFolderPath(subFolder?: string): string {
    if (!subFolder) return this.rootFolder;
    if (subFolder.startsWith(`${this.rootFolder}/`)) return subFolder;
    return `${this.rootFolder}/${subFolder}`;
  }

  uploadImage(
    file: Express.Multer.File,
    subFolder = 'general',
    options?: { width?: number; height?: number; crop?: string },
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const folder = this.resolveFolderPath(subFolder);

      const transformations =
        options?.width || options?.height
          ? [{ width: options.width, height: options.height, crop: options.crop || 'limit' }]
          : [{ width: 1000, height: 1000, crop: 'limit' }];

      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: transformations,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed with empty result'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    subFolder = 'general',
    options?: { width?: number; height?: number; crop?: string },
  ): Promise<Array<{ url: string; publicId: string }>> {
    return Promise.all(
      files.map((file) => this.uploadImage(file, subFolder, options)),
    );
  }

  async deleteImage(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId);
  }

  async deleteMultipleImages(publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) return;
    return Promise.all(publicIds.map((id) => this.deleteImage(id)));
  }
}
