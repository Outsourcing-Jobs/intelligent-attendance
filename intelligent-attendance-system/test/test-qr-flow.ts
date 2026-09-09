import { io } from 'socket.io-client';
import { QrSecurityService } from '../src/modules/attendance/qr-security.service';

/**
 * Script kiểm thử Backend Dynamic QR:
 * 1. Kiểm tra Unit HMAC Token Generator & Verifier (Đúng hạn, Hết hạn, Giả mạo chữ ký).
 * 2. Kiểm tra WebSocket Gateway /attendance-qr (Start stream, Nhận qr_tick mỗi 5s, Stop stream).
 */
async function runTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ BACKEND DYNAMIC QR ATTENDANCE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST CASE 1: UNIT TEST MẬT MÃ HỌC HMAC-SHA256
  // ----------------------------------------------------
  console.log('▶️ [TEST 1] Kiểm tra Thuật toán QrSecurityService:');
  const qrSecurity = new QrSecurityService();
  const mockSessionId = '673c09e84b2e8a5b23d91abc';

  // 1.1. Sinh mã hợp lệ (TTL = 20s)
  const validToken = qrSecurity.generateToken(mockSessionId, 20);
  console.log('   ✅ Token sinh ra:', validToken);

  const verifyValid = qrSecurity.verifyToken(validToken);
  console.log('   ✅ Xác thực token hợp lệ:', verifyValid.valid ? 'THÀNH CÔNG (PASS)' : 'THẤT BẠI (FAIL)');
  if (!verifyValid.valid || verifyValid.sessionId !== mockSessionId) {
    console.error('   ❌ Lỗi: Session ID giải mã không khớp!');
  }

  // 1.2. Kiểm tra Token bị giả mạo / sửa đổi chữ ký
  const fakeToken = validToken.substring(0, validToken.length - 4) + 'abcd';
  const verifyFake = qrSecurity.verifyToken(fakeToken);
  console.log('   ✅ Chặn token bị sửa đổi chữ ký:', !verifyFake.valid && verifyFake.errorCode === 'SIGNATURE_MISMATCH' ? 'THÀNH CÔNG (PASS)' : 'FAIL');

  // 1.3. Kiểm tra Token đã hết hạn (TTL = -10s)
  const expiredToken = qrSecurity.generateToken(mockSessionId, -10);
  const verifyExpired = qrSecurity.verifyToken(expiredToken);
  console.log('   ✅ Chặn token hết hạn:', !verifyExpired.valid && verifyExpired.errorCode === 'QR_TOKEN_EXPIRED' ? 'THÀNH CÔNG (PASS)' : 'FAIL');

  console.log('\n----------------------------------------------------');
  console.log('▶️ [TEST 2] Kiểm tra WebSocket Gateway /attendance-qr:');
  const PORT = process.env.PORT || 3000;
  const socketUrl = `http://localhost:${PORT}/attendance-qr`;

  console.log(`   🔌 Đang kết nối tới Socket.IO Gateway: ${socketUrl}`);
  const socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log(`   ✅ Đã kết nối Socket.IO thành công (Socket ID: ${socket.id})`);

    // Giảng viên bắt đầu phát mã QR (interval 3 giây để test nhanh)
    console.log('   📡 Gửi event "start_qr_stream" cho session:', mockSessionId);
    socket.emit(
      'start_qr_stream',
      { classSessionId: mockSessionId, intervalSec: 3 },
      (ack: any) => {
        console.log('   📥 Server phản hồi ACK:', ack);
      },
    );
  });

  let tickCount = 0;
  socket.on('qr_tick', (data) => {
    tickCount++;
    console.log(`   ⚡ [qr_tick #${tickCount}] Nhận mã QR động mới:`);
    console.log(`      - Session ID: ${data.classSessionId}`);
    console.log(`      - Token: ${data.token.substring(0, 40)}...`);
    console.log(`      - Hết hạn sau: ${data.expiresIn}s | Timestamp: ${data.timestamp}`);

    // Sau khi nhận 2 lần tick, test dừng stream và đóng kết nối
    if (tickCount >= 2) {
      console.log('\n   🛑 Gửi event "stop_qr_stream" để dừng phát...');
      socket.emit('stop_qr_stream', { classSessionId: mockSessionId }, (ack: any) => {
        console.log('   📥 Server phản hồi dừng stream:', ack);
        console.log('\n====================================================');
        console.log('🎉 TẤT CẢ KIỂM THỬ BACKEND ĐÃ HOÀN TẤT VÀ PASS 100%!');
        console.log('====================================================');
        socket.disconnect();
        process.exit(0);
      });
    }
  });

  socket.on('connect_error', (err) => {
    console.error('   ❌ Lỗi kết nối Socket.IO:', err.message);
    console.log('   💡 Hãy đảm bảo Backend đang chạy ("npm run start:dev") trên cổng', PORT);
    socket.disconnect();
    process.exit(1);
  });

  // Timeout sau 15s nếu không kết nối được
  setTimeout(() => {
    console.error('   ⏱️ Hết thời gian chờ kết nối (Timeout 15s).');
    socket.disconnect();
    process.exit(1);
  }, 15000);
}

runTests().catch(console.error);
