/**
 * NOTIFICATION TEMPLATES – Source of Truth
 *
 * Tất cả template thông báo của hệ thống được định nghĩa tại đây.
 * Seed sẽ đọc danh sách này và upsert vào DB (tạo mới nếu chưa có,
 * cập nhật nếu đã tồn tại theo `code`).
 *
 * ─── PLACEHOLDER SYNTAX ─────────────────────────────────────────
 * Dùng {{key}} trong titleTemplate / bodyTemplate.
 * Khi gửi notification, truyền variables: { key: 'value' }.
 *
 * ─── CHANNELS ───────────────────────────────────────────────────
 * 'firebase' → FCM push notification (kể cả khi app đóng)
 * 'socket'   → Socket.IO realtime (khi app đang mở)
 *
 * ─── THÊM TEMPLATE MỚI ──────────────────────────────────────────
 * 1. Thêm entry vào NOTIFICATION_TEMPLATES bên dưới.
 * 2. Chạy: npm run seed:notifications
 * DB sẽ được đồng bộ tự động (upsert theo code).
 */

export interface NotificationTemplateData {
  code: string;
  name: string;
  eventType: string;
  titleTemplate: string;
  bodyTemplate: string;
  channels: ('firebase' | 'socket')[];
  status: 'active' | 'inactive';
  description?: string;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplateData[] = [
  // ─────────────────────────────────────────────────────────────
  // ĐIỂM DANH (ATTENDANCE)
  // ─────────────────────────────────────────────────────────────
  {
    code: 'attendance.checkin',
    name: 'Điểm danh thành công',
    eventType: 'attendance.checkin',
    titleTemplate: '✅ Điểm danh thành công',
    bodyTemplate: 'Sinh viên {{studentName}} đã điểm danh ca {{periodName}} lúc {{time}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi khi sinh viên điểm danh thành công. Variables: studentName, periodName, time',
  },
  {
    code: 'attendance.late',
    name: 'Điểm danh muộn',
    eventType: 'attendance.late',
    titleTemplate: '⚠️ Điểm danh muộn',
    bodyTemplate:
      'Sinh viên {{studentName}} điểm danh muộn {{minutesLate}} phút cho ca {{periodName}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description:
      'Gửi khi sinh viên điểm danh trễ giờ. Variables: studentName, minutesLate, periodName',
  },
  {
    code: 'attendance.checkout',
    name: 'Điểm danh ra (Check-out) thành công',
    eventType: 'attendance.checkout',
    titleTemplate: '👋 Check-out thành công',
    bodyTemplate: 'Bạn đã thực hiện Check-out thành công lúc {{time}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi khi sinh viên Check-out thành công. Variables: time',
  },
  {
    code: 'attendance.early_leave',
    name: 'Check-out về sớm',
    eventType: 'attendance.early_leave',
    titleTemplate: '⚠️ Check-out về sớm',
    bodyTemplate: 'Bạn đã Check-out về sớm hơn giờ quy định lúc {{time}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi khi sinh viên Check-out trước giờ kết thúc. Variables: time',
  },
  {
    code: 'attendance.absent',
    name: 'Vắng mặt không phép',
    eventType: 'attendance.absent',
    titleTemplate: '❌ Vắng mặt không phép',
    bodyTemplate:
      'Sinh viên {{studentName}} vắng mặt không phép buổi học {{sessionName}} ngày {{date}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi khi kết thúc buổi học mà sinh viên không điểm danh. Variables: studentName, sessionName, date',
  },
  {
    code: 'attendance.session_started',
    name: 'Buổi học bắt đầu',
    eventType: 'attendance.session_started',
    titleTemplate: '🔔 Buổi học bắt đầu',
    bodyTemplate: 'Buổi học {{courseName}} đã bắt đầu. Hãy điểm danh trước {{deadline}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi khi giảng viên mở phiên điểm danh. Variables: courseName, deadline',
  },

  // ─────────────────────────────────────────────────────────────
  // ĐƠN XIN PHÉP (LEAVE REQUEST)
  // ─────────────────────────────────────────────────────────────
  {
    code: 'leave_request.submitted',
    name: 'Đơn xin phép đã gửi',
    eventType: 'leave_request.submitted',
    titleTemplate: '📋 Đơn xin phép đã được gửi',
    bodyTemplate:
      'Sinh viên {{studentName}} đã gửi đơn xin nghỉ phép buổi học ngày {{date}}. Vui lòng xét duyệt.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description:
      'Gửi cho giảng viên khi có đơn xin phép mới. Variables: studentName, date',
  },
  {
    code: 'leave_request.approved',
    name: 'Đơn xin phép được duyệt',
    eventType: 'leave_request.approved',
    titleTemplate: '✅ Đơn xin phép được chấp thuận',
    bodyTemplate: 'Đơn xin nghỉ phép ngày {{date}} của bạn đã được {{approverName}} chấp thuận.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description:
      'Gửi cho sinh viên khi đơn xin phép được duyệt. Variables: date, approverName',
  },
  {
    code: 'leave_request.rejected',
    name: 'Đơn xin phép bị từ chối',
    eventType: 'leave_request.rejected',
    titleTemplate: '❌ Đơn xin phép bị từ chối',
    bodyTemplate:
      'Đơn xin nghỉ phép ngày {{date}} của bạn đã bị từ chối. Lý do: {{reason}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description:
      'Gửi cho sinh viên khi đơn xin phép bị từ chối. Variables: date, reason',
  },

  // ─────────────────────────────────────────────────────────────
  // ĐỔI THIẾT BỊ (DEVICE CHANGE)
  // ─────────────────────────────────────────────────────────────
  {
    code: 'device_change.requested',
    name: 'Yêu cầu đổi thiết bị mới',
    eventType: 'device_change.requested',
    titleTemplate: '📱 Yêu cầu duyệt đổi thiết bị mới',
    bodyTemplate: 'Sinh viên {{studentName}} ({{userCode}}) gửi yêu cầu đổi sang thiết bị "{{deviceName}}". Vui lòng xét duyệt.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi cho Giảng viên Chủ nhiệm khi sinh viên gửi yêu cầu đổi máy. Variables: studentName, userCode, deviceName',
  },
  {
    code: 'device_change.approved',
    name: 'Đổi thiết bị được chấp thuận',
    eventType: 'device_change.approved',
    titleTemplate: '✅ Yêu cầu đổi thiết bị đã được duyệt',
    bodyTemplate: 'Yêu cầu thay đổi thiết bị sang "{{deviceName}}" của bạn đã được chấp thuận.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi cho sinh viên khi yêu cầu đổi thiết bị được duyệt. Variables: deviceName',
  },
  {
    code: 'device_change.rejected',
    name: 'Đổi thiết bị bị từ chối',
    eventType: 'device_change.rejected',
    titleTemplate: '❌ Yêu cầu đổi thiết bị bị từ chối',
    bodyTemplate: 'Yêu cầu thay đổi thiết bị của bạn đã bị từ chối. Lý do: {{reason}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi cho sinh viên khi yêu cầu đổi thiết bị bị từ chối. Variables: reason',
  },

  // ─────────────────────────────────────────────────────────────
  // LỊCH HỌC / BUỔI HỌC (ACADEMIC SESSIONS)
  // ─────────────────────────────────────────────────────────────
  {
    code: 'session.created',
    name: 'Lịch học mới được tạo',
    eventType: 'session.created',
    titleTemplate: '📅 Lịch học mới: {{courseName}}',
    bodyTemplate: 'Buổi học mới môn {{courseName}} được xếp lịch vào {{date}} lúc {{time}}.',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi cho danh sách sinh viên lớp HP khi có buổi học mới. Variables: courseName, date, time',
  },

  // ─────────────────────────────────────────────────────────────
  // HỆ THỐNG (SYSTEM)
  // ─────────────────────────────────────────────────────────────
  {
    code: 'system.announcement',
    name: 'Thông báo hệ thống',
    eventType: 'system.announcement',
    titleTemplate: '📢 {{title}}',
    bodyTemplate: '{{message}}',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Template chung cho thông báo hệ thống. Variables: title, message',
  },
  {
    code: 'system.maintenance',
    name: 'Thông báo bảo trì',
    eventType: 'system.maintenance',
    titleTemplate: '🔧 Hệ thống bảo trì',
    bodyTemplate: 'Hệ thống sẽ bảo trì từ {{startTime}} đến {{endTime}}. {{note}}',
    channels: ['firebase', 'socket'],
    status: 'active',
    description: 'Gửi khi hệ thống có lịch bảo trì. Variables: startTime, endTime, note',
  },
];
