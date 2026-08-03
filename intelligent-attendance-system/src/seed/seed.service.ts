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
    @Inject(FIREBASE_ADMIN) private firebaseAdmin: typeof admin,
  ) {}

  async runSeed() {
    await this.seedRoles();
    await this.seedConfigs();
    await this.seedMenus();
    await this.seedUsers();
    await this.seedAcademicData();
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
      await this.seedEnrollments(studentUsers, courseSections);
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
      { userCode: 'GV001', fullName: 'PGS.TS Nguyễn Văn Hùng', email: 'hung.nv@university.edu.vn', phone: '0901000001' },
      { userCode: 'GV002', fullName: 'TS. Trần Thị Lan', email: 'lan.tt@university.edu.vn', phone: '0901000002' },
      { userCode: 'GV003', fullName: 'ThS. Lê Minh Tuấn', email: 'tuan.lm@university.edu.vn', phone: '0901000003' },
      { userCode: 'GV004', fullName: 'TS. Phạm Quốc Đạt', email: 'dat.pq@university.edu.vn', phone: '0901000004' },
      { userCode: 'GV005', fullName: 'PGS.TS Hoàng Thị Mai', email: 'mai.ht@university.edu.vn', phone: '0901000005' },
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
      { name: 'CNTT2025-A', cohortYear: 2025, homeroomTeacherCode: 'GV000' },
      { name: 'CNTT2025-B', cohortYear: 2025, homeroomTeacherCode: 'GV002' },
      { name: 'CNTT2024-A', cohortYear: 2024, homeroomTeacherCode: 'GV003' },
      { name: 'CNTT2024-B', cohortYear: 2024, homeroomTeacherCode: 'GV004' },
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

    const assignments: Array<{ className: string; subjectCodes: string[] }> = [
      { className: 'CNTT2025-A', subjectCodes: year2025Subjects },
      { className: 'CNTT2025-B', subjectCodes: year2025Subjects },
      { className: 'CNTT2024-A', subjectCodes: year2024Subjects },
      { className: 'CNTT2024-B', subjectCodes: year2024Subjects },
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

  // --- Course Sections ---
  private async seedCourseSections(
    subjects: Record<string, any>,
    semesters: Record<string, any>,
    teacherUsers: Record<string, any>,
  ) {
    const courseSectionData = [
      { subjectCode: 'CS201', semesterKey: 'semester2', sectionCode: 'CS201-HK2-2026-01', maxSize: 40, room: 'A301', schedule: 'Thứ 2 - Tiết 1-3', teacherCode: 'GV000', role: 'main' },
      { subjectCode: 'CS201', semesterKey: 'semester2', sectionCode: 'CS201-HK2-2026-02', maxSize: 40, room: 'A302', schedule: 'Thứ 4 - Tiết 1-3', teacherCode: 'GV003', role: 'main' },
      { subjectCode: 'CS202', semesterKey: 'semester2', sectionCode: 'CS202-HK2-2026-01', maxSize: 35, room: 'B201', schedule: 'Thứ 3 - Tiết 4-6', teacherCode: 'GV002', role: 'main' },
      { subjectCode: 'CS301', semesterKey: 'semester2', sectionCode: 'CS301-HK2-2026-01', maxSize: 35, room: 'C101', schedule: 'Thứ 5 - Tiết 1-3', teacherCode: 'GV004', role: 'main' },
      { subjectCode: 'MATH201', semesterKey: 'semester2', sectionCode: 'MATH201-HK2-2026-01', maxSize: 50, room: 'D401', schedule: 'Thứ 6 - Tiết 4-6', teacherCode: 'GV005', role: 'main' },
      { subjectCode: 'CS403', semesterKey: 'semester2', sectionCode: 'CS403-HK2-2026-01', maxSize: 30, room: 'LAB01', schedule: 'Thứ 2 - Tiết 7-10', teacherCode: 'GV000', role: 'main' },
      { subjectCode: 'MATH102', semesterKey: 'semester2', sectionCode: 'MATH102-HK2-2026-01', maxSize: 60, room: 'D201', schedule: 'Thứ 3 - Tiết 1-3', teacherCode: 'GV005', role: 'main' },
      { subjectCode: 'CS102', semesterKey: 'semester2', sectionCode: 'CS102-HK2-2026-01', maxSize: 45, room: 'A401', schedule: 'Thứ 4 - Tiết 4-6', teacherCode: 'GV003', role: 'main' },
      { subjectCode: 'ENG102', semesterKey: 'semester2', sectionCode: 'ENG102-HK2-2026-01', maxSize: 30, room: 'E101', schedule: 'Thứ 5 - Tiết 4-6', teacherCode: 'GV002', role: 'main' },
      { subjectCode: 'CS401', semesterKey: 'summer', sectionCode: 'CS401-HE-2026-01', maxSize: 30, room: 'A301', schedule: 'Thứ 2,4,6 - Tiết 1-3', teacherCode: 'GV001', role: 'main' },
      { subjectCode: 'CS402', semesterKey: 'summer', sectionCode: 'CS402-HE-2026-01', maxSize: 30, room: 'LAB02', schedule: 'Thứ 3,5 - Tiết 1-4', teacherCode: 'GV004', role: 'main' },
    ];

    const result: Record<string, any> = {};
    for (const cs of courseSectionData) {
      const subject = subjects[cs.subjectCode];
      const semester = semesters[cs.semesterKey];
      if (!subject || !semester) continue;

      let doc = await this.courseSectionModel.findOne({ sectionCode: cs.sectionCode });
      if (!doc) {
        doc = await this.courseSectionModel.create({
          subjectId: subject._id,
          semesterId: semester._id,
          sectionCode: cs.sectionCode,
          maxSize: cs.maxSize,
          currentSize: 0,
          room: cs.room,
          schedule: cs.schedule,
          status: 'open',
        });
        this.logger.log(`Seeded course section: ${cs.sectionCode}`);
      }
      result[cs.sectionCode] = doc;

      // Assign teacher user as lecturer
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

  // --- Student Users (Role = student in `users` collection) ---
  private async seedStudentUsers(classes: Record<string, any>) {
    const studentRole = await this.roleModel.findOne({ code: 'student' });
    if (!studentRole) return {};

    const studentData = [
      { userCode: 'SV2025001', fullName: 'Nguyễn Văn An', className: 'CNTT2025-A', email: 'an.nv@student.edu.vn', phone: '0911000001' },
      { userCode: 'SV2025002', fullName: 'Trần Thị Bình', className: 'CNTT2025-A', email: 'binh.tt@student.edu.vn', phone: '0911000002' },
      { userCode: 'SV2025003', fullName: 'Lê Hoàng Cường', className: 'CNTT2025-A', email: 'cuong.lh@student.edu.vn', phone: '0911000003' },
      { userCode: 'SV2025004', fullName: 'Phạm Minh Dũng', className: 'CNTT2025-A', email: 'dung.pm@student.edu.vn', phone: '0911000004' },
      { userCode: 'SV2025005', fullName: 'Hoàng Thị Hà', className: 'CNTT2025-A', email: 'ha.ht@student.edu.vn', phone: '0911000005' },
      { userCode: 'SV2025006', fullName: 'Vũ Đức Giang', className: 'CNTT2025-B', email: 'giang.vd@student.edu.vn', phone: '0911000006' },
      { userCode: 'SV2025007', fullName: 'Đặng Thị Hương', className: 'CNTT2025-B', email: 'huong.dt@student.edu.vn', phone: '0911000007' },
      { userCode: 'SV2025008', fullName: 'Bùi Quang Khải', className: 'CNTT2025-B', email: 'khai.bq@student.edu.vn', phone: '0911000008' },
      { userCode: 'SV2024001', fullName: 'Nguyễn Thị Linh', className: 'CNTT2024-A', email: 'linh.nt@student.edu.vn', phone: '0911000009' },
      { userCode: 'SV2024002', fullName: 'Trần Quốc Minh', className: 'CNTT2024-A', email: 'minh.tq@student.edu.vn', phone: '0911000010' },
      { userCode: 'SV2024003', fullName: 'Lê Văn Nam', className: 'CNTT2024-A', email: 'nam.lv@student.edu.vn', phone: '0911000011' },
      { userCode: 'SV2024004', fullName: 'Phạm Thị Oanh', className: 'CNTT2024-A', email: 'oanh.pt@student.edu.vn', phone: '0911000012' },
      { userCode: 'SV2024005', fullName: 'Hoàng Đức Phong', className: 'CNTT2024-A', email: 'phong.hd@student.edu.vn', phone: '0911000013' },
      { userCode: 'SV2024006', fullName: 'Vũ Thị Quỳnh', className: 'CNTT2024-B', email: 'quynh.vt@student.edu.vn', phone: '0911000014' },
      { userCode: 'SV2024007', fullName: 'Đặng Văn Sơn', className: 'CNTT2024-B', email: 'son.dv@student.edu.vn', phone: '0911000015' },
      { userCode: 'SV2024008', fullName: 'Bùi Thị Trang', className: 'CNTT2024-B', email: 'trang.bt@student.edu.vn', phone: '0911000016' },
    ];

    const result: Record<string, any> = {};
    for (const s of studentData) {
      let doc = await this.userModel.findOne({
        $or: [{ email: s.email }, { userCode: s.userCode }],
      });
      const classDoc = classes[s.className];

      if (!doc) {
        doc = await this.userModel.create({
          firebaseUid: `seed-student-${s.userCode}`,
          email: s.email,
          userCode: s.userCode,
          fullName: s.fullName,
          phone: s.phone,
          roleId: studentRole._id,
          classId: classDoc ? classDoc._id : null,
          status: 'active',
          isEmailVerified: true,
        });
        this.logger.log(`Seeded student user: ${s.userCode} - ${s.fullName}`);
      } else {
        doc.classId = classDoc ? classDoc._id : doc.classId;
        doc.userCode = s.userCode;
        await doc.save();
      }
      result[s.userCode] = doc;
    }
    return result;
  }

  // --- Enrollments ---
  private async seedEnrollments(
    studentUsers: Record<string, any>,
    courseSections: Record<string, any>,
  ) {
    const enrollmentData = [
      { userCode: 'SV2024001', sectionCode: 'CS201-HK2-2026-01' },
      { userCode: 'SV2024002', sectionCode: 'CS201-HK2-2026-01' },
      { userCode: 'SV2024003', sectionCode: 'CS201-HK2-2026-01' },
      { userCode: 'SV2024004', sectionCode: 'CS202-HK2-2026-01' },
      { userCode: 'SV2024005', sectionCode: 'CS202-HK2-2026-01' },
      { userCode: 'SV2024006', sectionCode: 'CS201-HK2-2026-02' },
      { userCode: 'SV2024007', sectionCode: 'CS201-HK2-2026-02' },
      { userCode: 'SV2024008', sectionCode: 'CS301-HK2-2026-01' },
      { userCode: 'SV2024001', sectionCode: 'MATH201-HK2-2026-01' },
      { userCode: 'SV2024002', sectionCode: 'MATH201-HK2-2026-01' },
      { userCode: 'SV2024003', sectionCode: 'CS403-HK2-2026-01' },
      { userCode: 'SV2024004', sectionCode: 'CS403-HK2-2026-01' },
      { userCode: 'SV2025001', sectionCode: 'MATH102-HK2-2026-01' },
      { userCode: 'SV2025002', sectionCode: 'MATH102-HK2-2026-01' },
      { userCode: 'SV2025003', sectionCode: 'CS102-HK2-2026-01' },
      { userCode: 'SV2025004', sectionCode: 'CS102-HK2-2026-01' },
      { userCode: 'SV2025005', sectionCode: 'ENG102-HK2-2026-01' },
      { userCode: 'SV2025006', sectionCode: 'MATH102-HK2-2026-01' },
      { userCode: 'SV2025007', sectionCode: 'CS102-HK2-2026-01' },
      { userCode: 'SV2025008', sectionCode: 'ENG102-HK2-2026-01' },
    ];

    let enrolledCount = 0;
    for (const e of enrollmentData) {
      const student = studentUsers[e.userCode];
      const section = courseSections[e.sectionCode];
      if (!student || !section) continue;

      const exists = await this.enrollmentModel.exists({
        studentId: student._id,
        courseSectionId: section._id,
      });

      if (!exists) {
        await this.enrollmentModel.create({
          studentId: student._id,
          courseSectionId: section._id,
          enrollmentDate: new Date(),
          status: 'enrolled',
        });

        await this.courseSectionModel.findByIdAndUpdate(section._id, {
          $inc: { currentSize: 1 },
        });

        enrolledCount++;
      }
    }

    if (enrolledCount > 0) {
      this.logger.log(`Seeded ${enrolledCount} enrollments referencing User model`);
    }
  }
}
