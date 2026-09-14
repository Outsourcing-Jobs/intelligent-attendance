import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider = {
  provide: FIREBASE_ADMIN,
  useFactory: () => {
    const logger = new Logger('FirebaseAdminProvider');
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let rawKey = process.env.FIREBASE_PRIVATE_KEY;

      let privateKey: string | undefined = undefined;
      if (rawKey) {
        let cleanKey = rawKey.trim();
        // Loại bỏ dấu ngoặc kép hoặc nháy đơn bọc ngoài nếu có
        if (
          (cleanKey.startsWith('"') && cleanKey.endsWith('"')) ||
          (cleanKey.startsWith("'") && cleanKey.endsWith("'"))
        ) {
          cleanKey = cleanKey.slice(1, -1);
        }
        // Chuyển đổi ký tự escape \n thành ký tự xuống dòng thực tế
        privateKey = cleanKey.replace(/\\n/g, '\n').trim();
      }

      if (
        !projectId ||
        projectId === 'your-firebase-project-id' ||
        !clientEmail ||
        !privateKey
      ) {
        logger.warn(
          '⚠️ Firebase credentials chưa được cấu hình đầy đủ trong file .env! Đang khởi tạo ứng dụng ở chế độ chờ. Vui lòng điền đúng thông tin Firebase trong file .env để xác thực token.',
        );
        admin.initializeApp({
          projectId: projectId || 'dummy-project-id',
        });
      } else {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
          logger.log('✅ Firebase Admin SDK khởi tạo thành công.');
        } catch (error) {
          logger.error(`❌ Lỗi khởi tạo Firebase Admin: ${error.message}`);
          admin.initializeApp({
            projectId: projectId || 'dummy-project-id',
          });
        }
      }
    }
    return admin;
  },
};
