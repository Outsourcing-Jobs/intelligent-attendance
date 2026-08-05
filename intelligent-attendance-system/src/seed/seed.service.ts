import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import { Role, RoleDocument } from '../modules/role/schemas/role.schema';
import { Config, ConfigDocument } from '../modules/config/schemas/config.schema';
import { Menu, MenuDocument } from '../modules/config/schemas/menu.schema';
import { User, UserDocument } from '../modules/user/schemas/user.schema';
import { AcademicYear, AcademicYearDocument } from '../modules/academic/academic-year/schemas/academic-year.schema';
import { Semester, SemesterDocument } from '../modules/academic/semester/schemas/semester.schema';
import { Subject, SubjectDocument } from '../modules/academic/subject/schemas/subject.schema';
import { StudentClass, ClassDocument } from '../modules/academic/class/schemas/class.schema';
import { ClassSubject, ClassSubjectDocument } from '../modules/academic/class/schemas/class-subject.schema';
import { CourseSection, CourseSectionDocument } from '../modules/academic/course-section/schemas/course-section.schema';
import { CourseSectionLecturer, CourseSectionLecturerDocument } from '../modules/academic/course-section/schemas/course-section-lecturer.schema';
import { Enrollment, EnrollmentDocument } from '../modules/academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigDocument } from '../modules/config/schemas/period-config.schema';
import { AttendanceConfig, AttendanceConfigDocument } from '../modules/attendance/schemas/attendance-config.schema';
import { FIREBASE_ADMIN } from '../config/firebase/firebase-admin.provider';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AcademicYear.name) private academicYearModel: Model<AcademicYearDocument>,
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(StudentClass.name) private classModel: Model<ClassDocument>,
    @InjectModel(ClassSubject.name) private classSubjectModel: Model<ClassSubjectDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(CourseSectionLecturer.name) private courseSectionLecturerModel: Model<CourseSectionLecturerDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(PeriodConfig.name) private periodConfigModel: Model<PeriodConfigDocument>,
    @InjectModel(AttendanceConfig.name) private attendanceConfigModel: Model<AttendanceConfigDocument>,
    @Inject(FIREBASE_ADMIN) private firebaseAdmin: typeof admin,
  ) {}

  async runSeed() {
    await this.seedRoles();
    await this.seedConfigs();
    await this.seedMenus();
    await this.seedUsers();
    await this.seedAcademicData();
    await this.seedPeriodConfigs();
    await this.seedAttendanceConfigs();
  }

  private async seedRoles() {
    const roles = [
      {
        code: 'admin',
        name: 'Quản trị viên',
        permissions: ['*'],
        description: 'Quyền quản trị toàn bộ hệ thống',
      },
      {
        code: 'teacher',
        name: 'Giảng viên',
        permissions: ['attendance:view', 'leave:approve', 'schedule:view'],
        description: 'Quyền quản lý điểm danh và xem lịch dạy',
      },
      {
        code: 'student',
        name: 'Học sinh/Sinh viên',
        permissions: ['attendance:checkin', 'leave:create', 'schedule:view'],
        description: 'Quyền xem lịch học và điểm danh cá nhân',
      },
    ];

    for (const r of roles) {
      const exists = await this.roleModel.exists({ code: r.code });
      if (!exists) {
        await this.roleModel.create(r);
        this.logger.log(`Seeded role: ${r.code}`);
      }
    }
  }

  private async seedConfigs() {
    const configs = [
      {
        key: 'SYSTEM_NAME',
        value: 'Hệ thống quản lý điểm danh',
        type: 'string',
        group: 'system',
        description: 'Tên hệ thống hiển thị',
      },
      {
        key: 'WIFI_IP_RANGE',
        value: '192.168.1.0/24',
        type: 'string',
        group: 'system',
        description: 'Dải IP wifi hợp lệ để điểm danh',
      },
    ];

    for (const c of configs) {
      const exists = await this.configModel.exists({ key: c.key });
      if (!exists) {
        await this.configModel.create(c);
        this.logger.log(`Seeded config: ${c.key}`);
      }
    }
  }

  private async seedMenus() {
    await this.menuModel.deleteMany({});

    await this.menuModel.create([
      {
        name: 'Bảng điều khiển',
        url: '/dashboard/default',
        icon: 'LayoutDashboard',
        order: 1,
        roles: ['admin', 'teacher', 'student'],
        permissions: ['dashboard:read'],
      },
      {
        name: 'Trang cá nhân',
        url: '/dashboard/profile',
        icon: 'CircleUser',
        order: 2,
        roles: ['admin', 'teacher', 'student'],
        permissions: ['profile:read'],
      },
      {
        name: 'Quản lý Người dùng',
        url: '/dashboard/users',
        icon: 'Users',
        order: 3,
        roles: ['admin'],
        permissions: ['users.read'],
      },
      {
        name: 'Quản lý Đào tạo',
        url: '/dashboard/academic',
        icon: 'GraduationCap',
        order: 4,
        roles: ['admin', 'teacher', 'student'],
        permissions: ['academic.read'],
      },
      {
        name: 'Lịch học & Giảng dạy',
        url: '/dashboard/calendar',
        icon: 'Calendar',
        order: 5,
        roles: ['admin', 'teacher', 'student'],
        permissions: ['calendar.read'],
      },
      {
        name: 'Quản lý Vai trò',
        url: '/dashboard/roles',
        icon: 'Lock',
        order: 6,
        roles: ['admin'],
        permissions: ['roles.read'],
      },
    ]);
    this.logger.log('Seeded default menus with frontend URLs and roles');
  }

  private async seedUsers() {
    const defaultPassword = 'Password123!';

    const seedAccounts = [
      {
        email: 'admin@school.edu.vn',
        userCode: 'ADM001',
        password: defaultPassword,
        fullName: 'Quản Trị Viên Hệ Thống',
        phone: '0900000001',
        roleCode: 'admin',
      },
      {
        email: 'teacher@school.edu.vn',
        userCode: 'GV000',
        password: defaultPassword,
        fullName: 'Giảng Viên Nguyễn Văn B',
        phone: '0900000002',
        roleCode: 'teacher',
      },
      {
        email: 'student@school.edu.vn',
        userCode: 'SV000',
        password: defaultPassword,
        fullName: 'Sinh Viên Nguyễn Văn A',
        phone: '0900000003',
        roleCode: 'student',
      },
    ];

    for (const acc of seedAccounts) {
      try {
        const roleDoc = await this.roleModel.findOne({ code: acc.roleCode });
        if (!roleDoc) continue;

        let firebaseUid = '';

        try {
          let fbUser: admin.auth.UserRecord;
          try {
            fbUser = await this.firebaseAdmin.auth().getUserByEmail(acc.email);
          } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
              fbUser = await this.firebaseAdmin.auth().createUser({
                email: acc.email,
                password: acc.password,
                displayName: acc.fullName,
              });
              this.logger.log(`Created Firebase Auth account: ${acc.email}`);
            } else {
              throw err;
            }
          }
          firebaseUid = fbUser.uid;
        } catch (err: any) {
          firebaseUid = `seed-${acc.roleCode}-uid`;
        }

        const existingUser = await this.userModel.findOne({ email: acc.email });
        if (!existingUser) {
          await this.userModel.create({
            firebaseUid,
            email: acc.email,
            userCode: acc.userCode,
            fullName: acc.fullName,
            phone: acc.phone,
            roleId: roleDoc._id,
            status: 'active',
            isEmailVerified: true,
          });
          this.logger.log(`Seeded default account [${acc.roleCode.toUpperCase()}]: ${acc.email}`);
        } else {
          existingUser.roleId = roleDoc._id;
          existingUser.userCode = acc.userCode;
          if (firebaseUid && !existingUser.firebaseUid.startsWith('seed-')) {
            existingUser.firebaseUid = firebaseUid;
          }
          await existingUser.save();
        }
      } catch (error: any) {
        this.logger.error(`Error seeding account ${acc.email}: ${error.message}`);
      }
    }
  }

  // =====================================================================
  // ACADEMIC MASTER DATA
  // =====================================================================

  private async seedAcademicData() {
    try {
      const teacherUsers = await this.seedTeacherUsers();
      const academicYear = await this.seedAcademicYears();
      const semesters = await this.seedSemesters(academicYear);
      const subjects = await this.seedSubjects();
      const classes = await this.seedClasses(teacherUsers);
      await this.seedClassSubjects(classes, subjects);
      const courseSections = await this.seedCourseSections(subjects, semesters, teacherUsers);
      const studentUsers = await this.seedStudentUsers(classes);
      await this.seedEnrollments(studentUsers ?? {}, courseSections ?? {});
      this.logger.log('✅ Academic master data seeded successfully using User references');
    } catch (error: any) {
      this.logger.error(`Error seeding academic data: ${error.message}`);
    }
  }

  // --- Teacher Users (Role = teacher in `users` collection) ---
  private async seedTeacherUsers() {
    const teacherRole = await this.roleModel.findOne({ code: 'teacher' });
    if (!teacherRole) return {};

    const teachersData = [
      { userCode: 'GV001', fullName: 'PGS.TS Nguyễn Văn Hùng',   email: 'hung.nv@university.edu.vn',   phone: '0901000001' },
      { userCode: 'GV002', fullName: 'TS. Trần Thị Lan',          email: 'lan.tt@university.edu.vn',    phone: '0901000002' },
      { userCode: 'GV003', fullName: 'ThS. Lê Minh Tuấn',         email: 'tuan.lm@university.edu.vn',   phone: '0901000003' },
      { userCode: 'GV004', fullName: 'TS. Phạm Quốc Đạt',         email: 'dat.pq@university.edu.vn',    phone: '0901000004' },
      { userCode: 'GV005', fullName: 'PGS.TS Hoàng Thị Mai',      email: 'mai.ht@university.edu.vn',    phone: '0901000005' },
      { userCode: 'GV006', fullName: 'TS. Vũ Đình Khoa',           email: 'khoa.vd@university.edu.vn',   phone: '0901000006' },
      { userCode: 'GV007', fullName: 'ThS. Đặng Thị Hoa',         email: 'hoa.dt@university.edu.vn',    phone: '0901000007' },
      { userCode: 'GV008', fullName: 'PGS.TS Bùi Quang Minh',     email: 'minh.bq@university.edu.vn',   phone: '0901000008' },
      { userCode: 'GV009', fullName: 'TS. Ngô Thị Thu Hà',        email: 'ha.ntt@university.edu.vn',    phone: '0901000009' },
      { userCode: 'GV010', fullName: 'ThS. Dương Văn Tùng',       email: 'tung.dv@university.edu.vn',   phone: '0901000010' },
    ];

    const result: Record<string, any> = {};
    for (const t of teachersData) {
      let doc = await this.userModel.findOne({
        $or: [{ email: t.email }, { userCode: t.userCode }],
      });
      if (!doc) {
        doc = await this.userModel.create({
          firebaseUid: `seed-teacher-${t.userCode}`,
          email: t.email,
          userCode: t.userCode,
          fullName: t.fullName,
          phone: t.phone,
          roleId: teacherRole._id,
          status: 'active',
          isEmailVerified: true,
        });
        this.logger.log(`Seeded teacher user: ${t.userCode} - ${t.fullName}`);
      }
      result[t.userCode] = doc;
    }
    return result;
  }

  // --- Academic Years ---
  private async seedAcademicYears() {
    const ayData = {
      name: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-08-31'),
      status: 'active',
    };

    let doc = await this.academicYearModel.findOne({ name: ayData.name });
    if (!doc) {
      doc = await this.academicYearModel.create(ayData);
      this.logger.log(`Seeded academic year: ${ayData.name}`);
    }
    return doc;
  }

  // --- Semesters ---
  private async seedSemesters(academicYear: any) {
    const semesterData = [
      {
        key: 'semester1',
        name: 'Học kỳ 1',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-01-15'),
        status: 'closed',
      },
      {
        key: 'semester2',
        name: 'Học kỳ 2',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-06-15'),
        status: 'active',
      },
      {
        key: 'summer',
        name: 'Học kỳ hè',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-08-31'),
        status: 'upcoming',
      },
    ];

    const result: Record<string, any> = {};
    for (const s of semesterData) {
      let doc = await this.semesterModel.findOne({
        academicYearId: academicYear._id,
        name: s.name,
      });
      if (!doc) {
        doc = await this.semesterModel.create({
          academicYearId: academicYear._id,
          name: s.name,
          startDate: s.startDate,
          endDate: s.endDate,
          status: s.status,
        });
        this.logger.log(`Seeded semester: ${s.name} (${s.status})`);
      }
      result[s.key] = doc;
    }
    return result;
  }

  // --- Subjects ---
  private async seedSubjects() {
    const baseSubjects = [
      { code: 'CS101', name: 'Nhập môn lập trình', credits: 3, description: 'Giới thiệu các khái niệm cơ bản về lập trình, giải thuật và cấu trúc dữ liệu đơn giản' },
      { code: 'CS102', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, description: 'Các cấu trúc dữ liệu nâng cao: cây, đồ thị, bảng băm; các giải thuật sắp xếp và tìm kiếm' },
      { code: 'MATH101', name: 'Toán cao cấp 1', credits: 3, description: 'Đại số tuyến tính, ma trận, hệ phương trình tuyến tính' },
      { code: 'MATH102', name: 'Toán cao cấp 2', credits: 3, description: 'Giải tích hàm một biến, tích phân, chuỗi số' },
      { code: 'MATH201', name: 'Xác suất thống kê', credits: 3, description: 'Lý thuyết xác suất, biến ngẫu nhiên, ước lượng và kiểm định' },
      { code: 'ENG101', name: 'Tiếng Anh cơ bản 1', credits: 2, description: 'Tiếng Anh giao tiếp trình độ A2-B1' },
      { code: 'ENG102', name: 'Tiếng Anh cơ bản 2', credits: 2, description: 'Tiếng Anh giao tiếp trình độ B1-B2' },
      { code: 'PHY101', name: 'Vật lý đại cương', credits: 3, description: 'Cơ học, nhiệt học, điện từ học, quang học' },
      { code: 'CS201', name: 'Lập trình hướng đối tượng', credits: 3, description: 'OOP với Java/C++: kế thừa, đa hình, đóng gói, trừu tượng' },
      { code: 'CS202', name: 'Cơ sở dữ liệu', credits: 4, description: 'Mô hình quan hệ, SQL, thiết kế CSDL, chuẩn hóa, transaction' },
      { code: 'CS301', name: 'Mạng máy tính', credits: 3, description: 'Mô hình OSI, TCP/IP, routing, switching, bảo mật mạng' },
      { code: 'CS302', name: 'Hệ điều hành', credits: 3, description: 'Quản lý tiến trình, bộ nhớ, file system, đồng bộ hóa' },
      { code: 'CS401', name: 'Công nghệ phần mềm', credits: 3, description: 'Quy trình phát triển phần mềm, UML, Agile/Scrum, testing' },
      { code: 'CS402', name: 'Trí tuệ nhân tạo', credits: 3, description: 'Tìm kiếm, học máy cơ bản, xử lý ngôn ngữ tự nhiên' },
      { code: 'CS403', name: 'Phát triển ứng dụng Web', credits: 4, description: 'Frontend (HTML/CSS/JS/React), Backend (Node.js/NestJS), RESTful API, MongoDB' },
    ];

    const result: Record<string, any> = {};

    for (const s of baseSubjects) {
      let doc = await this.subjectModel.findOne({ code: s.code });
      if (!doc) {
        doc = await this.subjectModel.create(s);
        this.logger.log(`Seeded subject: ${s.code} - ${s.name}`);
      }
      result[s.code] = doc;
    }

    const prerequisites: Record<string, string> = {
      'CS102': 'CS101',
      'CS201': 'CS101',
      'CS202': 'CS101',
      'CS301': 'CS201',
      'CS302': 'CS201',
      'CS401': 'CS202',
      'CS402': 'MATH201',
      'CS403': 'CS202',
      'MATH102': 'MATH101',
      'MATH201': 'MATH102',
      'ENG102': 'ENG101',
    };

    for (const [subjectCode, prereqCode] of Object.entries(prerequisites)) {
      const subject = result[subjectCode];
      const prereq = result[prereqCode];
      if (subject && prereq && !subject.prerequisiteSubjectId) {
        await this.subjectModel.findByIdAndUpdate(subject._id, {
          prerequisiteSubjectId: prereq._id,
        });
        result[subjectCode] = await this.subjectModel.findById(subject._id);
      }
    }

    return result;
  }

  // --- Classes (student cohorts) ---
  private async seedClasses(teacherUsers: Record<string, any>) {
    const classData = [
      { name: 'CNTT2025-A', cohortYear: 2025, homeroomTeacherCode: 'GV001' },
      { name: 'CNTT2025-B', cohortYear: 2025, homeroomTeacherCode: 'GV002' },
      { name: 'CNTT2024-A', cohortYear: 2024, homeroomTeacherCode: 'GV003' },
      { name: 'CNTT2024-B', cohortYear: 2024, homeroomTeacherCode: 'GV004' },
      { name: 'CNTT2023-A', cohortYear: 2023, homeroomTeacherCode: 'GV007' },
      { name: 'CNTT2023-B', cohortYear: 2023, homeroomTeacherCode: 'GV008' },
    ];

    const result: Record<string, any> = {};
    for (const c of classData) {
      let doc = await this.classModel.findOne({ name: c.name });
      const teacher = teacherUsers[c.homeroomTeacherCode];
      if (!doc) {
        doc = await this.classModel.create({
          name: c.name,
          cohortYear: c.cohortYear,
          homeroomLecturerId: teacher ? teacher._id : null,
        });
        this.logger.log(`Seeded class: ${c.name} (Khóa ${c.cohortYear})`);
      } else if (teacher) {
        doc.homeroomLecturerId = teacher._id;
        await doc.save();
      }
      result[c.name] = doc;
    }
    return result;
  }

  // --- ClassSubject (assign subjects to classes) ---
  private async seedClassSubjects(classes: Record<string, any>, subjects: Record<string, any>) {
    const year2025Subjects = ['CS101', 'CS102', 'MATH101', 'MATH102', 'ENG101', 'ENG102', 'PHY101'];
    const year2024Subjects = ['CS201', 'CS202', 'CS301', 'CS302', 'MATH201', 'CS401', 'CS402', 'CS403'];
    const year2023Subjects = ['CS301', 'CS302', 'CS401', 'CS402', 'CS403', 'MATH201'];

    const assignments: Array<{ className: string; subjectCodes: string[] }> = [
      { className: 'CNTT2025-A', subjectCodes: year2025Subjects },
      { className: 'CNTT2025-B', subjectCodes: year2025Subjects },
      { className: 'CNTT2024-A', subjectCodes: year2024Subjects },
      { className: 'CNTT2024-B', subjectCodes: year2024Subjects },
      { className: 'CNTT2023-A', subjectCodes: year2023Subjects },
      { className: 'CNTT2023-B', subjectCodes: year2023Subjects },
    ];

    for (const a of assignments) {
      const classDoc = classes[a.className];
      if (!classDoc) continue;

      for (const code of a.subjectCodes) {
        const subjectDoc = subjects[code];
        if (!subjectDoc) continue;

        const exists = await this.classSubjectModel.exists({
          classId: classDoc._id,
          subjectId: subjectDoc._id,
        });
        if (!exists) {
          await this.classSubjectModel.create({
            classId: classDoc._id,
            subjectId: subjectDoc._id,
          });
        }
      }
    }
  }

  // --- Course Sections (15 lớp học phần) ---
  private async seedCourseSections(
    subjects: Record<string, any>,
    semesters: Record<string, any>,
    teacherUsers: Record<string, any>,
  ) {
    // Format: { subjectCode, semesterKey, sectionCode, maxSize, room, schedule, dayOfWeek, startPeriod, numPeriods, teacherCode, role }
    const courseSectionData = [
      // ── HK2/2026 – Lớp K2025 (năm 1) ─────────────────────────────────────
      { subjectCode: 'CS101',   semesterKey: 'semester2', sectionCode: 'CS101-HK2-2026-01',   maxSize: 40, room: 'A101', dayOfWeek: 2, startPeriod: 1,  numPeriods: 3, teacherCode: 'GV003', role: 'main' },
      { subjectCode: 'CS101',   semesterKey: 'semester2', sectionCode: 'CS101-HK2-2026-02',   maxSize: 40, room: 'A102', dayOfWeek: 4, startPeriod: 1,  numPeriods: 3, teacherCode: 'GV006', role: 'main' },
      { subjectCode: 'MATH101', semesterKey: 'semester2', sectionCode: 'MATH101-HK2-2026-01', maxSize: 50, room: 'D101', dayOfWeek: 3, startPeriod: 1,  numPeriods: 3, teacherCode: 'GV005', role: 'main' },
      { subjectCode: 'MATH102', semesterKey: 'semester2', sectionCode: 'MATH102-HK2-2026-01', maxSize: 50, room: 'D201', dayOfWeek: 3, startPeriod: 4,  numPeriods: 3, teacherCode: 'GV009', role: 'main' },
      { subjectCode: 'ENG101',  semesterKey: 'semester2', sectionCode: 'ENG101-HK2-2026-01',  maxSize: 35, room: 'E101', dayOfWeek: 5, startPeriod: 4,  numPeriods: 2, teacherCode: 'GV007', role: 'main' },
      { subjectCode: 'ENG102',  semesterKey: 'semester2', sectionCode: 'ENG102-HK2-2026-01',  maxSize: 35, room: 'E102', dayOfWeek: 5, startPeriod: 7,  numPeriods: 2, teacherCode: 'GV010', role: 'main' },
      // ── HK2/2026 – Lớp K2024 (năm 2) ─────────────────────────────────────
      { subjectCode: 'CS201',   semesterKey: 'semester2', sectionCode: 'CS201-HK2-2026-01',   maxSize: 40, room: 'A301', dayOfWeek: 2, startPeriod: 4,  numPeriods: 3, teacherCode: 'GV001', role: 'main' },
      { subjectCode: 'CS201',   semesterKey: 'semester2', sectionCode: 'CS201-HK2-2026-02',   maxSize: 40, room: 'A302', dayOfWeek: 4, startPeriod: 4,  numPeriods: 3, teacherCode: 'GV003', role: 'main' },
      { subjectCode: 'CS202',   semesterKey: 'semester2', sectionCode: 'CS202-HK2-2026-01',   maxSize: 35, room: 'B201', dayOfWeek: 3, startPeriod: 7,  numPeriods: 3, teacherCode: 'GV002', role: 'main' },
      { subjectCode: 'MATH201', semesterKey: 'semester2', sectionCode: 'MATH201-HK2-2026-01', maxSize: 50, room: 'D401', dayOfWeek: 6, startPeriod: 4,  numPeriods: 3, teacherCode: 'GV005', role: 'main' },
      // ── HK2/2026 – Lớp K2023 (năm 3) ─────────────────────────────────────
      { subjectCode: 'CS301',   semesterKey: 'semester2', sectionCode: 'CS301-HK2-2026-01',   maxSize: 35, room: 'C101', dayOfWeek: 5, startPeriod: 1,  numPeriods: 3, teacherCode: 'GV004', role: 'main' },
      { subjectCode: 'CS302',   semesterKey: 'semester2', sectionCode: 'CS302-HK2-2026-01',   maxSize: 35, room: 'C201', dayOfWeek: 3, startPeriod: 10, numPeriods: 3, teacherCode: 'GV008', role: 'main' },
      { subjectCode: 'CS403',   semesterKey: 'semester2', sectionCode: 'CS403-HK2-2026-01',   maxSize: 30, room: 'LAB01', dayOfWeek: 2, startPeriod: 7, numPeriods: 4, teacherCode: 'GV001', role: 'main' },
      // ── HK hè – Tất cả khoá ────────────────────────────────────────────────
      { subjectCode: 'CS401',   semesterKey: 'summer',    sectionCode: 'CS401-HE-2026-01',    maxSize: 35, room: 'A301', dayOfWeek: 2, startPeriod: 1,  numPeriods: 3, teacherCode: 'GV006', role: 'main' },
      { subjectCode: 'CS402',   semesterKey: 'summer',    sectionCode: 'CS402-HE-2026-01',    maxSize: 35, room: 'LAB02', dayOfWeek: 3, startPeriod: 1, numPeriods: 4, teacherCode: 'GV004', role: 'main' },
    ];

    const result: Record<string, any> = {};
    for (const cs of courseSectionData) {
      const subject = subjects[cs.subjectCode];
      const semester = semesters[cs.semesterKey];
      if (!subject || !semester) continue;

      let doc = await this.courseSectionModel.findOne({ sectionCode: cs.sectionCode });
      if (!doc) {
        const scheduleMap: Record<number, string> = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7' };
        doc = await this.courseSectionModel.create({
          subjectId: subject._id,
          semesterId: semester._id,
          sectionCode: cs.sectionCode,
          maxSize: cs.maxSize,
          currentSize: 0,
          room: cs.room,
          schedule: `${scheduleMap[cs.dayOfWeek] || ''} - Tiết ${cs.startPeriod}-${cs.startPeriod + cs.numPeriods - 1}`,
          scheduleDayOfWeek: cs.dayOfWeek,
          scheduleStartPeriod: cs.startPeriod,
          scheduleNumPeriods: cs.numPeriods,
          status: 'open',
        });
        this.logger.log(`Seeded course section: ${cs.sectionCode}`);
      }
      result[cs.sectionCode] = doc;

      const teacher = teacherUsers[cs.teacherCode];
      if (teacher) {
        const lecturerExists = await this.courseSectionLecturerModel.exists({
          courseSectionId: doc._id,
          lecturerId: teacher._id,
        });
        if (!lecturerExists) {
          await this.courseSectionLecturerModel.create({
            courseSectionId: doc._id,
            lecturerId: teacher._id,
            role: cs.role,
          });
        }
      }
    }
    return result;
  }

  // --- Student Users: generate 150 SV (25/lớp x 6 lớp) ---
  private async seedStudentUsers(classes: Record<string, any>) {
    const studentRole = await this.roleModel.findOne({ code: 'student' });
    if (!studentRole) return {};

    // Họ phổ biến & tên đệm/tên phổ biến VN để generate
    const surNames  = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    const midNames  = ['Văn', 'Thị', 'Đức', 'Minh', 'Quốc', 'Hoàng', 'Thành', 'Quang', 'Thị', 'Bảo'];
    const lastNames = [
      'An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Giang', 'Hương', 'Khải', 'Linh', 'Minh',
      'Nam', 'Oanh', 'Phong', 'Quỳnh', 'Sơn', 'Trang', 'Uyên', 'Vinh', 'Xuyên', 'Yến',
      'Anh', 'Bảo', 'Chi', 'Đạt', 'Hải', 'Khánh', 'Long', 'Mai', 'Ngọc', 'Phúc',
    ];

    // 6 lớp sinh hoạt, mỗi lớp 25 sinh viên
    const classGroups = [
      { className: 'CNTT2025-A', cohort: '2025', prefix: 'A' },
      { className: 'CNTT2025-B', cohort: '2025', prefix: 'B' },
      { className: 'CNTT2024-A', cohort: '2024', prefix: 'C' },
      { className: 'CNTT2024-B', cohort: '2024', prefix: 'D' },
      { className: 'CNTT2023-A', cohort: '2023', prefix: 'E' },
      { className: 'CNTT2023-B', cohort: '2023', prefix: 'F' },
    ];

    const result: Record<string, any> = {};
    let globalIdx = 1;

    for (const group of classGroups) {
      const classDoc = classes[group.className];
      if (!classDoc) continue;

      for (let i = 1; i <= 25; i++) {
        const sur  = surNames[globalIdx % surNames.length];
        const mid  = midNames[(globalIdx + i) % midNames.length];
        const last = lastNames[(globalIdx * 2 + i) % lastNames.length];
        const fullName = `${sur} ${mid} ${last}`;
        const userCode  = `SV${group.cohort}${group.prefix}${String(i).padStart(3, '0')}`;
        const emailSlug = removeVietnameseTones(`${last}.${sur.charAt(0).toLowerCase()}${group.prefix}${i}`).toLowerCase();
        const email = `${emailSlug}@student.edu.vn`;
        const phone = `09${String(globalIdx + 10_000_000).slice(-8)}`;

        let doc = await this.userModel.findOne({
          $or: [{ email }, { userCode }],
        });

        if (!doc) {
          doc = await this.userModel.create({
            firebaseUid: `seed-student-${userCode}`,
            email,
            userCode,
            fullName,
            phone,
            roleId: studentRole._id,
            classId: classDoc._id,
            status: 'active',
            isEmailVerified: true,
          });
        } else {
          doc.classId  = classDoc._id;
          doc.userCode = userCode;
          await doc.save();
        }

        result[userCode] = doc;
        globalIdx++;
      }

      this.logger.log(`Seeded 25 students for class: ${group.className}`);
    }

    return result;
  }

  // --- Enrollments: enroll từng lớp sinh hoạt vào các lớp học phần tương ứng ---
  private async seedEnrollments(
    studentUsers: Record<string, any>,
    courseSections: Record<string, any>,
  ) {
    // Map: sectionCode -> danh sách userCode prefix (lớp sinh hoạt nào học lớp HP này)
    const enrollmentPlan: Array<{ sectionCode: string; cohortPrefixes: string[] }> = [
      // CS101: K2025-A & K2025-B học
      { sectionCode: 'CS101-HK2-2026-01', cohortPrefixes: ['SV2025A'] },
      { sectionCode: 'CS101-HK2-2026-02', cohortPrefixes: ['SV2025B'] },
      // MATH101, MATH102: K2025
      { sectionCode: 'MATH101-HK2-2026-01', cohortPrefixes: ['SV2025A', 'SV2025B'] },
      { sectionCode: 'MATH102-HK2-2026-01', cohortPrefixes: ['SV2025A', 'SV2025B'] },
      // ENG101, ENG102: K2025
      { sectionCode: 'ENG101-HK2-2026-01', cohortPrefixes: ['SV2025A'] },
      { sectionCode: 'ENG102-HK2-2026-01', cohortPrefixes: ['SV2025B'] },
      // CS201, CS202, MATH201: K2024
      { sectionCode: 'CS201-HK2-2026-01', cohortPrefixes: ['SV2024C'] },
      { sectionCode: 'CS201-HK2-2026-02', cohortPrefixes: ['SV2024D'] },
      { sectionCode: 'CS202-HK2-2026-01', cohortPrefixes: ['SV2024C', 'SV2024D'] },
      { sectionCode: 'MATH201-HK2-2026-01', cohortPrefixes: ['SV2024C', 'SV2024D'] },
      // CS301, CS302, CS403: K2023
      { sectionCode: 'CS301-HK2-2026-01', cohortPrefixes: ['SV2023E'] },
      { sectionCode: 'CS302-HK2-2026-01', cohortPrefixes: ['SV2023E', 'SV2023F'] },
      { sectionCode: 'CS403-HK2-2026-01', cohortPrefixes: ['SV2023F'] },
      // HK hè: mix K2023 + K2024 (thi lại / học trước)
      { sectionCode: 'CS401-HE-2026-01', cohortPrefixes: ['SV2023E', 'SV2024C'] },
      { sectionCode: 'CS402-HE-2026-01', cohortPrefixes: ['SV2023F', 'SV2024D'] },
    ];

    // Build lookup: prefix -> danh sách student docs
    const prefixMap: Record<string, any[]> = {};
    for (const [userCode, doc] of Object.entries(studentUsers)) {
      // userCode = SV2025A001 → prefix = SV2025A
      const prefix = userCode.slice(0, 7);
      if (!prefixMap[prefix]) prefixMap[prefix] = [];
      prefixMap[prefix].push(doc);
    }

    let totalEnrolled = 0;
    for (const plan of enrollmentPlan) {
      const sectionDoc = courseSections[plan.sectionCode];
      if (!sectionDoc) continue;

      for (const prefix of plan.cohortPrefixes) {
        const students = prefixMap[prefix] || [];
        for (const student of students) {
          const exists = await this.enrollmentModel.exists({
            studentId: student._id,
            courseSectionId: sectionDoc._id,
          });
          if (!exists) {
            await this.enrollmentModel.create({
              studentId: student._id,
              courseSectionId: sectionDoc._id,
              enrollmentDate: new Date(),
              status: 'enrolled',
            });
            await this.courseSectionModel.findByIdAndUpdate(sectionDoc._id, {
              $inc: { currentSize: 1 },
            });
            totalEnrolled++;
          }
        }
      }
    }

    this.logger.log(`✅ Seeded ${totalEnrolled} enrollments (~${Math.round(totalEnrolled / Object.keys(courseSections).length)} SV/lớp HP)`);
  }


  private async seedPeriodConfigs() {
    const periods = [
      { periodNumber: 1, startTime: '07:00', endTime: '07:50' },
      { periodNumber: 2, startTime: '08:00', endTime: '08:50' },
      { periodNumber: 3, startTime: '09:00', endTime: '09:50' },
      { periodNumber: 4, startTime: '10:00', endTime: '10:50' },
      { periodNumber: 5, startTime: '11:00', endTime: '11:50' },
      { periodNumber: 6, startTime: '12:00', endTime: '12:50' },
      { periodNumber: 7, startTime: '13:00', endTime: '13:50' },
      { periodNumber: 8, startTime: '14:00', endTime: '14:50' },
      { periodNumber: 9, startTime: '15:00', endTime: '15:50' },
      { periodNumber: 10, startTime: '16:00', endTime: '16:50' },
      { periodNumber: 11, startTime: '17:00', endTime: '17:50' },
      { periodNumber: 12, startTime: '18:00', endTime: '18:50' },
      { periodNumber: 13, startTime: '19:00', endTime: '19:50' },
      { periodNumber: 14, startTime: '20:00', endTime: '20:50' },
    ];

    for (const period of periods) {
      await this.periodConfigModel.findOneAndUpdate(
        { periodNumber: period.periodNumber },
        { ...period, isActive: true },
        { upsert: true, new: true },
      );
    }
    this.logger.log('✅ Seeded PeriodConfig (14 tiết học)');
  }

  private async seedAttendanceConfigs() {
    const count = await this.attendanceConfigModel.countDocuments();
    if (count === 0) {
      await this.attendanceConfigModel.create({
        gracePeriodMinutes: 10,
        lateThresholdMinutes: 30,
        allowSelfCheckIn: true,
        isActive: true,
      });
      this.logger.log('✅ Seeded AttendanceConfig default');
    }
  }
}

// ============================================================
// Helper: bỏ dấu tiếng Việt để tạo email slug
// ============================================================
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9.]/g, '');
}
