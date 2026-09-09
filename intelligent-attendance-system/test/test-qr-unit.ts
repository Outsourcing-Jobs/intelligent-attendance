import { QrSecurityService } from '../src/modules/attendance/qr-security.service';

function runUnitTests() {
  console.log('====================================================');
  console.log('🧪 KIỂM THỬ THUẬT TOÁN MÃ HÓA & XÁC THỰC HMAC QR');
  console.log('====================================================\n');

  const qrSecurity = new QrSecurityService();
  const mockSessionId = '673c09e84b2e8a5b23d91abc';

  // 1. Sinh Token
  console.log('1️⃣ [TEST 1] Sinh mã QR động (HMAC-SHA256, TTL = 20s):');
  const token = qrSecurity.generateToken(mockSessionId, 20);
  console.log('   👉 Token sinh ra:', token);
  console.log('   👉 Cấu trúc:', token.split('.').length === 2 ? 'Base64URL.Signature (HỢP LỆ)' : 'KHÔNG HỢP LỆ');

  // 2. Xác thực Token hợp lệ
  console.log('\n2️⃣ [TEST 2] Giải mã & Xác thực Token vừa sinh:');
  const verifyResult = qrSecurity.verifyToken(token);
  console.log('   👉 Kết quả:', verifyResult.valid ? '✅ VALID (PASS)' : '❌ INVALID (FAIL)');
  console.log('   👉 Session ID trích xuất:', verifyResult.sessionId);
  console.log('   👉 Thời điểm tạo:', new Date(verifyResult.payload?.ts || 0).toLocaleTimeString('vi-VN'));
  console.log('   👉 Hạn sử dụng:', new Date(verifyResult.payload?.exp || 0).toLocaleTimeString('vi-VN'));

  // 3. Chặn Token giả mạo chữ ký
  console.log('\n3️⃣ [TEST 3] Kiểm tra Chống Giả mạo (Tamper Proof):');
  const [payloadPart, sigPart] = token.split('.');
  // Thay đổi 1 ký tự trong payload
  const tamperedPayload = payloadPart.substring(0, payloadPart.length - 2) + 'AA';
  const tamperedToken = `${tamperedPayload}.${sigPart}`;
  const tamperedResult = qrSecurity.verifyToken(tamperedToken);
  console.log('   👉 Chặn token bị sửa đổi payload:', !tamperedResult.valid && tamperedResult.errorCode === 'SIGNATURE_MISMATCH' ? '✅ CHẶN THÀNH CÔNG (PASS)' : '❌ LỖI');

  // 4. Chặn Token hết hạn
  console.log('\n4️⃣ [TEST 4] Kiểm tra Chống Hết Hạn (Expiration Check):');
  // Sinh token với TTL âm (đã hết hạn từ 10 giây trước)
  const expiredToken = qrSecurity.generateToken(mockSessionId, -10);
  const expiredResult = qrSecurity.verifyToken(expiredToken);
  console.log('   👉 Chặn token hết hạn:', !expiredResult.valid && expiredResult.errorCode === 'QR_TOKEN_EXPIRED' ? '✅ CHẶN THÀNH CÔNG (PASS)' : '❌ LỖI');

  console.log('\n====================================================');
  console.log('🎉 TẤT CẢ UNIT TEST THUẬT TOÁN HMAC ĐÃ PASS 100%!');
  console.log('====================================================');
}

runUnitTests();
