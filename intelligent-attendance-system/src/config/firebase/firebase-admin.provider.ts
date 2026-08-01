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
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
    }
    return admin;
  },
};
