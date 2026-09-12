import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface AttendanceExportItem {
  studentId?: {
    _id?: string;
    fullName?: string;
    userCode?: string;
    email?: string;
    class?: string;
  };
  courseSectionId?: {
    _id?: string;
    sectionCode?: string;
    subjectId?: {
      _id?: string;
      code?: string;
      name?: string;
    };
  };
  classSessionId?: {
    _id?: string;
    date?: string;
    room?: string;
    startPeriod?: number;
    numPeriods?: number;
  };
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status: string;
  note?: string | null;
  attendanceScore?: number | null;
}

export interface ExportExcelOptions {
  courseCode?: string;
  date?: string;
  classScores?: any[];
}

const STATUS_TEXT_MAP: Record<string, string> = {
  present: "Đúng giờ",
  late: "Đi muộn",
  early_leave: "Về sớm",
  excused: "Có phép",
  absent: "Vắng mặt",
};

/**
 * Xuất dữ liệu Báo cáo điểm danh ra file Excel (.xlsx) chuẩn UTF-8, auto-width, định dạng ngày giờ tiếng Việt
 */
export function exportAttendanceReportToExcel(
  records: AttendanceExportItem[],
  options: ExportExcelOptions = {}
): string {
  if (!records || records.length === 0) {
    throw new Error("Không có dữ liệu điểm danh để xuất file Excel.");
  }

  const scoreMap = new Map<string, any>();
  if (options.classScores && Array.isArray(options.classScores)) {
    options.classScores.forEach((sc) => {
      const sId = sc.studentId || sc.student?._id;
      if (sId) scoreMap.set(sId.toString(), sc);
    });
  }

  // Chuyển đổi dữ liệu sang định dạng hàng cột cho bảng tính Excel
  const excelRows = records.map((record, index) => {
    const student = record.studentId || {};
    const section = record.courseSectionId || {};
    const subject = section.subjectId || {};
    const session = record.classSessionId || {};

    // Định dạng ngày học (dd/MM/yyyy)
    let sessionDateStr = "--";
    if (session.date) {
      try {
        const d = new Date(session.date);
        sessionDateStr = d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch {
        sessionDateStr = String(session.date);
      }
    }

    // Buổi / Tiết học
    let periodStr = "--";
    if (session.startPeriod !== undefined && session.startPeriod !== null) {
      const endP = session.numPeriods ? session.startPeriod + session.numPeriods - 1 : session.startPeriod;
      periodStr = `Tiết ${session.startPeriod}${session.numPeriods && session.numPeriods > 1 ? `-${endP}` : ""}${
        session.room ? ` (P.${session.room})` : ""
      }`;
    }

    // Giờ Check-in
    let checkInStr = "--:--";
    if (record.checkInTime) {
      try {
        checkInStr = new Date(record.checkInTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch {
        checkInStr = String(record.checkInTime);
      }
    }

    // Giờ Check-out
    let checkOutStr = "--:--";
    if (record.checkOutTime) {
      try {
        checkOutStr = new Date(record.checkOutTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch {
        checkOutStr = String(record.checkOutTime);
      }
    }

    // Điểm chuyên cần (Task 2 integration)
    let scoreStr = "--";
    const studentIdStr = student._id?.toString() || "";
    const scoreItem = scoreMap.get(studentIdStr);
    if (scoreItem) {
      scoreStr = `${scoreItem.attendanceScore}/10 (${scoreItem.attendanceRate}% tham gia)${
        scoreItem.examBanRisk ? " [CẢNH BÁO CẤM THI]" : ""
      }`;
    } else if (record.attendanceScore !== undefined && record.attendanceScore !== null) {
      scoreStr = `${record.attendanceScore}/10`;
    }

    return {
      STT: index + 1,
      "Mã sinh viên": student.userCode || "N/A",
      "Họ tên": student.fullName || "N/A",
      Lớp: student.class || section.sectionCode || "N/A",
      "Môn học": subject.name || subject.code || section.sectionCode || "N/A",
      "Ngày học": sessionDateStr,
      "Buổi/Tiết": periodStr,
      "Check-in": checkInStr,
      "Check-out": checkOutStr,
      "Trạng thái": STATUS_TEXT_MAP[record.status] || record.status || "N/A",
      "Điểm chuyên cần": scoreStr,
      "Ghi chú": record.note || "",
    };
  });

  // Tạo Worksheet và Workbook
  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // Tính toán Auto-width cho từng cột để file Excel mở lên hiển thị đẹp mắt, không bị che chữ
  const colWidths = Object.keys(excelRows[0] || {}).map((key) => {
    let maxLen = key.length;
    excelRows.forEach((row: any) => {
      const valStr = row[key] ? String(row[key]) : "";
      if (valStr.length > maxLen) {
        maxLen = valStr.length;
      }
    });
    return { wch: Math.max(maxLen + 3, 10) };
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Báo Cáo Điểm Danh");

  // Định dạng tên file: attendance_<courseCode>_<date>.xlsx
  const rawCode = options.courseCode?.trim() || "ALL";
  const sanitizedCourseCode = rawCode.replace(/[^a-zA-Z0-9_-]/g, "_");

  let dateStr = options.date?.trim();
  if (!dateStr) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateStr = `${yyyy}-${mm}-${dd}`;
  } else {
    dateStr = dateStr.replace(/[^a-zA-Z0-9_-]/g, "-");
  }

  const fileName = `attendance_${sanitizedCourseCode}_${dateStr}.xlsx`;

  // Tải xuống bằng Data URI Base64 để Chrome không bao giờ bị đổi tên thành UUID của Blob
  triggerNativeFileDownload(workbook, fileName);
  return fileName;
}

export interface StudentRiskExportItem {
  studentId?: string;
  userCode?: string;
  fullName?: string;
  email?: string;
  className?: string;
  totalSessions?: number;
  present?: number;
  late?: number;
  absent?: number;
  excused?: number;
  attendanceRate?: number;
  risk?: string;
}

/**
 * Helper tải xuống file Excel qua Data URI chuẩn UTF-8, đảm bảo 100% giữ nguyên tên file có đuôi .xlsx
 */
function triggerNativeFileDownload(workbook: XLSX.WorkBook, fileName: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    const base64Data = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
    const dataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = dataUri;
    downloadAnchor.setAttribute("download", fileName);
    downloadAnchor.style.display = "none";
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    
    setTimeout(() => {
      if (document.body.contains(downloadAnchor)) {
        document.body.removeChild(downloadAnchor);
      }
    }, 1000);
  } catch (err) {
    console.warn("Thử lại phương thức tải xuống bằng Blob:", err);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  }
}

/**
 * Xuất Báo Cáo Rủi Ro Chuyên Cần Sinh Viên ra file Excel (.xlsx)
 */
export function exportRiskRankingToExcel(
  students: StudentRiskExportItem[],
  options: { title?: string } = {}
): string {
  if (!students || students.length === 0) {
    throw new Error("Không có dữ liệu sinh viên để xuất file Excel.");
  }

  const rows = students.map((s, idx) => ({
    STT: idx + 1,
    "Mã sinh viên": s.userCode || "N/A",
    "Họ và tên": s.fullName || "N/A",
    Email: s.email || "N/A",
    "Lớp hành chính": s.className || "N/A",
    "Tổng số buổi": s.totalSessions ?? 0,
    "Có mặt (Đúng giờ)": s.present ?? 0,
    "Đi muộn": s.late ?? 0,
    "Nghỉ có phép": s.excused ?? 0,
    "Vắng không phép": s.absent ?? 0,
    "Tỷ lệ tham gia (%)": `${s.attendanceRate ?? 0}%`,
    "Xếp loại rủi ro":
      s.risk === "DANGER"
        ? "Nguy cơ cấm thi"
        : s.risk === "WARNING"
        ? "Cảnh báo vắng"
        : "An toàn",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const colWidths = Object.keys(rows[0] || {}).map((key) => {
    let maxLen = key.length;
    rows.forEach((row: any) => {
      const valStr = row[key] ? String(row[key]) : "";
      if (valStr.length > maxLen) maxLen = valStr.length;
    });
    return { wch: Math.max(maxLen + 3, 10) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Báo Cáo Rủi Ro Chuyên Cần");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const fileName = `bao_cao_rui_ro_chuyen_can_${yyyy}-${mm}-${dd}.xlsx`;

  triggerNativeFileDownload(workbook, fileName);
  return fileName;
}
