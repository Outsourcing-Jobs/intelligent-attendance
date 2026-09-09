import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface QrTokenPayload {
  sid: string;       // ClassSession ID
  ts: number;        // Creation Timestamp (ms)
  exp: number;       // Expiration Timestamp (ms)
  nonce: string;     // Random salt to prevent duplicate hash
  v: number;         // Algorithm version
}

export interface VerifyQrResult {
  valid: boolean;
  sessionId?: string;
  payload?: QrTokenPayload;
  errorCode?: string;
  reason?: string;
}

@Injectable()
export class QrSecurityService {
  private readonly logger = new Logger(QrSecurityService.name);
  private readonly QR_SECRET =
    process.env.QR_HMAC_SECRET || 'attendance-system-dynamic-qr-secret-key-2025';
  
  // Cho phép độ trễ truyền gói tin mạng và clock drift tối đa 5 giây (5000ms)
  private readonly TOLERANCE_WINDOW_MS = 5000;

  /**
   * Sinh Token mã QR động với chữ ký số HMAC-SHA256
   * @param classSessionId ID buổi học
   * @param ttlSeconds Thời gian sống của mã (mặc định 20 giây)
   */
  generateToken(classSessionId: string, ttlSeconds: number = 20): string {
    const now = Date.now();
    const payload: QrTokenPayload = {
      sid: classSessionId,
      ts: now,
      exp: now + ttlSeconds * 1000,
      nonce: crypto.randomBytes(4).toString('hex'),
      v: 1,
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.QR_SECRET)
      .update(payloadBase64)
      .digest('hex');

    return `${payloadBase64}.${signature}`;
  }

  /**
   * Giải mã và xác thực token QR từ phía sinh viên gửi lên
   * @param token Chuỗi token lấy từ camera quét QR
   */
  verifyToken(token: string): VerifyQrResult {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return {
        valid: false,
        errorCode: 'INVALID_TOKEN_FORMAT',
        reason: 'Định dạng mã QR không hợp lệ.',
      };
    }

    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) {
      return {
        valid: false,
        errorCode: 'INVALID_TOKEN_STRUCTURE',
        reason: 'Cấu trúc mã QR bị thiếu thành phần.',
      };
    }

    // 1. Kiểm tra tính toàn vẹn chữ ký HMAC
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.QR_SECRET)
        .update(payloadBase64)
        .digest('hex');

      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedSigBuffer = Buffer.from(expectedSignature, 'hex');

      if (
        sigBuffer.length !== expectedSigBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
      ) {
        return {
          valid: false,
          errorCode: 'SIGNATURE_MISMATCH',
          reason: 'Mã QR không hợp lệ hoặc đã bị can thiệp chữ ký số.',
        };
      }
    } catch (err: any) {
      this.logger.error(`Lỗi xác thực HMAC signature: ${err?.message}`);
      return {
        valid: false,
        errorCode: 'SIGNATURE_VERIFICATION_ERROR',
        reason: 'Không thể xác thực chữ ký mã QR.',
      };
    }

    // 2. Parse payload từ Base64URL
    let payload: QrTokenPayload;
    try {
      const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf8');
      payload = JSON.parse(jsonStr);
    } catch {
      return {
        valid: false,
        errorCode: 'CORRUPTED_PAYLOAD',
        reason: 'Nội dung mã QR bị hỏng hoặc không đúng định dạng JSON.',
      };
    }

    if (!payload.sid || !payload.exp) {
      return {
        valid: false,
        errorCode: 'MISSING_PAYLOAD_FIELDS',
        reason: 'Mã QR thiếu thông tin phiên học hoặc thời hạn.',
      };
    }

    // 3. Kiểm tra hạn sử dụng (có cộng thêm Tolerance Window 5 giây bù trễ mạng)
    const now = Date.now();
    if (now > payload.exp + this.TOLERANCE_WINDOW_MS) {
      return {
        valid: false,
        sessionId: payload.sid,
        payload,
        errorCode: 'QR_TOKEN_EXPIRED',
        reason: 'Mã QR đã hết hạn. Vui lòng quét mã mới trên màn hình máy chiếu.',
      };
    }

    return {
      valid: true,
      sessionId: payload.sid,
      payload,
    };
  }
}
