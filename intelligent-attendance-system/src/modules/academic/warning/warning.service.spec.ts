import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WarningService } from './warning.service';
import { Attendance } from '../../attendance/schemas/attendance.schema';
import { CourseSection } from '../course-section/schemas/course-section.schema';
import { User } from '../../user/schemas/user.schema';
import { Enrollment } from '../student/schemas/enrollment.schema';

describe('WarningService', () => {
  let service: WarningService;

  const mockAttendanceModel = {
    find: jest.fn(),
    distinct: jest.fn(),
  };

  const mockCourseSectionModel = {
    findById: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockEnrollmentModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarningService,
        {
          provide: getModelToken(Attendance.name),
          useValue: mockAttendanceModel,
        },
        {
          provide: getModelToken(CourseSection.name),
          useValue: mockCourseSectionModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Enrollment.name),
          useValue: mockEnrollmentModel,
        },
      ],
    }).compile();

    service = module.get<WarningService>(WarningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('extractStudentFeatures', () => {
    it('Edge Case: Sinh viên chưa có buổi học nào (0 buổi) -> Không lỗi chia cho 0', async () => {
      mockAttendanceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });

      const features = await service.extractStudentFeatures('student_0', 'course_0');
      expect(features.total_sessions).toBe(0);
      expect(features.attendance_rate).toBe(1.0);
      expect(features.absence_rate).toBe(0.0);
      expect(features.consecutive_absence).toBe(0);
    });

    it('Tính toán chính xác 12 đặc trưng khi có lịch sử điểm danh', async () => {
      const mockAttendances = [
        { status: 'present', createdAt: new Date('2026-09-01') },
        { status: 'late', createdAt: new Date('2026-09-02') },
        { status: 'present', createdAt: new Date('2026-09-03') },
        { status: 'absent', createdAt: new Date('2026-09-04') },
        { status: 'absent', createdAt: new Date('2026-09-05') },
      ];

      mockAttendanceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockAttendances),
        }),
      });

      const features = await service.extractStudentFeatures('student_1', 'course_1');
      expect(features.total_sessions).toBe(5);
      expect(features.present_count).toBe(2);
      expect(features.late_count).toBe(1);
      expect(features.absent_count).toBe(2);
      expect(features.absence_rate).toBe(0.4); // 2/5 = 0.4
      expect(features.consecutive_absence).toBe(2); // 2 buổi vắng cuối
    });
  });

  describe('predictWarningForStudent & Graceful Fallback', () => {
    it('Edge Case: Sinh viên chưa có buổi điểm danh nào -> Trả về LOW an toàn', async () => {
      mockAttendanceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.predictWarningForStudent('student_0', 'course_0');
      expect(result.risk).toBe('LOW');
      expect(result.riskProbability).toBe(0.0);
      expect(result.riskLevel.label).toBe('An toàn');
    });

    it('Fallback Engine: Khi AI Service offline và sinh viên vắng nhiều (>=20%) -> Phải kích hoạt Fallback HIGH an toàn', async () => {
      // Giả lập vắng 4/5 buổi (80%)
      const mockAttendances = [
        { status: 'present', createdAt: new Date('2026-09-01') },
        { status: 'absent', createdAt: new Date('2026-09-02') },
        { status: 'absent', createdAt: new Date('2026-09-03') },
        { status: 'absent', createdAt: new Date('2026-09-04') },
        { status: 'absent', createdAt: new Date('2026-09-05') },
      ];

      mockAttendanceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockAttendances),
        }),
      });

      // Fetch sẽ fail vì AI service không chạy trên port test ngẫu nhiên -> Tự động fallback
      const result = await service.predictWarningForStudent('student_high', 'course_1');
      expect(result.risk).toBe('HIGH');
      expect(result.is_fallback).toBe(true);
      expect(result.riskProbability).toBeGreaterThanOrEqual(0.70);
      expect(result.recommendation.for_student).toContain('CẤM THI');
    });
  });
});
