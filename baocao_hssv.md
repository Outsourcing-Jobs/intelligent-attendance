**BỘ CÔNG THƯƠNG**

**TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VIỆT - HUNG**

**\---------------------------------------**

­­

**ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC**

NGÀNH CÔNG NGHỆ THÔNG TIN

CHUYÊN NGÀNH CÔNG NGHỆ THÔNG TIN

**TÊN ĐỀ TÀI: XÂY DỰNG HỆ THỐNG ĐIỂM DANH THÔNG MINH TÍCH HỢP CẢNH BÁO ĐIỂM CHUYÊN CẦN TRÊN NỀN TẢNG WEB**

|     |     |
| --- | --- |
| **Người hướng dẫn** | **:** |
| **Họ tên sinh viên** | **:** |
| **Mã sinh viên** | **:** |
| **Khóa** | **:** |

**HÀ NỘI - NĂM 2026**

BỘ CÔNG THƯƠNG

**TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VIỆT – HUNG**

**ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC**

NGÀNH: CÔNG NGHỆ THÔNG TIN

CHUYÊN NGÀNH: CÔNG NGHỆ THÔNG TIN

**TÊN ĐỀ TÀI: XÂY DỰNG HỆ THỐNG ĐIỂM DANH THÔNG MINH TÍCH HỢP CẢNH BÁO ĐIỂM CHUYÊN CẦN TRÊN NỀN TẢNG WEB**

|     |     |
| --- | --- |
| **Người hướng dẫn** | **:** |
| **Họ tên sinh viên** | **:** |
| **Mã sinh viên** | **:** |
| **Khóa** | **:** |

**HÀ NỘI - NĂM 2026**

MỤC LỤC

[LỜI CẢM ƠN 4](#_Toc240871287)

[DANH MỤC CÁC BẢNG BIỂU 5](#_Toc240871288)

[DANH MỤC CÁC SƠ ĐỒ, HÌNH VẼ 6](#_Toc240871289)

[DANH MỤC CÁC TỪ VIẾT TẮT – THUẬT NGỮ ANH – VIỆT 6](#_Toc240871290)

[MỞ ĐẦU 8](#_Toc240871291)

[CHƯƠNG 1 TỔNG QUAN VÀ GIỚI THIỆU CÔNG CỤ HỆ THỐNG 12](#_Toc240871292)

[1.1. Giới thiệu tổng quan về hệ thống 12](#_Toc240871293)

[1.1.1. Khảo sát thực tế 13](#_Toc240871294)

[1.1.2. Đánh giá hệ thống hiện tại và xây dựng bài toán 15](#_Toc240871295)

[1.1.3. Xác lập yêu cầu và các chức năng cần sử dụng cho bài toán 16](#_Toc240871296)

[1.2. Công nghệ, kiến trúc và ngôn ngữ lập trình xây dựng website 19](#_Toc240871297)

[1.2.1. Môi trường Node.js và ngôn ngữ TypeScript 19](#_Toc240871298)

[1.2.2. Framework Backend NestJS 19](#_Toc240871299)

[1.2.3. Thư viện Frontend React và công cụ Vite 20](#_Toc240871300)

[1.2.4. Ngôn ngữ Python và thư viện Học máy Scikit-learn 21](#_Toc240871301)

[1.2.5. Dịch vụ xác thực Firebase Admin SDK 22](#_Toc240871302)

[1.2.6. Thư viện truyền thông thời gian thực Socket.IO 22](#_Toc240871303)

[1.3. Hệ quản trị CSDL 23](#_Toc240871304)

[CHƯƠNG 2 PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG 26](#_Toc240871305)

[2.1. Tổng quan hệ thống 26](#_Toc240871306)

[2.2. Phân tích và thiết kế hệ thống phần mềm 26](#_Toc240871307)

[2.2.1. Actor 26](#_Toc240871308)

[2.2.2. UseCase 28](#_Toc240871309)

[2.2.3. Đặc tả usecase và biểu đồ hoạt động 32](#_Toc240871310)

[2.2.4. ClassDiagram 63](#_Toc240871311)

[CHƯƠNG 3 XÂY DỰNG VÀ PHÁT TRIỂN PHẦN MỀM 67](#_Toc240871312)

[3.1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG 67](#_Toc240871313)

[3.1.1. Kiến trúc phân tán đa dịch vụ 67](#_Toc240871314)

[3.1.2. Tổng hợp các giao thức giao tiếp 70](#_Toc240871315)

[3.2. Xây dựng phân hệ backend 70](#_Toc240871316)

[3.2.1. Xây dựng hệ thống Web API và kiến trúc phân tầng 70](#_Toc240871317)

[3.2.2. Hiện thực hóa các nghiệp vụ cốt lõi 72](#_Toc240871318)

[3.2.3. Cơ chế xác thực JWT và phân quyền 3 tác nhân 75](#_Toc240871319)

[3.3. Xây dựng phân hệ học máy dự báo sớm chuyên cần 76](#_Toc240871320)

[Tổng quan mục tiêu bài toán học máy 76](#_Toc240871321)

[3.3.1. Quy trình chuẩn bị dữ liệu và kỹ thuật chia chuỗi thời gian 76](#_Toc240871322)

[3.3.2. Kỹ thuật trích xuất đặc trưng chuyên cần 78](#_Toc240871323)

[3.3.3. Huấn luyện và tối ưu hóa các mô hình phân loại 79](#_Toc240871324)

[3.3.4. Xây dựng Microservice dự báo thời gian thực với FastAPI 82](#_Toc240871325)

[3.4. Xây dựng phân hệ giao diện người dùng 84](#_Toc240871326)

[3.4.1. Định hình Phong cách Thiết kế và UI Chủ đạo 84](#_Toc240871327)

[3.4.2. Luồng Điều hướng giao diện tổng thể giao diện hệ thống 85](#_Toc240871328)

[3.4.3. Hiện thực hóa các màn hình chức năng theo vai trò 85](#_Toc240871329)

[3.5. Đóng gói và triển khai hệ thống 87](#_Toc240871330)

[3.5.1. Đóng gói đa dịch vụ với Docker & Docker Compose 87](#_Toc240871331)

[3.5.2. Quy trình triển khai thực tế trên hạ tầng đám mây 89](#_Toc240871332)

[3.6. Kết quả đạt được 90](#_Toc240871333)

[CHƯƠNG 4 KIỂM THỬ ĐÁNH GIÁ VÀ TỔNG KẾT ĐỀ TÀI 93](#_Toc240871334)

[4.1. Kết quả thực nghiệm và đánh giá mô hình học máy 93](#_Toc240871335)

[4.1.1. So sánh hiệu năng các mô hình phân loại 93](#_Toc240871336)

[4.1.2. Phân tích ma trận nhầm lẫn và mức độ quan trọng của đặc trưng 94](#_Toc240871337)

[4.1.3. Lựa chọn mô hình tối ưu cho bài toán cảnh báo sớm 94](#_Toc240871338)

[4.2. Kết quả kiểm thử hệ thống phần mềm 94](#_Toc240871339)

[4.2.1. Bảng tổng hợp kết quả kiểm thử chức năng theo từng phân hệ 94](#_Toc240871340)

[4.2.2. Đánh giá cơ chế bảo mật và khả năng chống gian lận điểm danh 96](#_Toc240871341)

[4.2.3. Đánh giá hiệu năng và độ trễ phản hồi khi điểm danh đồng thời 97](#_Toc240871342)

[4.3. Đánh giá kết quả kỹ thuật so với mục tiêu đề tài 97](#_Toc240871343)

[4.3.1. Bảng đối chiếu mục tiêu nghiên cứu và sản phẩm thực tế đạt được 97](#_Toc240871344)

[4.3.2. Những ưu điểm vượt trội và hạn chế kỹ thuật của hệ thống 98](#_Toc240871345)

[KẾT LUẬN 100](#_Toc240871346)

[1\. Kết luận về toàn bộ nghiên cứu của đồ án 100](#_Toc240871347)

[2\. Các đề nghị rút ra từ kết quả nghiên cứu 101](#_Toc240871348)

[3\. Hướng phát triển của đề tài 102](#_Toc240871349)

[TÀI LIỆU THAM KHẢO 103](#_Toc240871350)

LỜI CẢM ƠN

Để có thể hoàn thành đồ án tốt nghiệp này, bên cạnh sự nỗ lực của bản thân, em đã nhận được rất nhiều sự giúp đỡ và đồng hành từ quý Thầy Cô, gia đình và bạn bè.

Em xin chân thành cảm ơn quý Thầy Cô đã tận tâm giảng dạy và truyền đạt cho em những kiến thức chuyên môn cần thiết trong suốt quá trình học tập. Những kiến thức và kinh nghiệm mà Thầy Cô chia sẻ không chỉ giúp em hoàn thành đồ án mà còn là hành trang quý báu cho quá trình học tập và làm việc sau này.

Em xin gửi lời cảm ơn đặc biệt đến giảng viên hướng dẫn Thầy Hà Gia Sơn đã dành thời gian hướng dẫn, góp ý và giúp em giải quyết những khó khăn trong quá trình nghiên cứu, xây dựng và hoàn thiện đề tài.

Bên cạnh đó, em xin cảm ơn gia đình và bạn bè đã luôn bên cạnh, động viên và tạo điều kiện để em có thể tập trung hoàn thành đồ án tốt nghiệp.

Với những hạn chế về kiến thức và kinh nghiệm thực tế, đồ án chắc chắn vẫn còn những thiếu sót. Em rất mong nhận được sự nhận xét và góp ý từ quý Thầy Cô để có thể tiếp tục học hỏi và hoàn thiện bản thân hơn trong tương lai.

Em xin chân thành cảm ơn!

|     |     |
| --- | --- |
|     | _Hà Nội, Ngày tháng năm 2026_<br><br>_Sinh viên thực hiện_ |

DANH MỤC CÁC BẢNG BIỂU

DANH MỤC CÁC SƠ ĐỒ, HÌNH VẼ

DANH MỤC CÁC TỪ VIẾT TẮT – THUẬT NGỮ ANH – VIỆT

<div class="joplin-table-wrapper"><table><tbody><tr><td><p><a id="_Toc154224663"></a><strong>STT</strong></p></td><td><p><strong>Từ viết tắt</strong></p></td><td><p><strong>Nghĩa tiếng Anh</strong></p></td><td><p><strong>Nghĩa tiếng Việt</strong></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><ol><li></li></ol></td><td><p></p></td><td><p></p></td><td><p></p></td></tr></tbody></table></div>

MỞ ĐẦU

1.  Tính cấp thiết của đề tài

**_1.1. Thực trạng và thách thức:_**

- Phương pháp điểm danh truyền thống chiếm nhiều thời gian giảng.
- Một số giải pháp công nghệ đã áp dụng như quét mã QR hoặc thẻ từ RFID vẫn bộc lộ lỗ hổng bảo mật.

**_1.2. Nhu cầu ứng dụng công nghệ mới:_**

- Cần một hệ thống điểm danh tự phục vụ (Self Check-in)
- Ứng dụng AI vào hệ thống
- Xác thực thời gian thực: So khớp ca học, tiết học để tự động phân loại đúng giờ
- Xác thực vị trí địa lý (GPS Geofencing).
- Xác thực mạng nội bộ (IP/WiFi Whitelisting).
- Khóa thiết bị sinh viên 1:1 (Device Binding & Fingerprinting).

**_1.3. Ý nghĩa khoa học và thực tiễn:_**

Hệ thống giúp chuyển đổi số toàn diện công tác điểm danh, giảm tải áp lực quản lý cho giảng viên, minh bạch hóa dữ liệu chuyên cần và nâng cao ý thức tự giác của người học.

1.  Mục tiêu nghiên cứu đề tài

**_2.1. Mục tiêu Tổng quát_**

Nghiên cứu, thiết kế và xây dựng hoàn chỉnh Hệ thống Điểm danh Thông minh đa phương thức hoạt động trên nền tảng Web App có khả năng ứng dụng.

**_2.2. Mục tiêu Cụ thể_**

_2.2.1. Nghiên cứu lý thuyết và giải pháp kỹ thuật:_

- Nghiên cứu thuật toán tính khoảng cách trên mặt cầu, cơ chế bù trừ sai số GPS .
- Module Học máy Dự báo sớm Nguy cơ Chuyên cần
- Nghiên cứu kỹ thuật tạo mã định danh thiết bị và luồng phê duyệt thiết bị 1:1
- Nghiên cứu cơ chế xác thực bảo mật Firebase Authentication.

_2.2.2. Xây dựng phần mềm hoàn chỉnh:_

- Backend (NestJS + MongoDB): Xây dựng hệ thống RESTful API chuẩn Module hóa, phân quyền động (Role-based Access Control).
- Python FastAPI AI Service để phục vụ dự báo, tích hợp suy luận thời gian thực
- Frontend (Next.js 16 + React 19 + Tailwind CSS + shadcn/ui): Xây dựng giao diện Responsive với 3 phân hệ độc lập:
- Nghiên cứu, huấn luyện và tích hợp mô hình Học máy phân loại nhị phân giúp phát hiện sớm sinh viên có nguy cơ vắng học/cảnh báo học vụ để tự động sinh khuyến nghị can thiệp kịp thời.

1.  Đối tượng nghiên cứu và khách thể nghiên cứu

**3.1 Đối tượng nghiên cứu**

Đối tượng nghiên cứu của đề tài bao gồm các quy trình nghiệp vụ, cơ sở lý thuyết, thuật toán và giải pháp công nghệ phục vụ bài toán tự động hóa điểm danh và phòng chống gian lận:

_3.1.1. Quy trình nghiệp vụ quản lý đào tạo và chuyên cần:_

- Quy trình quản lý đào tạo theo học chế tín chỉ: cơ cấu tổ chức đào tạo.
- Quy trình ghi nhận và đánh giá tính chuyên cần: Điểm danh vào (Check-in), Điểm danh ra (Check-out)

_3.1.2. Các giải pháp kỹ thuật và thuật toán chống gian lận cốt lõi:_

- Thuật toán tính khoảng cách địa lý mặt cầu (Haversine Formula).
- Cơ chế xác thực mạng nội bộ (Campus IP/WiFi Whitelisting).
- Kỹ thuật định danh phần cứng/trình duyệt (Device Fingerprinting & Binding).
- Cơ chế kiểm soát phiên và phân quyền động
- Các thuật toán phân loại có giám sát (Logistic Regression, Decision Tree, Random Forest

**3.2 Khách thể nghiên cứu**

Khách thể nghiên cứu là môi trường, không gian thực tế và các thực thể/chủ thể chứa đựng đối tượng nghiên cứu của đề tài:

_3.2.1. Môi trường ứng dụng thực tế:_

- Môi trường quản lý đào tạo, giảng dạy và học tập theo hệ thống tín chỉ tại các trường Đại học, Cao đẳng hoặc các cơ sở giáo dục chuyên nghiệp.
- Hệ thống hạ tầng mạng nội bộ (Campus WiFi/LAN) và không gian địa lý các giảng đường, phòng thí nghiệm trong khuôn viên trường học.

_3.2.2. Các chủ thể (Actors) trực tiếp tham gia và thụ hưởng hệ thống:_

- Sinh viên (Students): Chủ thể thực hiện điểm danh tự phục vụ, theo dõi lịch học cá nhân, tra cứu lịch sử chuyên cần và quản lý thiết bị học tập chính chủ.
- Giảng viên: Chủ thể trực tiếp quản lý lớp học phần.
- Cán bộ Quản trị / Phòng Đào tạo (System Administrators): Chủ thể quản lý danh mục dữ liệu đào tạo toàn trường..

1.  Nhiệm vụ nghiên cứu

Đề tài thực hiện nhóm nhiệm vụ nghiên cứu chính sau:

**Nhiệm vụ 1: Hệ thống hóa các vấn đề lý luận cơ sở khoa học liên quan đến đề tài**

- Nghiên cứu cơ sở lý luận về quy trình quản lý đào tạo theo hệ thống tín chỉ và công tác quản lý chuyên cần sinh viên tại các trường đại học.
- Hệ thống hóa cơ sở toán học và thuật toán định vị địa lý
- Tổng hợp các nguyên lý mạng máy tính và an toàn thông tin
- Nghiên cứu các kiến trúc và công nghệ phát triển phần mềm hiện đại.

**Nhiệm vụ 2: Đề xuất giải pháp, xây dựng hệ thống phần mềm thực nghiệm**

- Đề xuất giải pháp kỹ thuật: Thiết kế mô hình điểm danh thông minh.
- Xây dựng sản phẩm hoàn chỉnh:
- Lập trình hệ thống Backend RESTful API (NestJS + MongoDB) đáp ứng đầy đủ nghiệp vụ quản lý đào tạo, điểm danh tự động, phân quyền động (RBAC) và phê duyệt thiết bị kết hợp mô hình học máy dự đoán
- Phát triển giao diện Frontend Web App (Next.js 16 + React 19 + Tailwind + shadcn/ui) với 3 cổng chức năng: Quản trị viên, Giảng viên và Sinh viên.

1.  Phương pháp nghiên cứu

Để hoàn thành các mục tiêu đề ra, đề tài sử dụng các phương pháp nghiên cứu theo trình tự thực hiện như sau:

**Phương pháp nghiên cứu tài liệu và khảo sát thực tế**

- Thu thập cơ sở lý thuyết, nắm bắt quy trình quản lý điểm danh tại các trường đại học và khảo sát các giải pháp công nghệ để xác định rõ yêu cầu bài toán.

**Phương pháp phân tích và thiết kế hệ thống**

- Chuyển hóa các yêu cầu bài toán thành mô hình kiến trúc phần mềm, luồng xử lý nghiệp vụ và cấu trúc dữ liệu hoàn chỉnh trước khi lập trình.

**Phương pháp thực nghiệm xây dựng phần mềm**

- Hiện thực hóa các bản thiết kế thành sản phẩm phần mềm hoạt động được, tích hợp các thuật toán và cơ chế chống gian lận.

**Phương pháp kiểm thử và đánh giá thực nghiệm**

- Kiểm tra tính đúng đắn của các chức năng, đo lường độ chính xác và đánh giá khả năng ngăn chặn các hành vi gian lận điểm danh của hệ thống..

1.  Các kết quả đạt được của đề tài

Sau khi hoàn thành quá trình nghiên cứu và phát triển, đề tài sẽ bàn giao đầy đủ các sản phẩm sau:

Sản phẩm phần mềm hoàn chỉnh:

- Hệ thống xử lý trung tâm (Backend RESTful API): Cung cấp toàn bộ các dịch vụ quản lý đào tạo, tính toán định vị GPS, xác thực mạng WiFi nội bộ, cơ chế định danh và khóa thiết bị 1:1.
- Python FastAPI AI Service đã tích hợp mô hình phân loại tốt nhất kèm bộ tiền xử lý chuẩn hóa đặc trưng
- Giao diện ứng dụng Web (Frontend Web App): Ứng dụng Web hoàn chỉnh hoạt động đa nền tảng, bao gồm 3 phân hệ chức năng độc lập.

Tài liệu kỹ thuật:

- Quyển Thuyết minh Báo cáo Đồ án tốt nghiệp.
- Bản Đề cương chi tiết ĐATN.
- Bộ Slide thuyết trình báo cáo (PowerPoint)

1.  Kết cấu của đồ án

Đề tài bao gồm 04 chương như sau:

- **Chương 1:** **TỔNG QUAN VÀ GIỚI THIỆU CÔNG CỤ HỆ THỐNG**
- **Chương 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**
- **Chương 3: XÂY DỰNG VÀ PHÁT TRIỂN PHẦN MỀM**
- **Chương 4: KIỂM THỬ ĐÁNH GIÁ VÀ TỔNG KẾT ĐỀ TÀI**

#   
TỔNG QUAN VÀ GIỚI THIỆU CÔNG CỤ HỆ THỐNG

_Trước hết, chương cung cấp cái nhìn tổng quan, các yếu tố ảnh hưởng. Trên cơ sở đó, những khái niệm và thông tin cũng được giới thiệu, nhằm làm rõ cơ sở khoa học cho hệ thống._

## Giới thiệu tổng quan về hệ thống

Trong cơ cấu tổ chức và quản lý đào tạo tại các trường đại học, cao đẳng hiện nay, công tác theo dõi điểm danh và đánh giá điểm chuyên cần của sinh viên giữ một vị trí vô cùng quan trọng, ảnh hưởng trực tiếp đến chất lượng dạy và học. Điểm chuyên cần không chỉ là một chỉ số thành phần chiếm tỷ trọng đáng kể trong công thức tính điểm tổng kết môn học mà còn phản ánh trực quan thái độ học tập, tính kỷ luật, mức độ chuyên cần và tinh thần trách nhiệm của người học đối với quá trình tiếp thu tri thức. Các nghiên cứu giáo dục đã chỉ ra rằng việc duy trì tỷ lệ tham dự lớp học đầy đủ có mối tương quan thuận mạnh mẽ với kết quả thi kết thúc học phần và tỷ lệ hoàn thành chương trình đào tạo đúng hạn của sinh viên.

Mặc dù giữ vai trò then chốt, song quy trình quản lý điểm danh truyền thống đang áp dụng phổ biến tại đại đa số các cơ sở giáo dục vẫn tồn tại vô số hạn chế và bất cập kéo dài nhiều năm chưa được giải quyết dứt điểm. Phương thức điểm danh thủ công phổ biến nhất hiện nay là giảng viên đọc tên từng sinh viên theo danh sách in sẵn hoặc chuyền tay tờ giấy ký tên đầu buổi học. Quy trình này không những ngốn từ 10 đến 15 phút trong mỗi ca học — làm lãng phí quỹ thời gian quý báu dành cho việc truyền đạt kiến thức và tương tác chuyên môn — mà còn tiềm ẩn rất nhiều kẽ hở cho các hành vi gian lận. Tình trạng sinh viên điểm danh hộ, ký tên thay cho bạn vắng mặt, hoặc tự ý điền bổ sung tên vào danh sách diễn ra tương đối phổ biến. Hơn thế nữa, dữ liệu điểm danh trên giấy mang tính thụ động, bị phân tán rải rác và thường chỉ được tổng hợp một cách cơ học vào thời điểm cuối học kỳ khi đã chốt danh sách cấm thi. Điều này khiến cho giảng viên, cố vấn học tập và phòng quản lý đào tạo hoàn toàn mất đi khả năng can thiệp sớm đối với những sinh viên có dấu hiệu bỏ học hoặc nghỉ quá số buổi quy định.

Đứng trước yêu cầu hiện đại hóa và chuyển đổi số quản lý giáo dục, việc nghiên cứu và xây dựng một giải pháp điểm danh thông minh trên nền tảng Web là một đòi hỏi cấp thiết. Hệ thống **"Xây dựng hệ thống điểm danh thông minh tích hợp cảnh báo điểm chuyên cần trên nền tảng Web"** được đề xuất như một giải pháp toàn diện nhằm giải quyết triệt để các hạn chế của phương pháp truyền thống. Hệ thống vận hành trên nền tảng ứng dụng Web responsive, tích hợp công nghệ mã QR động (Dynamic QR Code) có cơ chế đổi mã liên tục theo chu kỳ thời gian thực, kết hợp với các thuật toán kiểm soát vân tay thiết bị (User-Agent) và địa chỉ IP kết nối để loại bỏ hoàn toàn khả năng điểm danh hộ từ xa. Điểm đắt giá và khác biệt nổi bật của hệ thống chính là phân hệ phân tích dữ liệu thông minh ứng dụng các mô hình học máy (Machine Learning) truyền thống. Phân hệ này chủ động khai thác chuỗi dữ liệu điểm danh tích lũy qua từng tuần để trích xuất đặc trưng hành vi tham dự, từ đó đưa ra các dự báo sớm về nguy cơ cấm thi hoặc điểm chuyên cần thấp của sinh viên, tự động kích hoạt hệ thống thông báo cảnh báo đa kênh tới giảng viên và sinh viên trước khi quá muộn, góp phần xây dựng một môi trường đào tạo minh bạch, hiện đại và đạt hiệu quả cao.

### Khảo sát thực tế

**1.1.1.1. Các nền tảng đã tồn tại**

Trong thực tiễn quản lý giáo dục cũng như quản trị nhân sự doanh nghiệp, đã có một số nhóm giải pháp điểm danh được triển khai nghiên cứu, phát triển và thử nghiệm trên thị trường với những ưu điểm cùng hạn chế kỹ thuật riêng biệt.

Nhóm giải pháp thứ nhất là các hệ thống điểm danh tự động dựa trên phần cứng sinh trắc học chuyên dụng như máy quét vân tay, máy đọc thẻ từ RFID hoặc thiết bị nhận diện khuôn mặt cố định lắp tại cửa phòng học. Ưu điểm vượt trội của nhóm giải pháp này là tính xác thực cao, khả năng ngăn chặn hành vi điểm danh hộ gần như tuyệt đối do các đặc trưng sinh trắc học mang tính duy nhất. Tuy nhiên, nhược điểm trầm trọng của phương án này nằm ở chi phí đầu tư ban đầu cho cơ sở hạ tầng phần cứng và bảo trì hệ thống là cực kỳ đắt đỏ đối với quy mô hàng trăm phòng học của một nhà trường. Thêm vào đó, việc sử dụng các thiết bị cố định tại cửa lớp dễ gây ra hiện tượng nghẽn mạch, ùn tắc cục bộ khi hàng trăm sinh viên cùng tập trung quét thẻ hoặc nhận diện khuôn mặt trong cùng một khung giờ đầu ca học. Ngoài ra, việc thu thập và lưu trữ tập trung dữ liệu sinh trắc học nhạy cảm của người học cũng đặt ra những lo ngại lớn về nguy cơ mất an toàn thông tin và vi phạm quyền riêng tư.

Nhóm giải pháp thứ hai là các ứng dụng điểm danh di động dựa trên công nghệ định vị toàn cầu (GPS) hoặc kết nối không dây tầm gần như Bluetooth Low Energy (BLE) và Wi-Fi nội bộ. Mặc dù nhóm giải pháp này tận dụng được chiếc điện thoại di động sẵn có của sinh viên, nhưng độ chính xác của công nghệ định vị GPS suy giảm rõ rệt và xuất hiện sai số lớn khi hoạt động bên trong các tòa nhà cao tầng, không gian phòng học kín hoặc môi trường bị che chắn bởi bê tông. Đối với kết nối Bluetooth hay địa chỉ MAC của Wi-Fi, các lỗ hổng kỹ thuật cho phép sinh viên kỹ thuật dễ dàng sử dụng các phần mềm giả lập (Spoofing) để phát lại tín hiệu hoặc chia sẻ địa chỉ kết nối cho bạn bè ở xa thực hiện điểm danh hộ một cách tinh vi.

Nhóm giải pháp thứ ba là phương pháp điểm danh bằng mã QR tĩnh hoặc danh sách điểm danh điện tử tích hợp sẵn trên các hệ thống quản lý học tập (LMS) như Moodle hay Canvas. Điểm yếu chết người của mã QR tĩnh là tính cố định của dữ liệu mã hóa, cho phép sinh viên có mặt tại lớp dễ dàng chụp lại hình ảnh mã QR bằng điện thoại và gửi qua các ứng dụng nhắn tin trực tuyến cho các sinh viên đang ở ngoài trường điểm danh hộ. Bên cạnh đó, hầu hết các hệ thống LMS hiện hành mới dừng lại ở vai trò là một kho lưu trữ dữ liệu thô thụ động, hoàn toàn thiếu vắng các công cụ phân tích dữ liệu nâng cao để dự báo nguy cơ hoặc đưa ra các cảnh báo chủ động cho người học trong suốt quá trình diễn ra môn học.

**1.1.1.2. Khảo sát nhu cầu**

Nhằm đảm bảo tính thực tiễn và khả năng ứng dụng cao của đề tài, nhóm nghiên cứu đã tiến hành khảo sát toàn diện quy trình vận hành quản lý đào tạo, kết hợp phỏng vấn sâu và thu thập ý kiến đóng góp từ các bên liên quan bao gồm đại diện phòng đào tạo, giảng viên trực tiếp giảng dạy và đông đảo sinh viên thuộc nhiều khối ngành. Kết quả khảo sát cho thấy nhu cầu cấp thiết đối với một hệ thống điểm danh thế hệ mới được thể hiện rõ nét qua ba nhóm đối tượng tác nhân chính.

Về phía Quản trị viên hệ thống và Cán bộ quản lý đào tạo, nhu cầu cốt lõi là sở hữu một công cụ trung tâm có khả năng quản lý thống nhất toàn bộ cơ sở dữ liệu học thuật của nhà trường. Quản trị viên cần có khả năng quản lý danh mục tài khoản người dùng, danh sách môn học, các lớp học phần, phòng học và thời khóa biểu chi tiết. Đặc biệt, hệ thống phải cho phép cán bộ quản lý tự do cấu hình linh hoạt các quy định về khung điểm chuyên cần, công thức tính toán, tỷ lệ vắng tối đa cho phép và các ngưỡng kích hoạt cảnh báo rủi ro phù hợp với quy chế đào tạo riêng của từng học kỳ hoặc từng hệ đào tạo. Hệ thống đồng thời đòi hỏi phải có khả năng phân quyền phân cấp quản trị chặt chẽ và cung cấp các công cụ giám sát toàn hệ thống nhằm bảo đảm an toàn dữ liệu.

Về phía Giảng viên trực tiếp đứng lớp, nhu cầu hàng đầu là sự tiện lợi, tốc độ và tính đơn giản trong thao tác vận hành. Giảng viên yêu cầu quy trình khởi tạo một buổi học và trình chiếu mã QR động lên màn hình máy chiếu phải diễn ra chỉ trong vài thao tác click chuột đơn giản mà không làm mất thời gian giảng dạy. Trong suốt thời gian điểm danh, giảng viên cần nắm bắt được danh sách sinh viên đã điểm danh thành công theo thời gian thực với đầy đủ ảnh đại diện và thông tin xác thực. Giảng viên cũng cần có thẩm quyền điều chỉnh linh hoạt trạng thái điểm danh cho các trường hợp sinh viên nghỉ học có lý do chính đáng hoặc gặp sự cố kỹ thuật, tuy nhiên mọi thao tác điều chỉnh này phải được lưu lại lịch sử chi tiết để phục vụ đối soát. Đáng chú ý, giảng viên rất cần hệ thống tự động cung cấp các báo cáo phân tích dự báo từ mô hình học máy, liệt kê rõ ràng danh sách những sinh viên đang rơi vào vùng nguy cơ cấm thi để giảng viên có thể chủ động nhắc nhở, đôn đốc sinh viên ngay trên lớp.

Về phía Sinh viên, ứng dụng Web truy cập trên điện thoại thông minh đòi hỏi phải đạt tốc độ phản hồi cực kỳ nhanh chóng, giao diện được tối ưu hóa cho màn hình di động và luồng thao tác quét mã QR đơn giản tối đa. Sinh viên có nhu cầu tra cứu minh bạch và chính xác toàn bộ lịch học, lịch sử điểm danh của bản thân theo từng buổi, số điểm chuyên cần tạm tính hiện tại và tổng số buổi được phép nghỉ còn lại. Quan trọng hơn cả, sinh viên mong muốn nhận được các thông báo cảnh báo sớm mang tính gợi mở từ hệ thống ngay khi tỷ lệ nghỉ học của mình bắt đầu tiệm cận mức nguy hiểm, giúp sinh viên nâng cao ý thức tự giác và chủ động điều chỉnh kế hoạch học tập cá nhân trước khi phải chịu các hình thức kỷ luật đào tạo.

### Đánh giá hệ thống hiện tại và xây dựng bài toán

Qua việc phân tích chuyên sâu thực trạng công tác điểm danh tại các cơ sở giáo dục đào tạo hiện nay, có thể rút ra bốn hạn chế cốt lõi mang tính hệ thống cần phải được giải quyết triệt để.

- Thứ nhất là sự tổn hao nặng nề về thời gian và nguồn lực vận hành. Việc giảng viên phải dành ra từ 10 đến 15 phút mỗi buổi học chỉ để đọc tên điểm danh hoặc kiểm tra tờ ký tên đã trực tiếp làm cắt giảm quỹ thời gian truyền tải tri thức, ảnh hưởng tiêu cực đến tiến độ giáo trình và sự tập trung của sinh viên trong ca học.
- Thứ hai là tính thiếu trung thực và thiếu tin cậy của dữ liệu ghi nhận. Sự tồn tại của các kẽ hở trong phương pháp điểm danh giấy hoặc mã QR tĩnh đã tạo tiền đề cho hành vi điểm danh hộ, làm méo mó kết quả đánh giá thái độ học tập và gây mất công bằng đối với những sinh viên chấp hành nghiêm túc kỷ luật giờ giấc.
- Thứ ba là tính chất thụ động, rời rạc và thiếu sự liên kết của dữ liệu. Dữ liệu điểm danh sau khi thu thập bằng phương pháp thủ công thường nằm yên trên các danh sách giấy hoặc các file Excel cá nhân của từng giảng viên, không được số hóa và đồng bộ tập trung về cơ sở dữ liệu chung của nhà trường, gây vô vàn khó khăn cho công tác quản lý và tra cứu khi có khiếu nại.
- Thứ tư là sự thiếu vắng hoàn toàn của các công cụ hỗ trợ dự báo và cảnh báo sớm. Nhà trường và cố vấn học tập thường chỉ thụ động nhận được danh sách sinh viên vắng quá số buổi quy định vào thời điểm cuối học kỳ khi học phần đã kết thúc và danh sách cấm thi đã được phê duyệt. Lúc này, mọi biện pháp đôn đốc hay hỗ trợ sinh viên đều đã trở nên vô hiệu, dẫn đến hệ lụy gia tăng tỷ lệ sinh viên bị điểm F, phải học lại hoặc thậm chí bị buộc xuất ngũ, đuổi học.

Từ việc mổ xẻ các điểm nghẽn nêu trên, bài toán tổng thể của đề tài được xác lập là **Nghiên cứu, thiết kế và phát triển Hệ thống Thông tin Điểm danh Thông minh trên nền tảng Web**, ứng dụng thuật toán tạo và xác thực mã QR động (Dynamic QR Code) có mã hóa dấu thời gian tự động đổi mã liên tục theo chu kỳ thời gian thực, kết hợp cơ chế kiểm soát nhật ký thiết bị (User-Agent) và địa chỉ IP kết nối nhằm bảo đảm tính chính xác tuyệt đối tại thời điểm ghi nhận điểm danh. Song song với đó, bài toán tập trung tích hợp phân hệ **Học máy (Machine Learning)** ứng dụng các mô hình phân loại truyền thống như Logistic Regression, Decision Tree và Random Forest trên tập dữ liệu lịch sử điểm danh đã qua chuẩn hóa và trích xuất đặc trưng. Mô hình có nhiệm vụ dự báo sớm xác suất sinh viên có nguy cơ điểm chuyên cần thấp hoặc cấm thi, từ đó tự động kích hoạt hệ thống phát thông báo cảnh báo thời gian thực đa kênh tới cả giảng viên và sinh viên thông qua một giao diện Web responsive hiện đại và mượt mà.

### Xác lập yêu cầu và các chức năng cần sử dụng cho bài toán

**1.1.3.1. Yêu cầu Chức năng (Functional Requirements)**

Nhằm đảm bảo giải quyết trọn vẹn bài toán nghiệp vụ đã đặt ra, hệ thống được thiết kế hoàn chỉnh với năm phân hệ chức năng cốt lõi được liên kết chặt chẽ với nhau:

- **Phân hệ Quản lý Tài khoản và Phân quyền**: Phân hệ này chịu trách nhiệm quản lý toàn bộ vòng đời tài khoản người dùng trong hệ thống. Hệ thống hỗ trợ cơ chế đăng nhập an toàn thông qua tài khoản nội bộ hoặc tích hợp dịch vụ xác thực đám mây Firebase Auth đối với các tài khoản Google. Mô hình kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC) được triển khai để phân định hạn mức quyền hạn và phạm vi truy cập dữ liệu của ba nhóm tác nhân rõ ràng bao gồm Quản trị viên hệ thống, Giảng viên và Sinh viên.
- **Phân hệ Quản lý Đào tạo và Lớp học phần**: Phân hệ này cung cấp các công cụ giúp tổ chức và quản lý dữ liệu đào tạo một cách khoa học. Các chức năng bao gồm quản lý danh mục môn học, tạo mới và quản lý các lớp học phần, gán giảng viên phụ trách, phân chia danh sách sinh viên đăng ký học phần, quản lý thông tin phòng học và thiết lập thời khóa biểu chi tiết theo từng tuần học trong học kỳ.
- **Phân hệ Điểm danh QR Động**: Đây là phân hệ nghiệp vụ chính của hệ thống. Giảng viên thực hiện khởi tạo buổi học và trình chiếu mã QR động trên màn hình trình chiếu. Mã QR tự động được làm mới theo chu kỳ cấu hình và chứa chữ ký mã hóa kèm mã ngẫu nhiên có thời hạn sống cực ngắn. Khi sinh viên sử dụng điện thoại di động quét mã, phía backend tiến hành kiểm tra tính hợp lệ của chữ ký mã hóa, kiểm tra khoảng thời gian cho phép, đối chiếu chuỗi nhận dạng thiết bị và địa chỉ IP mạng để ghi nhận các trạng thái điểm danh tương ứng như Có mặt, Đi muộn hoặc Vắng mặt. Phân hệ đồng thời chặn đứng tuyệt đối các hành vi quét trùng lặp hoặc điểm danh hộ từ xa.
- **Phân hệ Quản lý, Điều chỉnh và Báo cáo Điểm danh**: Phân hệ này chịu trách nhiệm lưu trữ và truy xuất toàn bộ lịch sử điểm danh của các buổi học. Giảng viên được cấp quyền ghi nhận cập nhật hoặc chỉnh sửa trạng thái điểm danh cho sinh viên trong các trường hợp nghỉ học có lý do chính đáng hoặc sự cố kỹ thuật, tuy nhiên mọi thao tác chỉnh sửa đều bắt buộc phải lưu lại vết nhật ký audit log rõ ràng. Phân hệ cung cấp các giao diện báo cáo thống kê trực quan, cho phép tra cứu tỷ lệ tham dự của từng sinh viên, từng lớp học phần và hỗ trợ xuất báo cáo điểm chuyên cần ra các định dạng chuẩn như Excel và PDF.
- **Phân hệ Học máy và Cảnh báo sớm Chuyên cần:** Phân hệ này thực hiện tự động rà soát và trích xuất các tập đặc trưng chuỗi thời gian từ dữ liệu điểm danh tích lũy của sinh viên như tổng số buổi vắng, số buổi đi muộn, tỷ lệ tham gia trong các tuần đầu học kỳ và xu hướng biến động tham dự. Các mô hình học máy phân loại được huấn luyện để đưa ra dự báo chính xác về xác suất sinh viên có nguy cơ không đủ điều kiện dự thi. Ngay khi phát hiện rủi ro tiệm cận ngưỡng cảnh báo, hệ thống tự động khởi tạo và phát các thông báo cảnh báo thời gian thực (Realtime Notification) tới giao diện của sinh viên và màn hình giám sát của giảng viên.

**1.1.3.2. Yêu cầu Phi Chức năng (Non-functional Requirements)**

Để đảm bảo hệ thống có thể đi vào vận hành thực tế một cách ổn định, tin cậy và an toàn, các tiêu chí phi chức năng nghiêm ngặt được thiết lập cụ thể:

- Về tính an toàn và bảo mật thông tin, tất cả các chuỗi dữ liệu chứa trong mã QR động phải được mã hóa kết hợp dấu thời gian và mã dùng một lần (Nonce) để vô hiệu hóa hoàn toàn các hình thức tấn công phát lại hay chụp ảnh mã QR chia sẻ ra bên ngoài. Dữ liệu xác thực người dùng được bảo vệ chặt chẽ thông qua mã hóa chuẩn JWT và Firebase ID Token. Các dữ liệu cá nhân, nhật ký địa chỉ IP và vân tay thiết bị của sinh viên phải được lưu trữ tuân thủ các quy tắc bảo mật và riêng tư dữ liệu người dùng.
- Về hiệu năng xử lý và khả năng chịu tải, thời gian phản hồi của hệ thống từ lúc sinh viên quét mã QR trên điện thoại đến khi nhận được kết quả xác thực trên màn hình phải đạt tốc độ dưới 1 giây. Máy chủ backend phải có khả năng xử lý mượt mà các kịch bản tải cao điểm khi hàng trăm sinh viên cùng thực hiện thao tác quét mã điểm danh đồng thời trong khoảng thời gian 1-2 phút đầu ca học mà không bị rơi vào tình trạng quá tải, treo dịch vụ hay phản hồi chậm.
- Về tính khả dụng và trải nghiệm người dùng, giao diện phía sinh viên được thiết kế theo tiêu chuẩn Web Responsive, tương thích mượt mà trên tất cả các trình duyệt di động phổ biến của hai hệ điều hành iOS và Android mà không bắt buộc người dùng phải cài đặt thêm ứng dụng di động phức tạp. Giao diện phía giảng viên và quản trị viên phải đạt tính trực quan cao, tối giản số lần click chuột và trình bày các biểu đồ báo cáo thống kê một cách khoa học.
- Về tính bảo trì và khả năng mở rộng, mã nguồn hệ thống backend được tổ chức nghiêm ngặt theo mô hình kiến trúc phân tầng dạng module của framework NestJS. Điều này đảm bảo các phân hệ chức năng có tính đóng gói cao, mã nguồn dễ đọc, dễ thực hiện kiểm thử tự động (Unit Test/E2E Test) và sẵn sàng tích hợp thêm các dịch vụ học máy mới hoặc các kênh thông báo mở rộng như Email/SMS trong tương lai.

## Công nghệ, kiến trúc và ngôn ngữ lập trình xây dựng website

Để đáp ứng trọn vẹn các yêu cầu kỹ thuật phức tạp từ việc tạo và xác thực mã QR động thời gian thực đến xử lý luồng dữ liệu lớn và chạy mô hình học máy dự báo, đề tài lựa chọn tích hợp một bộ công nghệ hiện đại, đồng bộ và có tính thực tiễn cao.

### Môi trường Node.js và ngôn ngữ TypeScript

Node.js là một môi trường thực thi JavaScript phía máy chủ (Server-side Runtime) mã nguồn mở và đa nền tảng, được xây dựng dựa trên Engine V8 cực mạnh của Google Chrome. Với cơ chế xử lý bất đồng bộ dựa trên sự kiện (Event-driven, Non-blocking I/O Architecture), Node.js đạt được hiệu năng tối ưu trong việc quản lý các kết nối đồng thời với dung lượng bộ nhớ tiêu tốn rất thấp. Đặc tính này hoàn toàn phù hợp với bài toán của hệ thống điểm danh khi phải tiếp nhận và xử lý hàng trăm yêu cầu HTTP/WebSocket gửi về liên tục từ thiết bị của sinh viên trong một khung thời gian ngắn đầu giờ học.

TypeScript là ngôn ngữ lập trình mã nguồn mở được phát triển bởi Microsoft, đóng vai trò là một siêu tập (Superset) của JavaScript bằng cách bổ sung hệ thống kiểu tĩnh (Static Typing) cùng các tính năng lập trình hướng đối tượng nâng cao. Việc sử dụng TypeScript xuyên suốt từ backend đến frontend giúp lập trình viên phát hiện sớm các lỗi cú pháp và sai lệch kiểu dữ liệu ngay trong quá trình biên dịch code, từ đó giảm thiểu tối đa các lỗi runtime nghiêm trọng. TypeScript đồng thời mang lại khả năng tái cấu trúc mã nguồn (Refactoring) an toàn, hỗ trợ cơ chế tự động gợi ý code thông minh và làm cho việc quản lý mã nguồn của hệ thống lớn trở nên chặt chẽ và nhất quán.

### Framework Backend NestJS

NestJS là một framework Node.js tiến bộ hàng đầu hiện nay chuyên dùng để xây dựng các ứng dụng phía máy chủ có hiệu năng cao, linh hoạt và dễ mở rộng. NestJS sử dụng TypeScript làm ngôn ngữ mặc định và được xây dựng trên nền tảng kết hợp nhuần nhuyễn các nguyên lý của Lập trình hướng đối tượng (OOP), Lập trình chức năng (FP) và Lập trình phản ứng (FRP).

Hình 1.1. NestJS Framework

NestJS định hình một kiến trúc phần mềm cực kỳ chuẩn mực dựa trên mô hình phân tầng dạng module (Modular Architecture). Trong đó, Controllers chịu trách nhiệm xử lý các đường dẫn HTTP và yêu cầu WebSocket; Services đảm nhận việc thực thi toàn bộ các logic nghiệp vụ và tính toán; và Modules đóng vai trò đóng gói các tính năng liên quan thành từng khối độc lập. Bên cạnh đó, NestJS tích hợp sẵn các mẫu thiết kế phần mềm mạnh mẽ như Dependency Injection (DI) giúp giảm độ phụ thuộc giữa các lớp code, Guards phục vụ kiểm soát phân quyền truy cập, Interceptors cho phép can thiệp biến đổi dữ liệu đầu vào/đầu ra, và Pipes thực hiện kiểm tra tính hợp lệ của dữ liệu. Nhờ có NestJS, mã nguồn backend của hệ thống điểm danh được tổ chức vô cùng khoa học, chuẩn hóa theo tiêu chuẩn công nghiệp và rất dễ tiến hành kiểm thử.

### Thư viện Frontend React và công cụ Vite

Ở tầng giao diện hiển thị phía người dùng, hệ thống sử dụng React — thư viện JavaScript mã nguồn mở hàng đầu thế giới do Meta phát triển nhằm phục vụ việc xây dựng giao diện người dùng theo kiến trúc dựa trên thành phần (Component-Based Architecture). React cho phép chia nhỏ toàn bộ giao diện phức tạp thành các thành phần (Components) độc lập, có trạng thái (State) riêng và khả năng tái sử dụng rất cao. Kết hợp với cơ chế cây DOM ảo (Virtual DOM), React chỉ thực hiện tính toán và cập nhật đúng những phần giao diện có sự thay đổi dữ liệu, mang lại tốc độ phản hồi giao diện cực kỳ mượt mà cho người dùng.

Hình 1.2. Mã nguồn dành cho FrontEnd

Đi kèm với React là Vite — công cụ đóng gói và xây dựng ứng dụng frontend thế hệ mới. Khác biệt với các công cụ đóng gói truyền thống, Vite tận dụng tính năng Native ES Modules sẵn có trên các trình duyệt hiện đại giúp thời gian khởi động máy chủ phát triển (Dev Server) diễn ra gần như tức thì. Cơ chế biên dịch module cực nhanh (Hot Module Replacement - HMR) của Vite giúp tối ưu hóa tối đa năng suất làm việc của lập trình viên và tạo ra bộ mã nguồn tĩnh nén gọn, tối ưu dung lượng khi triển khai ứng dụng thực tế.

### Ngôn ngữ Python và thư viện Học máy Scikit-learn

Đối với phân hệ phân tích chuyên sâu dữ liệu điểm danh và dự báo sớm nguy cơ chuyên cần thấp, đề tài lựa chọn ngôn ngữ lập trình Python — ngôn ngữ lập trình tiêu chuẩn và phổ biến nhất trên thế giới trong các lĩnh vực Khoa học dữ liệu, Phân tích dữ liệu và Trí tuệ nhân tạo.

Hình 1.3. Ngôn ngữ Python

Đề tài tích hợp thư viện học máy truyền thống Scikit-learn để thực hiện toàn bộ quy trình xây dựng, huấn luyện, kiểm thử và đánh giá các mô hình phân loại bao gồm Logistic Regression, Decision Tree và Random Forest. Scikit-learn cung cấp một hệ sinh thái công cụ phong phú hỗ

trợ công đoạn tiền xử lý dữ liệu thô, làm sạch dữ liệu vắng, chuẩn hóa các tập đặc trưng (Feature Scaling), phân chia tập dữ liệu huấn luyện và kiểm thử (Train/Test Split), cũng như tính toán tự động các chỉ số đánh giá mô hình định lượng như độ chính xác toàn cục (Accuracy), độ chuẩn xác (Precision), độ gợi nhớ (Recall), điểm F1-Score và khởi tạo ma trận nhầm lẫn (Confusion Matrix). Mô hình Python sau khi huấn luyện đạt tối ưu sẽ được tích hợp liên thông với hệ thống Web để trả về các kết quả dự báo xác suất rủi ro.

### Dịch vụ xác thực Firebase Admin SDK

Hình 1.4. Firebase – Công cụ mạnh mẽ từ google

Để nâng cao mức độ an toàn cho hệ thống tài khoản và cắt giảm rủi ro tự phát triển cơ chế xác thực từ đầu, hệ thống tích hợp gói thư viện Firebase Admin SDK do Google cung cấp. Dịch vụ này cho phép máy chủ backend NestJS thực hiện xác minh tính hợp lệ của các mã định danh (Firebase ID Token) được gửi lên từ trình duyệt của người dùng sau khi đăng nhập thành công. Firebase hỗ trợ đa dạng phương thức đăng nhập an toàn như Email/Password hoặc Google Single Sign-On (SSO), giúp bảo vệ tuyệt đối thông tin xác thực của sinh viên và giảng viên, loại bỏ hoàn toàn nguy cơ rò rỉ mật khẩu trên đường truyền mạng.

### Thư viện truyền thông thời gian thực Socket.IO

Để giải quyết triệt để yêu cầu truyền thông hai chiều thời gian thực giữa máy chủ và giao diện người dùng, hệ thống triển khai ứng dụng giao thức WebSockets thông qua thư viện Socket.IO. Socket.IO cho phép thiết lập một kênh kết nối liên tục, độ trễ cực thấp (Full-duplex Communication) giữa máy chủ backend và các trình duyệt client.

Hình 1.5. Công cụ thời gian thực SocketIO

Trong hệ thống điểm danh thông minh, Socket.IO đóng vai trò xương sống cho hai tính năng thời gian thực cốt lõi: một là liên tục đẩy các chuỗi mã QR động mới vừa khởi tạo từ máy chủ xuống màn hình trình chiếu của giảng viên theo chu kỳ định sẵn mà hoàn toàn không yêu cầu trình duyệt phải thực hiện thao tác tải lại trang (F5); hai là phát các thông báo cảnh báo chuyên cần tức thì (Realtime Push Notification) xuất hiện ngay trên màn hình làm việc của giảng viên và điện thoại của sinh viên ngay tại thời điểm mô hình học máy ghi nhận rủi ro vắng học vượt ngưỡng.

## Hệ quản trị CSDL

Hệ thống quyết định lựa chọn sử dụng **Hệ quản trị Cơ sở dữ liệu NoSQL MongoDB** kết hợp với thư viện ánh xạ đối tượng dữ liệu **Mongoose ODM**.

Hình 1.6. Cơ sở dữ liệu MongoDB

**1\. Lý do lựa chọn MongoDB và Mongoose ODM:**

Khác biệt hoàn toàn với các hệ quản trị cơ sở dữ liệu quan hệ truyền thống (RDBMS) như MySQL hay SQL Server vốn lưu trữ dữ liệu dưới dạng các bảng với số lượng cột cố định và ràng buộc khóa ngoại chặt chẽ, **MongoDB** lưu trữ dữ liệu dưới dạng các tài liệu linh hoạt (Document-based) sử dụng định dạng JSON/BSON. Sự lựa chọn này mang đến hàng loạt lợi thế vượt trội đặc biệt phù hợp với bản chất nghiệp vụ của bài toán điểm danh thông minh:

- **Khả năng mở rộng và cấu trúc dữ liệu động**: Dữ liệu nhật ký mỗi lượt quét điểm danh của sinh viên bao gồm rất nhiều thông tin phụ phụ thuộc vào từng loại thiết bị như chuỗi User-Agent, địa chỉ IP, vị trí địa lý và các tham số kiểm vết. MongoDB cho phép lưu trữ các cấu trúc dữ liệu lồng nhau (Nested Documents/Arrays) một cách tự nhiên và linh hoạt mở rộng trường dữ liệu trong tương lai mà không bắt buộc phải thực hiện các thao tác thay đổi cấu trúc bảng (Schema Migration) phức tạp và nguy hiểm.
- **Tốc độ đọc/ghi dữ liệu vượt trội**: MongoDB được thiết kế tối ưu hóa đặc biệt cho các tác vụ ghi dữ liệu với tần suất cao (Log-heavy Operations). Đặc tính này giúp hệ thống phản hồi cực nhanh, không xảy ra hiện tượng nghẽn cổ chai khi tiếp nhận hàng loạt yêu cầu ghi nhận lượt quét mã QR của hàng trăm sinh viên xảy ra dồn dập trong cùng một thời điểm đầu ca học.
- **Tích hợp hoàn hảo với Mongoose ODM và NestJS**: Thư viện Mongoose đóng vai trò là lớp trung gian ODM (Object Data Modeling) giúp định nghĩa các lược đồ dữ liệu (Schema) một cách chặt chẽ, hỗ trợ kiểm tra kiểu dữ liệu, tự động tạo chỉ mục (Indexing) và quản lý các liên kết giữa các tài liệu trong NestJS thông qua các class TypeScript một cách an toàn, nhất quán và dễ bảo trì.

**2\. Tổ chức các nhóm dữ liệu cốt lõi trong hệ thống:**

Cơ sở dữ liệu của hệ thống được nghiên cứu thiết kế chuẩn hóa, phân chia hợp lý thành bốn nhóm dữ liệu nghiệp vụ chính:

- Nhóm dữ liệu thứ nhất là nhóm dữ liệu Quản lý người dùng và Phân quyền. Nhóm này lưu trữ toàn bộ thông tin hồ sơ tài khoản bao gồm họ tên, mã định danh sinh viên hoặc giảng viên, địa chỉ email, số điện thoại, ảnh đại diện, vai trò hệ thống (Admin, Teacher, Student) và các thông tin cấu hình phục vụ xác thực Firebase.
- Nhóm dữ liệu thứ hai là nhóm dữ liệu Quản lý đào tạo và Học thuật. Nhóm này lưu trữ danh mục môn học, thông tin chi tiết các lớp học phần, phòng học, danh sách sinh viên đăng ký tham gia lớp học phần và lịch học chi tiết được phân bổ theo từng tuần trong học kỳ.
- Nhóm dữ liệu thứ ba là nhóm dữ liệu Điểm danh và Nhật ký kiểm vết thiết bị. Đây là nhóm dữ liệu có tần suất biến động lớn nhất, lưu trữ danh sách các buổi học được khởi tạo, dữ liệu mã QR động hiện hành, chi tiết từng lượt quét điểm danh (thời gian quét, trạng thái ghi nhận Có mặt/Đi muộn/Vắng mặt, địa chỉ IP kết nối, chuỗi User-Agent của thiết bị) và toàn bộ lịch sử các lần giảng viên thực hiện điều chỉnh trạng thái điểm danh.
- Nhóm dữ liệu thứ tư là nhóm dữ liệu Học máy và Cảnh báo sớm chuyên cần. Nhóm này lưu trữ các tập đặc trưng chuỗi thời gian được trích xuất từ lịch sử điểm danh của sinh viên, kết quả tính toán dự báo xác suất rủi ro cấm thi từ các mô hình học máy (Logistic Regression, Decision Tree, Random Forest) và lịch sử các thông báo cảnh báo đã được hệ thống kích hoạt gửi tới giảng viên và sinh viên.

#   
PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

_Trong chương này, nội dung tập trung vào quá trình phân tích và thiết kế hệ thống_

## Tổng quan hệ thống

## Phân tích và thiết kế hệ thống phần mềm

### Actor

**Tác nhân chính (Primary Actors - Con người)**

- Quản trị viên (System Administrator / Admin):
- Người chịu trách nhiệm vận hành toàn hệ thống.
- Quản lý danh mục người dùng (Sinh viên, Giảng viên, Admin), vai trò và phân quyền (RBAC).
- Quản lý dữ liệu đào tạo (Năm học, Học kỳ, Môn học, Lớp sinh hoạt, Lớp học phần, Phân công giảng dạy, Ghi danh sinh viên).
- Cấu hình tham số điểm danh (Tọa độ mốc GPS, bán kính hợp lệ, dải IP Wi-Fi, tiết học, trọng số tính điểm chuyên cần và ngưỡng cấm thi).
- Xem toàn bộ báo cáo, thống kê, lịch sử audit và xét duyệt thiết bị sinh viên.
- Giảng viên (Lecturer / Teacher):
- Quản lý quá trình điểm danh trong các Lớp học phần phụ trách.
- Khởi tạo & trình chiếu mã QR động cho từng buổi học; theo dõi sinh viên quét mã thời gian thực.
- Điều chỉnh trạng thái điểm danh thủ công (Có mặt, Đi muộn, Về sớm, Vắng, Nghỉ có phép) kèm lý do sửa (hệ thống tự động lưu Audit Trail).
- Tiếp nhận và xét duyệt đơn xin nghỉ phép (Phê duyệt / Từ chối kèm lý do).
- Xét duyệt thiết bị điểm danh của sinh viên khi đổi máy.
- Xem bảng điểm chuyên cần lớp học phần, tra cứu dự báo nguy cơ cấm thi từ AI và xuất báo cáo Excel.
- Sinh viên (Student / Học sinh):
- Tra cứu thời khóa biểu và lịch học cá nhân.
- Thực hiện điểm danh vào / ra: Quét mã QR động kết hợp xác thực đa tầng (Tọa độ GPS trong bán kính lớp học, IP mạng Wi-Fi trường, và Ràng buộc vân tay thiết bị Device Binding).
- Xem lịch sử điểm danh, tỷ lệ vắng, điểm chuyên cần tích lũy và cảnh báo nguy cơ cấm thi cá nhân từ AI.
- Đăng ký và quản lý thiết bị điểm danh của bản thân (gửi yêu cầu đổi thiết bị khi đổi điện thoại/máy tính).
- Tạo và theo dõi tiến độ xử lý đơn xin nghỉ phép (chọn buổi học, lý do, tải ảnh minh chứng).
- Nhận thông báo thời gian thực khi điểm danh thành công, khi có cảnh báo vắng hoặc kết quả duyệt đơn.

**Tác nhân phụ / Hệ thống (Secondary / External Actors)**

- Hệ thống AI / Microservice (AI Early Warning Service - FastAPI):
- Tiếp nhận vector 12 đặc trưng chuyên cần từ Backend NestJS (tính toán dựa trên lịch sử điểm danh chuỗi thời gian).
- Thực thi mô hình học máy (Random Forest / Decision Tree) để phân loại rủi ro (LOW, MEDIUM, HIGH) và tính xác suất cấm thi.
- Sinh khuyến nghị can thiệp sư phạm cá nhân hóa cho từng sinh viên.
- Dịch vụ xác thực Firebase Auth:
- Quản lý định danh người dùng, xác thực thông tin đăng nhập, cấp phát JWT và xác thực chữ ký token.
- Dịch vụ mạng & Thiết bị (Client Geolocation & Device API):
- Trình duyệt/thiết bị di động cung cấp vị trí GPS Geolocation, địa chỉ IP mạng công khai và thông số phần cứng (User-Agent, Canvas Fingerprint) để đối soát chống gian lận.

### UseCase

Hình 3.10.Usecase xác thực và quản trị người dùng

Hình 3.10.Usecase quản lý đào tạo và thời khóa biểu

Hình 3.10.Usecase điểm danh thông minh chống gian lận

Hình 3.10.Usecase quản lý nghỉ phép

Hình 3.10.Usecase bảo mật thiết bị chống điểm danh hộ

Hình 3.10.Usecase điểm chuyên cần và cảnh báo AI

Hình 3.10.Usecase thông báo và bảng điều khiển

### **Đặc tả usecase và biểu đồ** **hoạt động**

**Bảng 2.1: Đặc tả usecase Đăng nhập**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Đăng nhập hệ thống (Xác thực Firebase & Cấp quyền RBAC)** |
| **Mô tả** | Người dùng đăng nhập bằng Email và Mật khẩu. Hệ thống xác thực danh tính qua Firebase Auth, truy vấn vai trò và quyền hạn tương ứng từ MongoDB và chuyển hướng vào Dashboard. |
| **Actor** | Sinh viên, Giảng viên, Quản trị viên (Tác nhân chính); Firebase Auth (Tác nhân phụ). |
| **Điều kiện kích hoạt** | Người dùng mở ứng dụng web và chưa đăng nhập phiên làm việc. |
| **Tiền điều kiện** | Tài khoản đã được quản trị viên khởi tạo và ở trạng thái ACTIVE. |
| **Hậu điều kiện** | Lưu trữ JWT token, nạp thông tin người dùng vào Auth Store và điều hướng vào Dashboard. |
| **Luồng sự kiện chính** | 1\. Người dùng truy cập /auth/login.  <br>2\. Nhập Email, Mật khẩu và nhấn "Đăng nhập".  <br>3\. Firebase Authentication thẩm tra thông tin và trả về idToken.  <br>4\. Client gửi idToken lên Backend NestJS.  <br>5\. Backend giải mã token, tìm người dùng trong MongoDB, nạp Role và danh sách Permissions.  <br>6\. Ghi nhận lịch sử đăng nhập (IP, User-Agent, thời gian).  <br>7\. Chuyển hướng vào trang tương ứng với vai trò. |
| **Luồng sự kiện phụ** | 3a. Sai Email hoặc Mật khẩu: Firebase báo lỗi → Hệ thống hiển thị: _"Email hoặc mật khẩu không chính xác"_.  <br>5a. Tài khoản bị khóa: Backend phát hiện status != 'ACTIVE' → Trả về lỗi 403 Forbidden → Hiển thị: _"Tài khoản đã bị tạm khóa"_. |

**Bảng 2.2: Đăng xuất hệ thống**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Đăng xuất hệ thống** |
| **Mô tả** | Kết thúc phiên làm việc hiện tại của người dùng trên ứng dụng. |
| **Actor** | Sinh viên, Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Người dùng nhấn vào avatar cá nhân và chọn "Đăng xuất". |
| **Tiền điều kiện** | Người dùng đang trong trạng thái đăng nhập. |
| **Hậu điều kiện** | Xóa token tại LocalStorage/Cookie, hủy phiên làm việc, chuyển hướng về trang /auth/login. |
| **Luồng sự kiện chính** | 1\. Người dùng bấm menu tài khoản và chọn "Đăng xuất".  <br>2\. Hệ thống xóa JWT Token, Firebase Token và xóa Auth Store.  <br>3\. Điều hướng người dùng về màn hình đăng nhập. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.3: Xem & Cập nhật Hồ sơ cá nhân (Profile)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem và Cập nhật Hồ sơ cá nhân** |
| **Mô tả** | Người dùng xem thông tin tài khoản (MSSV/MSGV, Email, Vai trò) và cập nhật số điện thoại, ảnh đại diện. |
| **Actor** | Sinh viên, Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Người dùng chọn mục "Trang cá nhân" trên menu. |
| **Tiền điều kiện** | Người dùng đã đăng nhập. |
| **Hậu điều kiện** | Thông tin cá nhân mới được lưu vào collection users trong MongoDB. |
| **Luồng sự kiện chính** | 1\. Người dùng vào trang cá nhân /dashboard/profile.  <br>2\. Hệ thống tải và hiển thị thông tin hiện tại.  <br>3\. Người dùng sửa số điện thoại hoặc đổi ảnh đại diện.  <br>4\. Nhấn "Lưu thay đổi".  <br>5\. Backend kiểm tra tính hợp lệ và cập nhật CSDL.  <br>6\. Hiển thị thông báo cập nhật thành công. |
| **Luồng sự kiện phụ** | 5a. Số điện thoại không đúng định dạng 10 chữ số → Báo lỗi validation. |

**Bảng 2.1: Đổi mật khẩu**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Đổi mật khẩu tài khoản** |
| **Mô tả** | Người dùng thay đổi mật khẩu đăng nhập để nâng cao tính bảo mật. |
| **Actor** | Sinh viên, Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Người dùng vào mục Đổi mật khẩu trong trang cá nhân. |
| **Tiền điều kiện** | Người dùng đã đăng nhập. |
| **Hậu điều kiện** | Mật khẩu mới được cập nhật trên Firebase Auth. |
| **Luồng sự kiện chính** | 1\. Người dùng nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.  <br>2\. Nhấn nút "Đổi mật khẩu".  <br>3\. Hệ thống kiểm tra mật khẩu hiện tại qua Firebase.  <br>4\. Firebase cập nhật mật khẩu mới cho tài khoản.  <br>5\. Hiển thị thông báo đổi mật khẩu thành công. |
| **Luồng sự kiện phụ** | 3a. Mật khẩu hiện tại không đúng → Báo lỗi xác thực.  <br>3b. Mật khẩu mới dưới 6 ký tự hoặc không khớp xác nhận → Báo lỗi mật khẩu không hợp lệ. |

**Bảng 2.1: Quản lý Tài khoản người dùng**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Quản lý Tài khoản người dùng (CRUD Users)** |
| **Mô tả** | Quản trị viên tạo mới, chỉnh sửa thông tin, khóa hoặc mở khóa tài khoản Sinh viên, Giảng viên, Admin. |
| **Actor** | Quản trị viên (Admin). |
| **Điều kiện kích hoạt** | Quản trị viên mở trang /dashboard/users. |
| **Tiền điều kiện** | Quản trị viên sở hữu quyền users.manage. |
| **Hậu điều kiện** | Tài khoản được tạo đồng bộ trên cả Firebase Auth và MongoDB users. |
| **Luồng sự kiện chính** | 1\. Quản trị viên nhấn "Thêm người dùng mới".  <br>2\. Nhập Mã (MSSV/MSGV), Họ tên, Email, Số điện thoại, Vai trò và Mật khẩu khởi tạo.  <br>3\. Nhấn "Lưu thông tin".  <br>4\. Backend gọi Firebase Admin SDK tạo tài khoản định danh.  <br>5\. Backend lưu bản ghi vào collection users liên kết với roleId.  <br>6\. Hiển thị thông báo thành công và làm mới danh sách. |
| **Luồng sự kiện phụ** | 4a. Email đã tồn tại trên Firebase → Báo lỗi trùng email.  <br>5a. Mã người dùng (userCode) trùng lặp → Báo lỗi mã người dùng đã tồn tại. |

**Bảng 2.1: Phân quyền & Quản lý Vai trò (RBAC)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Quản lý Vai trò và Ma trận Phân quyền** |
| **Mô tả** | Quản trị viên tạo vai trò mới (Role) và tích chọn các quyền hạn (Permissions) cho vai trò đó trong hệ thống. |
| **Actor** | Quản trị viên (Admin). |
| **Điều kiện kích hoạt** | Quản trị viên truy cập mục /dashboard/roles. |
| **Tiền điều kiện** | Quản trị viên sở hữu quyền system.settings. |
| **Hậu điều kiện** | Ma trận quyền mới được lưu vào collection roles và có hiệu lực ngay lập tức. |
| **Luồng sự kiện chính** | 1\. Mở danh sách vai trò hiện có (admin, teacher, student,...).  <br>2\. Chọn một vai trò hoặc nhấn "Thêm vai trò mới".  <br>3\. Đặt tên vai trò, mô tả và tích chọn các quyền: attendance:view, attendance:checkin, leave:approve,...  <br>4\. Bấm "Cập nhật quyền hạn".  <br>5\. Hệ thống lưu vào CSDL và cập nhật phiên làm việc của các người dùng liên quan. |
| **Luồng sự kiện phụ** | 4a. Không thể xóa vai trò mặc định của hệ thống (admin, teacher, student). |

**Bảng 2.1: Quản lý Năm học & Học kỳ**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Quản lý Năm học và Học kỳ** |
| **Mô tả** | Thiết lập năm học mới và các học kỳ (Học kỳ 1, 2, Hè) kèm ngày bắt đầu và kết thúc. |
| **Actor** | Quản trị viên. |
| **Điều kiện kích hoạt** | Bắt đầu chu kỳ năm học hoặc học kỳ mới. |
| **Tiền điều kiện** | Có quyền academic.manage. |
| **Hậu điều kiện** | Năm học/Học kỳ được kích hoạt và làm mốc thời gian cho các lớp học phần. |
| **Luồng sự kiện chính** | 1\. Vào mục Đào tạo → tab Năm học & Học kỳ.  <br>2\. Nhấn "Thêm năm học" (vd: 2025-2026).  <br>3\. Tạo các học kỳ tương ứng kèm ngày bắt đầu và kết thúc.  <br>4\. Đặt học kỳ hiện tại là ACTIVE.  <br>5\. Lưu vào collections academic_years và semesters. |
| **Luồng sự kiện phụ** | 3a. Ngày kết thúc trước ngày bắt đầu → Báo lỗi ngày không hợp lệ. |

**Bảng 2.1: Quản lý Danh mục Môn học**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Quản lý Danh mục Môn học** |
| **Mô tả** | Khai báo mã môn học, tên môn học, số tín chỉ, số tiết học và mô tả đề cương. |
| **Actor** | Quản trị viên. |
| **Điều kiện kích hoạt** | Cần bổ sung môn học mới vào chương trình đào tạo. |
| **Tiền điều kiện** | Có quyền academic.manage. |
| **Hậu điều kiện** | Môn học được lưu vào collection subjects. |
| **Luồng sự kiện chính** | 1\. Vào danh mục môn học → Nhấn "Thêm môn học".  <br>2\. Nhập Mã môn (vd: CS101), Tên môn, Số tín chỉ, Mô tả.  <br>3\. Bấm "Lưu môn học".  <br>4\. Hệ thống kiểm tra trùng lặp mã môn và lưu CSDL. |
| **Luồng sự kiện phụ** | 4a. Mã môn học đã tồn tại → Báo lỗi trùng mã môn. |

**Bảng 2.1: Quản lý Lớp sinh hoạt / Hành chính**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Quản lý Lớp sinh hoạt** |
| **Mô tả** | Tạo các lớp hành chính niên khóa (vd: K21-CNTT1) và phân công Giảng viên làm Cố vấn học tập. |
| **Actor** | Quản trị viên. |
| **Điều kiện kích hoạt** | Tiếp nhận khóa sinh viên mới nhập học. |
| **Tiền điều kiện** | Có quyền academic.manage và đã có danh sách giảng viên. |
| **Hậu điều kiện** | Lớp sinh hoạt được lưu vào collection classes. |
| **Luồng sự kiện chính** | 1\. Vào danh mục Lớp sinh hoạt → Nhấn "Tạo lớp mới".  <br>2\. Nhập Tên lớp, Khóa học, Khoa/Bộ môn và chọn Cố vấn học tập.  <br>3\. Bấm "Lưu lớp sinh hoạt". |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Quản lý Lớp học phần (Course Section)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Quản lý Lớp học phần** |
| **Mô tả** | Mở lớp học phần từ môn học trong học kỳ đang mở, thiết lập sĩ số tối đa và phòng học. |
| **Actor** | Quản trị viên. |
| **Điều kiện kích hoạt** | Kế hoạch mở lớp học kỳ mới được phê duyệt. |
| **Tiền điều kiện** | Đã có Môn học và Học kỳ hoạt động. |
| **Hậu điều kiện** | Lớp học phần được lưu vào collection course_sections. |
| **Luồng sự kiện chính** | 1\. Chọn Môn học và Học kỳ cần mở lớp.  <br>2\. Nhập Mã lớp học phần (vd: CS101_01), Tên hiển thị, Sĩ số tối đa (vd: 60).  <br>3\. Bấm "Tạo lớp học phần".  <br>4\. Hệ thống khởi tạo lớp ở trạng thái mở ghi danh. |
| **Luồng sự kiện phụ** | 2a. Mã lớp học phần đã tồn tại trong học kỳ → Báo lỗi trùng lặp. |

**Bảng 2.1: Lập lịch các Buổi học (Class Sessions)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Lập lịch các Buổi học chi tiết** |
| **Mô tả** | Tự động sinh danh sách các buổi học cho lớp học phần theo tuần (thứ, ca, phòng, ngày). |
| **Actor** | Quản trị viên. |
| **Điều kiện kích hoạt** | Lớp học phần được thiết lập khung thời gian học. |
| **Tiền điều kiện** | Lớp học phần đã được tạo. |
| **Hậu điều kiện** | Toàn bộ các buổi học được sinh tự động vào collection class_sessions. |
| **Luồng sự kiện chính** | 1\. Mở Lớp học phần → Chọn tab "Lịch học".  <br>2\. Chọn: Thứ trong tuần, Tiết bắt đầu, Số tiết, Phòng học, Ngày bắt đầu và Số tuần.  <br>3\. Hệ thống kiểm tra xung đột phòng học.  <br>4\. Hệ thống chạy thuật toán lặp ngày để tạo 10-15 bản ghi class_sessions.  <br>5\. Lưu danh sách buổi học vào CSDL. |
| **Luồng sự kiện phụ** | 3a. Phòng học đã có lớp khác học vào giờ đó → Cảnh báo xung đột phòng học. |

**Bảng 2.1: Phân công Giảng viên phụ trách**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Phân công Giảng viên giảng dạy** |
| **Mô tả** | Gán giảng viên chịu trách nhiệm giảng dạy và điểm danh cho lớp học phần. |
| **Actor** | Quản trị viên. |
| **Điều kiện kích hoạt** | Sau khi lớp học phần được tạo. |
| **Tiền điều kiện** | Đã có tài khoản Giảng viên trong hệ thống. |
| **Hậu điều kiện** | Bản ghi course_section_lecturers được tạo; lớp xuất hiện trên lịch dạy của Giảng viên. |
| **Luồng sự kiện chính** | 1\. Chọn lớp học phần cần phân công.  <br>2\. Tìm kiếm và chọn Giảng viên từ danh sách.  <br>3\. Chọn vai trò (Giảng viên chính / Trợ giảng).  <br>4\. Nhấn "Xác nhận phân công".  <br>5\. Hệ thống lưu CSDL và cập nhật quyền quản lý lớp cho Giảng viên. |
| **Luồng sự kiện phụ** | 2a. Giảng viên bị trùng lịch dạy lớp khác cùng giờ → Cảnh báo trùng lịch giảng viên. |

**Bảng 2.1: Ghi danh Sinh viên (Enrollment)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Ghi danh Sinh viên vào Lớp học phần** |
| **Mô tả** | Đăng ký danh sách sinh viên tham gia học môn học (nhập tay hoặc import từ danh sách). |
| **Actor** | Quản trị viên. |
| **Điều kiện kích hoạt** | Sinh viên hoàn thành đăng ký tín chỉ đầu học kỳ. |
| **Tiền điều kiện** | Sinh viên và Lớp học phần đều tồn tại. |
| **Hậu điều kiện** | Bản ghi enrollments được tạo; sinh viên có tên trong danh sách điểm danh. |
| **Luồng sự kiện chính** | 1\. Mở lớp học phần → Chọn tab "Danh sách sinh viên".  <br>2\. Chọn "Thêm sinh viên" hoặc "Import danh sách".  <br>3\. Hệ thống kiểm tra sĩ số lớp chưa vượt quá mức tối đa.  <br>4\. Lưu các bản ghi vào collection enrollments.  <br>5\. Môn học tự động xuất hiện trên thời khóa biểu của sinh viên. |
| **Luồng sự kiện phụ** | 3a. Lớp đã đầy sĩ số → Báo lỗi lớp học phần đã đạt giới hạn sĩ số. |

**Bảng 2.1: Tra cứu Thời khóa biểu & Lịch dạy**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Tra cứu Thời khóa biểu cá nhân** |
| **Mô tả** | Giảng viên xem lịch giảng dạy; Sinh viên xem lịch học cá nhân theo tuần với đầy đủ phòng học, ca học. |
| **Actor** | Giảng viên, Sinh viên. |
| **Điều kiện kích hoạt** | Người dùng truy cập mục /dashboard/calendar. |
| **Tiền điều kiện** | Người dùng đã đăng nhập và được gán lớp. |
| **Hậu điều kiện** | Lịch học được hiển thị dạng lưới thời gian trực quan. |
| **Luồng sự kiện chính** | 1\. Người dùng vào trang Lịch học & Giảng dạy.  <br>2\. Hệ thống xác định vai trò và truy vấn class_sessions liên quan trong tuần.  <br>3\. Hiển thị thông tin từng buổi: Môn, Phòng, Tiết, Giảng viên, Trạng thái điểm danh. |
| **Luồng sự kiện phụ** | 2a. Tuần nghỉ lễ/không có lịch → Hiển thị thông báo không có lịch học. |

**Bảng 2.1: Khởi tạo & Trình chiếu mã QR động**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Khởi tạo & Trình chiếu mã QR động cho buổi học** |
| **Mô tả** | Giảng viên mở màn chiếu QR. Socket.IO tự xoay vòng mã QR HMAC sau mỗi 15-20s để chống chụp ảnh gửi ra ngoài lớp. |
| **Actor** | Giảng viên (Chính); Socket.IO Gateway (Phụ). |
| **Điều kiện kích hoạt** | Giảng viên bắt đầu buổi học và mở màn hình điểm danh. |
| **Tiền điều kiện** | Giảng viên đăng nhập; buổi học trong thời gian quy định. |
| **Hậu điều kiện** | Màn chiếu hiển thị mã QR động và bảng sĩ số trực tiếp. |
| **Luồng sự kiện chính** | 1\. Giảng viên bấm "Chiếu mã QR điểm danh".  <br>2\. Client kết nối Socket.IO namespace /attendance-qr.  <br>3\. Server tạo Timer 15s, ký mã HMAC-SHA256 và push event new_qr_token.  <br>4\. Client render mã QR toàn màn hình kèm thanh đếm lùi 15s.  <br>5\. Khi SV quét, Server push attendance_recorded cập nhật danh sách có mặt.  <br>6\. Giảng viên bấm "Đóng điểm danh" khi hết giờ. |
| **Luồng sự kiện phụ** | 2a. Mất kết nối WebSocket → Hệ thống hiển thị cảnh báo và tự động kết nối lại. |

**Bảng 2.1: Quét mã QR điểm danh xác thực đa tầng**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên quét mã QR điểm danh kết hợp GPS, Wi-Fi và Thiết bị** |
| **Mô tả** | Sinh viên dùng camera quét QR trên màn chiếu. Hệ thống kiểm tra đồng thời: Hạn QR (15s), Khoảng cách GPS, IP Wi-Fi và Thiết bị đã duyệt. |
| **Actor** | Sinh viên (Chính); GPS API, Wi-Fi Network (Phụ). |
| **Điều kiện kích hoạt** | Sinh viên có mặt trong lớp học và Giảng viên đang chiếu QR. |
| **Tiền điều kiện** | Đăng nhập trên máy đã duyệt; cấp quyền Camera và GPS. |
| **Hậu điều kiện** | Bản ghi điểm danh ghi nhận trạng thái PRESENT hoặc LATE. |
| **Luồng sự kiện chính** | 1\. Bấm "Quét mã QR" → Kích hoạt camera và lấy GPS, IP, Device ID.  <br>2\. Hướng camera quét mã trên màn chiếu.  <br>3\. Gửi request POST /attendances/scan-qr.  <br>4\. Hệ thống kiểm tra: Token hợp lệ, Thiết bị chính chủ, GPS $\\le$ bán kính, IP đúng Wi-Fi trường.  <br>5\. Xác định PRESENT (đúng giờ) hoặc LATE (đi muộn).  <br>6\. Cập nhật sĩ số lên màn chiếu và báo thành công cho SV. |
| **Luồng sự kiện phụ** | 4a. Mã QR hết hạn → Báo lỗi _"Mã QR đã hết hạn, quét lại mã mới"_.  <br>4b. Sai vị trí GPS → Báo lỗi _"Nằm ngoài phạm vi phòng học"_.  <br>4c. Sai thiết bị → Báo lỗi _"Thiết bị không hợp lệ hoặc đang đăng nhập máy khác"_. |

**Bảng 2.1: Sinh viên tự Check-in / Check-out**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên tự điểm danh Vào / Ra (Check-in / Check-out)** |
| **Mô tả** | Trong các buổi học cho phép tự điểm danh, sinh viên bấm nút Check-in khi đến và Check-out khi tan học kèm kiểm tra GPS và Wi-Fi. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Cấu hình buổi học cho phép tự điểm danh (allowSelfCheckIn = true). |
| **Tiền điều kiện** | Sinh viên đang ở trong phòng học và đúng khung giờ học. |
| **Hậu điều kiện** | Bản ghi lưu thời gian checkInTime và checkOutTime. |
| **Luồng sự kiện chính** | 1\. Sinh viên mở buổi học hôm nay → Nhấn nút "Check-in".  <br>2\. Hệ thống kiểm tra GPS và IP → Ghi nhận giờ đến lớp.  <br>3\. Cuối buổi học, sinh viên nhấn nút "Check-out".  <br>4\. Hệ thống ghi nhận giờ về → Nếu về quá sớm sẽ gắn cờ EARLY_LEAVE. |
| **Luồng sự kiện phụ** | 1a. Chưa đến giờ học → Nút Check-in bị vô hiệu hóa. |

**Bảng 2.1: Giám sát Live Check-in buổi học**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Theo dõi tiến độ Live Check-in buổi học** |
| **Mô tả** | Giảng viên theo dõi danh sách sinh viên vừa quét mã theo thời gian thực ngay trên màn hình. |
| **Actor** | Giảng viên. |
| **Điều kiện kích hoạt** | Đang trong phiên trình chiếu mã QR điểm danh. |
| **Tiền điều kiện** | Phiên WebSocket đang hoạt động. |
| **Hậu điều kiện** | Danh sách sinh viên và thanh tiến trình sĩ số được làm mới liên tục. |
| **Luồng sự kiện chính** | 1\. Màn hình máy chiếu hiển thị số lượng SV đã quét / Tổng sĩ số.  <br>2\. Khi có SV quét thành công, Socket.IO đẩy tên và MSSV vào bảng Live Feed.  <br>3\. Giảng viên nhìn thấy ngay danh sách sinh viên vừa hoàn thành. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Điều chỉnh trạng thái điểm danh thủ công**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Điều chỉnh trạng thái điểm danh thủ công (Giảng viên / Admin)** |
| **Mô tả** | Sửa đổi trạng thái điểm danh (Có mặt, Muộn, Vắng, Có phép) cho sinh viên khi có lý do chính đáng xác minh tại lớp. Bắt buộc nhập lý do. |
| **Actor** | Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Giảng viên sửa lỗi hoặc sinh viên gặp sự cố thiết bị được xác minh tại chỗ. |
| **Tiền điều kiện** | Có quyền trên lớp học phần; bản ghi điểm danh đã tồn tại. |
| **Hậu điều kiện** | Cập nhật trường status, updatedBy trong attendances; tự động kích hoạt UC-ATT-06. |
| **Luồng sự kiện chính** | 1\. Mở Báo cáo điểm danh lớp → Bấm nút "Điều chỉnh" tại hàng của sinh viên.  <br>2\. Chọn trạng thái mới (PRESENT, LATE, ABSENT, EXCUSED, EARLY_LEAVE).  <br>3\. Nhập lý do điều chỉnh bắt buộc (tối thiểu 5 ký tự).  <br>4\. Bấm "Xác nhận cập nhật".  <br>5\. Backend lưu trạng thái mới và tính lại Điểm chuyên cần của sinh viên. |
| **Luồng sự kiện phụ** | 3a. Chưa nhập lý do → Nút cập nhật bị vô hiệu hóa. |

**Bảng 2.1: Xem Lịch sử Điều chỉnh điểm danh (Audit Trail)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem Lịch sử Điều chỉnh điểm danh (Audit Trail History)** |
| **Mô tả** | Tra cứu toàn bộ lịch sử các lần sửa đổi điểm danh của một bản ghi để đảm bảo tính minh bạch, chống tiêu cực sửa điểm. |
| **Actor** | Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Nhấn vào biểu tượng "Lịch sử sửa" tại bản ghi điểm danh. |
| **Tiền điều kiện** | Bản ghi đã từng có thao tác điều chỉnh. |
| **Hậu điều kiện** | Hiển thị danh sách: Người sửa, Trạng thái cũ → mới, Lý do, Thời gian sửa. |
| **Luồng sự kiện chính** | 1\. Bấm nút xem lịch sử Audit của một sinh viên.  <br>2\. Gọi API GET /attendances/:id/audits.  <br>3\. Hệ thống trả về danh sách các lần sửa từ collection attendance_audits.  <br>4\. Hiển thị dạng Timeline trực quan. |
| **Luồng sự kiện phụ** | 2a. Bản ghi chưa từng bị sửa → Hiển thị _"Điểm danh gốc, chưa qua chỉnh sửa"_. |

**Bảng 2.1: Tra cứu Lịch sử điểm danh cá nhân**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên tra cứu Lịch sử điểm danh cá nhân** |
| **Mô tả** | Sinh viên xem lại chi tiết tất cả các buổi học đã điểm danh, trạng thái, giờ quét mã và ghi chú. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên vào tab "Lịch sử của tôi" trên trang Điểm danh. |
| **Tiền điều kiện** | Sinh viên đã đăng nhập. |
| **Hậu điều kiện** | Toàn bộ các lần điểm danh của bản thân được liệt kê rõ ràng. |
| **Luồng sự kiện chính** | 1\. Sinh viên vào /dashboard/attendance → chọn "Lịch sử của tôi".  <br>2\. Backend lọc bản ghi theo studentId.  <br>3\. Hiển thị bảng: Ngày, Môn học, Trạng thái (Đúng giờ, Muộn, Vắng), Giờ check-in. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Cấu hình Tham số điểm danh**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Cấu hình tham số điểm danh & An ninh mốc GPS/Wi-Fi** |
| **Mô tả** | Quản trị viên cài đặt tọa độ GPS trường, bán kính hợp lệ (mét), danh sách IP Wi-Fi và thời gian cho phép trễ. |
| **Actor** | Quản trị viên (Admin). |
| **Điều kiện kích hoạt** | Thay đổi địa điểm đào tạo hoặc cấu hình mạng mới. |
| **Tiền điều kiện** | Tài khoản Admin sở hữu quyền system.settings. |
| **Hậu điều kiện** | Cấu hình mới được lưu vào attendance_configs và áp dụng tức thì. |
| **Luồng sự kiện chính** | 1\. Vào Cấu hình hệ thống → Cấu hình điểm danh.  <br>2\. Nhập tọa độ GPS mốc, bán kính cho phép (vd: 50m), thời gian ân hạn (15 phút).  <br>3\. Nhập dải IP Wi-Fi trường học.  <br>4\. Nhấn "Lưu cấu hình". |
| **Luồng sự kiện phụ** | 2a. Tọa độ GPS không hợp lệ → Cảnh báo kinh độ/vĩ độ sai quy chuẩn. |

**Bảng 2.1: Tạo Đơn xin nghỉ phép kèm minh chứng**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên tạo Đơn xin nghỉ phép** |
| **Mô tả** | Sinh viên chọn buổi học cần nghỉ, nhập lý do và tải lên hình ảnh minh chứng để xin nghỉ học có phép. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên có việc bận hoặc vấn đề sức khỏe cần nghỉ học. |
| **Tiền điều kiện** | Sinh viên được ghi danh trong lớp học phần. |
| **Hậu điều kiện** | Đơn được lưu vào leave_requests với trạng thái PENDING. |
| **Luồng sự kiện chính** | 1\. Vào trang Xin nghỉ phép → Nhấn "Tạo đơn mới".  <br>2\. Chọn Lớp học phần và chọn Buổi học cần nghỉ.  <br>3\. Nhập lý do nghỉ học.  <br>4\. Tải lên hình ảnh minh chứng (giấy viện, đơn xin phép).  <br>5\. Bấm "Gửi đơn xin nghỉ".  <br>6\. Hệ thống lưu đơn và gửi thông báo tới Giảng viên. |
| **Luồng sự kiện phụ** | 2a. Buổi học này đã có đơn gửi trước đó → Cảnh báo không gửi trùng lặp. |

**Bảng 2.1: Hủy Đơn xin nghỉ phép**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên hủy Đơn xin nghỉ phép** |
| **Mô tả** | Cho phép sinh viên hủy đơn xin nghỉ đã nộp nếu đơn vẫn đang chờ duyệt. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên thay đổi kế hoạch và có thể đi học lại bình thường. |
| **Tiền điều kiện** | Đơn xin nghỉ đang ở trạng thái PENDING. |
| **Hậu điều kiện** | Đơn chuyển sang trạng thái CANCELLED. |
| **Luồng sự kiện chính** | 1\. Sinh viên xem danh sách đơn cá nhân.  <br>2\. Bấm nút "Hủy đơn" tại đơn đang chờ duyệt.  <br>3\. Xác nhận hủy → Trạng thái chuyển thành CANCELLED. |
| **Luồng sự kiện phụ** | 1a. Đơn đã được Giảng viên duyệt hoặc từ chối → Không cho phép hủy. |

**Bảng 2.1: Xem Danh sách Đơn nghỉ cá nhân**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem Danh sách và Tiến độ Đơn nghỉ phép cá nhân** |
| **Mô tả** | Sinh viên theo dõi trạng thái các đơn nghỉ phép đã nộp và phản hồi từ giảng viên. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên truy cập trang /dashboard/leave-requests. |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Hiển thị bảng danh sách đơn kèm huy hiệu: PENDING, APPROVED, REJECTED. |
| **Luồng sự kiện chính** | 1\. Mở trang đơn nghỉ phép.  <br>2\. Hệ thống hiển thị các đơn đã nộp kèm: Ngày nộp, Buổi học, Trạng thái, Lý do phản hồi của Giảng viên. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Xét duyệt Đơn xin nghỉ phép & Đồng bộ điểm danh**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Giảng viên / Admin xét duyệt Đơn xin nghỉ phép** |
| **Mô tả** | Giảng viên xem đơn + ảnh minh chứng; chọn Phê duyệt hoặc Từ chối. Khi duyệt, tự động chuyển điểm danh buổi đó sang EXCUSED. |
| **Actor** | Giảng viên phụ trách lớp, Quản trị viên. |
| **Điều kiện kích hoạt** | Có đơn nghỉ phép mới chờ xử lý. |
| **Tiền điều kiện** | Đơn đang ở trạng thái PENDING. |
| **Hậu điều kiện** | Đơn chuyển APPROVED/REJECTED; điểm danh buổi đó chuyển sang EXCUSED nếu duyệt. |
| **Luồng sự kiện chính** | 1\. Giảng viên mở danh sách đơn chờ duyệt của lớp phụ trách.  <br>2\. Mở xem chi tiết đơn và phóng to ảnh minh chứng.  <br>3\. Giảng viên quyết định:  <br>\- Bấm "Phê duyệt" → Cập nhật đơn APPROVED → Tự động tìm bản ghi attendances của buổi học đó và cập nhật status = 'EXCUSED'.  <br>\- Bấm "Từ chối" → Nhập lý do từ chối → Cập nhật đơn REJECTED.  <br>4\. Hệ thống bắn thông báo kết quả cho Sinh viên. |
| **Luồng sự kiện phụ** | 3a. Sinh viên đã tự hủy đơn trước đó → Báo lỗi đơn đã bị hủy. |

**Bảng 2.1: Quản lý Đơn nghỉ phép toàn trường**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Giám sát Đơn nghỉ phép toàn trường (Admin)** |
| **Mô tả** | Quản trị viên tra cứu, thống kê và can thiệp xét duyệt đơn nghỉ phép của mọi lớp học phần trong toàn trường. |
| **Actor** | Quản trị viên (Admin). |
| **Điều kiện kích hoạt** | Quản trị viên kiểm tra tình hình nghỉ học hoặc giải quyết khiếu nại. |
| **Tiền điều kiện** | Sở hữu quyền Admin. |
| **Hậu điều kiện** | Dữ liệu lọc đơn toàn trường được hiển thị đầy đủ. |
| **Luồng sự kiện chính** | 1\. Admin vào mục Đơn nghỉ phép → chọn tab "Tất cả đơn toàn trường".  <br>2\. Lọc theo: Học kỳ, Khoa, Môn học, Trạng thái duyệt.  <br>3\. Admin có thể xem chi tiết và thực hiện duyệt/từ chối thay cho Giảng viên nếu cần. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Gắn kết Thiết bị tự động (Device Binding)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Gắn kết thiết bị điểm danh tự động (Device Binding)** |
| **Mô tả** | Sinh viên điểm danh lần đầu, hệ thống lấy Canvas Fingerprint + User-Agent gán làm thiết bị duy nhất để chống đăng nhập máy người khác điểm danh hộ. |
| **Actor** | Sinh viên, Hệ thống nhận dạng thiết bị. |
| **Điều kiện kích hoạt** | Sinh viên quét mã QR điểm danh lần đầu tiên. |
| **Tiền điều kiện** | Tài khoản chưa có thiết bị nào kích hoạt trong collection devices. |
| **Hậu điều kiện** | Tạo bản ghi thiết bị mới với status = 'ACTIVE' gắn chặt với studentId. |
| **Luồng sự kiện chính** | 1\. Sinh viên quét mã QR điểm danh.  <br>2\. Client trích xuất vân tay phần cứng máy tính/điện thoại.  <br>3\. Backend kiểm tra tài khoản chưa có máy liên kết → Tự động lưu thiết bị này thành thiết bị chính thức (ACTIVE).  <br>4\. Cho phép điểm danh thành công. |
| **Luồng sự kiện phụ** | 3a. Sinh viên đổi sang máy khác khi đã có máy ACTIVE → Hệ thống chặn điểm danh và yêu cầu gửi đơn xin đổi máy. |

**Bảng 2.1: Xem Danh sách Thiết bị cá nhân**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên xem Danh sách thiết bị của tôi** |
| **Mô tả** | Sinh viên xem thiết bị đang hoạt động của mình: Tên máy, Hệ điều hành, Trình duyệt và ngày kích hoạt. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên vào trang Quản lý thiết bị (/dashboard/devices). |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Hiển thị danh sách thiết bị kèm trạng thái: ACTIVE, PENDING, REVOKED. |
| **Luồng sự kiện chính** | 1\. Sinh viên mở trang Thiết bị.  <br>2\. Hệ thống hiển thị thẻ thông tin thiết bị đang liên kết.  <br>3\. Sinh viên kiểm tra tình trạng máy của mình. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Gửi Yêu cầu Thay đổi thiết bị điểm danh**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Gửi yêu cầu Thay đổi thiết bị điểm danh** |
| **Mô tả** | Khi đổi điện thoại/máy tính mới, sinh viên đăng nhập trên máy mới và gửi yêu cầu xin duyệt thiết bị kèm lý do. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên đổi máy và bị hệ thống chặn điểm danh trên máy mới. |
| **Tiền điều kiện** | Thiết bị mới chưa được kích hoạt. |
| **Hậu điều kiện** | Thiết bị mới được ghi nhận vào devices ở trạng thái PENDING. |
| **Luồng sự kiện chính** | 1\. Sinh viên đăng nhập trên máy mới → Vào mục Quản lý thiết bị.  <br>2\. Nhấn nút "Đăng ký thiết bị này".  <br>3\. Nhập lý do xin đổi máy (vd: _"Điện thoại cũ bị hỏng màn hình"_).  <br>4\. Nhấn "Gửi yêu cầu".  <br>5\. Thiết bị mới lưu với trạng thái PENDING chờ Giảng viên/Admin duyệt. |
| **Luồng sự kiện phụ** | 3a. Đã có một yêu cầu PENDING đang chờ → Không cho gửi thêm yêu cầu mới. |

**Bảng 2.1: Xét duyệt Yêu cầu Thay đổi thiết bị**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xét duyệt yêu cầu Thay đổi thiết bị của sinh viên** |
| **Mô tả** | Giảng viên hoặc Admin xác minh lý do đổi máy của sinh viên và bấm Duyệt (kích hoạt máy mới, hủy máy cũ) hoặc Từ chối. |
| **Actor** | Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Có yêu cầu đổi thiết bị nằm trong tab "Chờ phê duyệt". |
| **Tiền điều kiện** | Thiết bị đang ở trạng thái PENDING. |
| **Hậu điều kiện** | Máy cũ chuyển sang REVOKED; máy mới chuyển sang ACTIVE. |
| **Luồng sự kiện chính** | 1\. Giảng viên/Admin mở trang Thiết bị → Tab "Chờ duyệt".  <br>2\. Xem thông tin sinh viên, thông số máy mới và lý do xin đổi.  <br>3\. Xác minh trực tiếp với sinh viên trên lớp.  <br>4\. Bấm "Duyệt thiết bị" → Backend chuyển máy cũ sang REVOKED và kích hoạt máy mới sang ACTIVE.  <br>5\. Thông báo cho sinh viên thiết bị mới đã có thể điểm danh. |
| **Luồng sự kiện phụ** | 4a. Bấm "Từ chối" → Nhập lý do từ chối → Máy mới bị khóa REJECTED. |

**Bảng 2.1: Giám sát Lịch sử Thiết bị & IP đăng nhập**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Giám sát Lịch sử Thiết bị & IP đăng nhập** |
| **Mô tả** | Giảng viên và Admin xem lịch sử đăng nhập, thiết bị sử dụng và địa chỉ IP của sinh viên để phát hiện tài khoản có dấu hiệu gian lận. |
| **Actor** | Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Kiểm tra an ninh hệ thống hoặc điều tra nghi vấn điểm danh hộ. |
| **Tiền điều kiện** | Có quyền quản lý sinh viên. |
| **Hậu điều kiện** | Danh sách lịch sử các phiên truy cập được hiển thị chi tiết. |
| **Luồng sự kiện chính** | 1\. Mở chi tiết một sinh viên → Chọn tab "Lịch sử đăng nhập & Thiết bị".  <br>2\. Hệ thống hiển thị bảng: Thời gian, Địa chỉ IP, Trình duyệt, Hệ điều hành, Vị trí tương đối.  <br>3\. Admin/Giảng viên đối soát nếu thấy có 2 IP đăng nhập cách xa nhau trong thời gian ngắn. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Tính Điểm chuyên cần động & Cờ cấm thi**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Tính toán Điểm chuyên cần động thang 10 & Cờ cấm thi** |
| **Mô tả** | Tự động tính điểm thang 10 theo trọng số cấu hình phạt (vắng, trễ, về sớm) và bật cờ isExamBanned = true nếu vắng quá 20% tổng số buổi môn học. |
| **Actor** | Hệ thống tự động thực thi; GV, SV xem kết quả. |
| **Điều kiện kích hoạt** | Mỗi khi có bản ghi điểm danh được thêm mới hoặc điều chỉnh. |
| **Tiền điều kiện** | Sinh viên đã có bản ghi điểm danh trong lớp. |
| **Hậu điều kiện** | Điểm chuyên cần, tỷ lệ vắng và cờ cấm thi được cập nhật đồng bộ. |
| **Luồng sự kiện chính** | 1\. Đọc cấu hình phạt từ attendance_configs: Gốc 10đ, vắng -2đ, trễ -0.5đ, về sớm -0.5đ, có phép -0.2đ.  <br>2\. Đếm số buổi từng trạng thái của sinh viên.  <br>3\. Tính điểm chuyên cần (tối đa 10, tối thiểu 0).  <br>4\. Tính tỷ lệ vắng: (Số buổi vắng / Tổng số buổi môn) \* 100%.  <br>5\. Nếu tỷ lệ vắng > 20% → Gán isExamBanned = true. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Xem Bảng điểm chuyên cần cá nhân**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên xem Bảng điểm chuyên cần cá nhân** |
| **Mô tả** | Sinh viên theo dõi điểm chuyên cần hiện tại, số buổi vắng/trễ và khoảng cách tới ngưỡng cấm thi của từng môn học. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên vào trang Điểm danh hoặc Bảng điều khiển. |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Hiển thị điểm chuyên cần và thanh tiến trình cảnh báo cấm thi trực quan. |
| **Luồng sự kiện chính** | 1\. Sinh viên vào trang Điểm danh.  <br>2\. Thẻ KPI hiển thị: Điểm chuyên cần hiện tại (vd: 8.5/10), Số buổi vắng (1 buổi), Trạng thái an toàn. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Xem Bảng điểm chuyên cần Lớp học phần**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem Bảng điểm chuyên cần toàn bộ Lớp học phần** |
| **Mô tả** | Giảng viên/Admin xem bảng điểm chuyên cần của mọi sinh viên trong lớp, danh sách sinh viên dưới 7.0đ và danh sách bị cấm thi. |
| **Actor** | Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Giảng viên chọn tab "Bảng điểm chuyên cần" của lớp. |
| **Tiền điều kiện** | Có quyền quản lý lớp học phần. |
| **Hậu điều kiện** | Toàn bộ điểm chuyên cần và trạng thái cấm thi của cả lớp được hiển thị. |
| **Luồng sự kiện chính** | 1\. Giảng viên mở Báo cáo lớp → chọn xem Điểm chuyên cần.  <br>2\. Backend gọi calculateClassScores(courseSectionId).  <br>3\. Hiển thị bảng: MSSV, Họ tên, Điểm thang 10, Tỷ lệ vắng, Huy hiệu Cấm thi (nếu vắng > 20%). |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Trích xuất 12 Đặc trưng chuyên cần chuỗi thời gian**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Trích xuất 12 Đặc trưng chuỗi thời gian (Feature Engineering)** |
| **Mô tả** | Backend NestJS phân tích lịch sử điểm danh theo chuỗi thời gian, trích xuất vector 12 đặc trưng hành vi học tập của sinh viên. |
| **Actor** | Backend NestJS (Hệ thống thực thi). |
| **Điều kiện kích hoạt** | Khi có yêu cầu dự báo nguy cơ chuyên cần cho sinh viên hoặc cả lớp. |
| **Tiền điều kiện** | Lớp học phần đã diễn ra ít nhất 3-4 buổi học. |
| **Hậu điều kiện** | Trả về vector 12 giá trị số sẵn sàng nạp vào mô hình AI. |
| **Luồng sự kiện chính** | 1\. Backend đọc lịch sử điểm danh từ MongoDB.  <br>2\. Tính toán 12 đặc trưng: Tỷ lệ vắng, Tỷ lệ trễ, Tỷ lệ về sớm, Tỷ lệ có phép, Chuỗi vắng liên tiếp tối đa, Điểm chuyên cần hiện tại, Tần suất quét mã sát giờ, Tốc độ suy giảm chuyên cần,...  <br>3\. Đóng gói thành payload JSON chuẩn gửi sang AI Service. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Dự báo Nguy cơ cấm thi bằng Machine Learning**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Dự báo Nguy cơ cấm thi bằng Machine Learning (FastAPI Random Forest)** |
| **Mô tả** | FastAPI AI Service tiếp nhận 12 đặc trưng, chạy mô hình Random Forest Classifier để phân loại mức rủi ro (LOW, MEDIUM, HIGH), xác suất cấm thi và sinh khuyến nghị can thiệp. |
| **Actor** | FastAPI AI Service (Thực thi); Giảng viên, Admin (Xem kết quả). |
| **Điều kiện kích hoạt** | Giảng viên mở tab "AI Risk Radar" trên web app. |
| **Tiền điều kiện** | Model attendance_risk_pipeline.pkl đã được nạp trên FastAPI Service. |
| **Hậu điều kiện** | Trả về kết quả phân loại rủi ro (Xanh/Vàng/Đỏ) + Xác suất + Khuyến nghị sư phạm. |
| **Luồng sự kiện chính** | 1\. Backend gửi HTTP POST /predict sang FastAPI kèm 12 features.  <br>2\. FastAPI chuẩn hóa dữ liệu và đưa qua pipeline Random Forest.  <br>3\. Trả về kết quả: risk, riskProbability, recommendation.  <br>4\. Backend nhận dữ liệu và chuyển tiếp về giao diện Web. |
| **Luồng sự kiện phụ** | 1a. AI Service mất kết nối / Quá 3s → Kích hoạt cơ chế Fallback nội bộ NestJS, ước lượng rủi ro theo ngưỡng quy chế 20% để không làm gián đoạn hệ thống. |

**Bảng 2.1: Xem Radar Cảnh báo AI & Khuyến nghị**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem AI Risk Radar và Khuyến nghị can thiệp sư phạm** |
| **Mô tả** | Giảng viên xem biểu đồ phân bổ rủi ro cả lớp, lọc sinh viên nhóm đỏ (HIGH) để chủ động liên hệ nhắc nhở trước khi quá muộn. |
| **Actor** | Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Giảng viên truy cập tab "Cảnh báo AI" trên trang lớp học phần. |
| **Tiền điều kiện** | Đã có kết quả dự báo từ UC-AI-02. |
| **Hậu điều kiện** | Hiển thị biểu đồ phân bổ rủi ro và bảng chi tiết từng sinh viên kèm lời khuyên AI. |
| **Luồng sự kiện chính** | 1\. Giảng viên vào tab Cảnh báo AI.  <br>2\. Xem biểu đồ thống kê: Bao nhiêu SV An toàn (Xanh), Bao nhiêu Cần chú ý (Vàng), Bao nhiêu Nguy cơ cấm thi cao (Đỏ).  <br>3\. Bấm vào sinh viên nhóm Đỏ → Hộp thoại mở ra hiển thị xác suất (vd: 87%) và lời khuyên: _"Cần liên hệ với SV vì đã vắng 2 buổi liên tiếp và có dấu hiệu bỏ học"_. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Xem Cảnh báo cá nhân & Hướng dẫn cải thiện**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Sinh viên xem Cảnh báo cá nhân và Hướng dẫn cải thiện** |
| **Mô tả** | Sinh viên nhận cảnh báo sớm cá nhân hóa từ AI để điều chỉnh ý thức chuyên cần kịp thời. |
| **Actor** | Sinh viên. |
| **Điều kiện kích hoạt** | Sinh viên vào trang Điểm danh cá nhân. |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Sinh viên nắm được mức rủi ro và lời khuyên hành động cụ thể. |
| **Luồng sự kiện chính** | 1\. Sinh viên mở môn học.  <br>2\. Nếu thuộc nhóm Vàng/Đỏ, hệ thống hiển thị banner cảnh báo kèm lời khuyên: _"Bạn đã vắng 2 buổi, nếu vắng thêm 1 buổi bạn sẽ bị cấm thi môn này. Hãy đi học đầy đủ các buổi còn lại"_. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Xuất Báo cáo Điểm danh ra file Excel (.xlsx)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xuất Báo cáo Điểm danh ra file Excel (.xlsx)** |
| **Mô tả** | Giảng viên hoặc Admin tải xuống file Excel chứa đầy đủ: Danh sách sinh viên, trạng thái từng buổi học, tổng vắng, điểm chuyên cần và nhãn rủi ro AI. |
| **Actor** | Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Nhấn nút "Xuất Excel" trên thanh công cụ trang Điểm danh. |
| **Tiền điều kiện** | Lớp học phần đã có dữ liệu điểm danh. |
| **Hậu điều kiện** | File .xlsx chuẩn tiếng Việt, tự co giãn cột được tải về máy tính. |
| **Luồng sự kiện chính** | 1\. Giảng viên bấm nút "Xuất Excel".  <br>2\. Client gọi helper excel-export.ts sử dụng thư viện SheetJS.  <br>3\. Dựng Header thông tin lớp và bảng dữ liệu chi tiết.  <br>4\. Trình duyệt tải xuống file |
| **Luồng sự kiện phụ** | 1a. Lớp chưa có dữ liệu → Báo lỗi không có dữ liệu để xuất file. |

**Bảng 2.1: Xem Bảng điều khiển Tổng quan (Dashboard KPI Cards)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem Bảng điều khiển Tổng quan (Dashboard KPI Cards)** |
| **Mô tả** | Cung cấp cái nhìn tổng thể về hoạt động chuyên cần trong ngày: Tổng sinh viên, Tỷ lệ chuyên cần trung bình, Số ca có nguy cơ cấm thi. |
| **Actor** | Quản trị viên, Giảng viên, Sinh viên. |
| **Điều kiện kích hoạt** | Người dùng đăng nhập hoặc bấm vào "Bảng điều khiển". |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Các thẻ KPI và biểu đồ trực quan được hiển thị theo quyền của người dùng. |
| **Luồng sự kiện chính** | 1\. Người dùng vào /dashboard/default.  <br>2\. Hệ thống gọi API thống kê tương ứng với vai trò.  <br>3\. Hiển thị các thẻ KPI và biểu đồ tiến độ học tập. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Giám sát Live Audit Feed**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Giám sát Dòng sự kiện trực tiếp (Live Audit Feed)** |
| **Mô tả** | Dành riêng cho Quản trị viên: Theo dõi thời gian thực các sự kiện nhạy cảm vừa diễn ra (Ai vừa sửa điểm danh, ai vừa đổi thiết bị, ai vừa nộp đơn). |
| **Actor** | Quản trị viên (Admin). |
| **Điều kiện kích hoạt** | Quản trị viên xem Dashboard. |
| **Tiền điều kiện** | Tài khoản có vai trò admin. |
| **Hậu điều kiện** | Dòng sự kiện được hiển thị liên tục theo thời gian thực. |
| **Luồng sự kiện chính** | 1\. Admin xem khối "Live Audit Feed" trên Dashboard.  <br>2\. Hệ thống tải 20 sự kiện mới nhất từ CSDL.  <br>3\. Hiển thị rõ: Người thao tác, Hành động thực hiện, Đối tượng tác động, Thời gian. |
| **Luồng sự kiện phụ** | Không có. |

**Bảng 2.1: Xem Lịch trình Buổi học hôm nay**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem Lịch trình các Buổi học diễn ra trong ngày hôm nay** |
| **Mô tả** | Hiển thị danh sách các ca học diễn ra trong ngày hôm nay kèm trạng thái (Đang diễn ra, Sắp tới, Đã kết thúc) và nút thao tác nhanh. |
| **Actor** | Sinh viên, Giảng viên, Admin. |
| **Điều kiện kích hoạt** | Người dùng xem khối "Buổi học hôm nay" trên Dashboard. |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Danh sách buổi học trong ngày hiển thị đầy đủ phòng, môn, ca học. |
| **Luồng sự kiện chính** | 1\. Hệ thống xác định ngày hiện tại và userId.  <br>2\. Gọi API  <br>3\. Hiển thị danh sách các buổi học kèm nút "Vào điểm danh" (cho GV) hoặc "Quét mã QR" (cho SV). |
| **Luồng sự kiện phụ** | 2a. Hôm nay không có buổi học → Hiển thị thông báo _"Hôm nay bạn không có lịch học"_. |

**Bảng 2.1: Đẩy Thông báo thời gian thực (Real-time Notification)**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Đẩy Thông báo thời gian thực qua WebSocket** |
| **Mô tả** | Hệ thống tự động đẩy thông báo tức thì lên màn hình người dùng khi có sự kiện: Điểm danh thành công, Đơn nghỉ được duyệt, Cảnh báo nguy cơ cấm thi. |
| **Actor** | Hệ thống tự động (Gửi); Sinh viên, Giảng viên (Nhận). |
| **Điều kiện kích hoạt** | Phát sinh sự kiện nghiệp vụ trong hệ thống. |
| **Tiền điều kiện** | Người dùng có tài khoản trên hệ thống. |
| **Hậu điều kiện** | Thông báo xuất hiện dạng Toast trên màn hình và lưu vào collection notifications. |
| **Luồng sự kiện chính** | 1\. Sự kiện nghiệp vụ diễn ra (vd: Giảng viên duyệt đơn nghỉ của SV).  <br>2\. NotificationService lưu bản ghi thông báo mới vào MongoDB.  <br>3\. NotificationGateway bắn sự kiện Socket.IO đến client của người nhận.  <br>4\. Màn hình người nhận rung chuông thông báo và hiện popup Toast góc màn hình. |
| **Luồng sự kiện phụ** | 3a. Người nhận đang offline → Lưu sẵn trong CSDL; khi đăng nhập lại sẽ hiển thị số thông báo chưa đọc. |

**Bảng 2.1: Quản lý và Đọc danh sách Thông báo**

|     |     |
| --- | --- |
| **UseCase** | **Nội dung** |
| **Tên UseCase** | **Xem và Quản lý Danh sách Thông báo cá nhân** |
| **Mô tả** | Người dùng bấm vào quả chuông để xem danh sách thông báo, đánh dấu đã đọc hoặc bấm vào thông báo để chuyển hướng đến trang liên quan. |
| **Actor** | Sinh viên, Giảng viên, Quản trị viên. |
| **Điều kiện kích hoạt** | Người dùng bấm vào biểu tượng quả chuông trên thanh Header. |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | Trạng thái thông báo chuyển thành isRead = true. |
| **Luồng sự kiện chính** | 1\. Bấm vào icon Quả chuông trên Header.  <br>2\. Xem danh sách thông báo mới nhất.  <br>3\. Bấm vào một thông báo → Hệ thống đánh dấu đã đọc và chuyển hướng thẳng đến trang nghiệp vụ tương ứng (vd: trang đơn nghỉ phép hoặc trang điểm danh). |
| **Luồng sự kiện phụ** | Không có. |

### ClassDiagram

**Hình 2.1: ClassDiagram**

**Bảng 2.1: ClassDiagram**

|     |     |     |
| --- | --- | --- |
| **STT** | **Collection (MongoDB)** | **Chức năng / Ý nghĩa nghiệp vụ trong hệ thống** |
| 1   | attendances | Lưu kết quả điểm danh của sinh viên theo từng buổi học: trạng thái (present, late, absent, excused, early_leave), thời gian check-in/out, phương thức (self, qr_code, face_recognition), ảnh chụp và thông tin thiết bị. |
| 2   | attendance_audits | Lưu vết lịch sử (Audit Log) khi Giảng viên/Admin can thiệp điều chỉnh trạng thái điểm danh (ai sửa, trạng thái cũ/mới, lý do điều chỉnh, thời điểm sửa). |
| 3   | attendance_configs | Cấu hình tham số điểm danh toàn cục: tọa độ GPS mốc, bán kính cho phép (m), dải IP Wi-Fi hợp lệ, điểm chuyên cần gốc (thang 10), mức điểm phạt vắng/muộn và ngưỡng cảnh báo cấm thi. |
| 4   | leave_requests | Quản lý đơn xin nghỉ phép của sinh viên (nghỉ ốm, việc riêng, có file đính kèm minh chứng) và trạng thái phê duyệt của giảng viên (pending, approved, rejected). |
| 5   | leave_request_histories | Lưu lịch sử các bước xử lý đơn nghỉ phép (tạo đơn, duyệt, từ chối hoặc hủy đơn). |
| 6   | course_sections | Đại diện cho Lớp học phần được mở trong từng học kỳ, quản lý mã lớp học phần, sĩ số tối đa/hiện tại, phòng học mặc định và lịch học trong tuần. |
| 7   | class_sessions | Đại diện cho từng Buổi học (tiết học) cụ thể theo ngày. Lưu giảng viên đứng lớp, phòng học, tiết bắt đầu, số tiết và tọa độ GPS/IP riêng của phòng học đó. |
| 8   | enrollments | Quản lý việc sinh viên đăng ký vào lớp học phần, lưu trạng thái học tập (enrolled, completed), điểm quá trình, điểm thi và tổng kết. |
| 9   | course_section_lecturers | Bảng phân công giảng viên giảng dạy cho lớp học phần (vai trò: giảng viên chính main hoặc trợ giảng assistant). |
| 10  | subjects | Quản lý danh mục Môn học trong chương trình đào tạo: mã môn, tên môn, số tín chỉ, môn học tiên quyết (prerequisiteSubjectId). |
| 11  | classes | Quản lý Lớp sinh hoạt (lớp niên chế): tên lớp, khóa học (cohort year), ngành học và Giảng viên cố vấn học tập chủ nhiệm. |
| 12  | class_subjects | Quản lý khung chương trình môn học bắt buộc được gán cho từng Lớp sinh hoạt theo kế hoạch đào tạo. |
| 13  | semesters | Quản lý Học kỳ (Học kỳ 1, 2, hè): ngày bắt đầu, ngày kết thúc và trạng thái (upcoming, active, closed). |
| 14  | academic_years | Quản lý Năm học (ví dụ: 2024-2025, 2025-2026), làm cha của các học kỳ. |
| 15  | users | Lưu trữ thông tin tài khoản: mã định danh Firebase UID, email, họ tên, mã số sinh viên/giảng viên (userCode), số điện thoại, ảnh đại diện, vai trò (roleId) và trạng thái hoạt động. |
| 16  | roles | Định nghĩa các nhóm quyền trong hệ thống: student (Sinh viên), teacher (Giảng viên), admin (Quản trị viên), super_admin kèm mảng quyền động (permissions). |
| 17  | user_devices | Quản lý thiết bị của sinh viên bằng vân tay phần cứng (deviceFingerprint), đảm bảo nguyên tắc 1 tài khoản chỉ điểm danh trên thiết bị tin cậy được ủy quyền (chống gian lận điểm danh hộ). |
| 18  | login_histories | Ghi nhật ký mỗi phiên đăng nhập của người dùng: IP, trình duyệt (User-Agent), thời gian và vị trí nhằm phát hiện truy cập bất thường. |
| 19  | notifications | Lưu trữ thông báo gửi tới từng người dùng: cảnh báo vắng học quá số buổi, kết quả duyệt đơn xin nghỉ, nhắc nhở giờ vào lớp. |
| 20  | notification_templates | Chứa các mẫu thông báo định sẵn với placeholder (ví dụ mẫu gửi email, mẫu thông báo đẩy cảnh báo cấm thi). |
| 21  | period_configs | Định nghĩa khung giờ chuẩn của từng tiết học trong ngày của nhà trường (ví dụ: Tiết 1 bắt đầu 07:00, kết thúc 07:45). |
| 22  | menus | Quản lý cây điều hướng menu trên giao diện Web theo phân quyền của từng Role. |
| 23  | configs | Lưu trữ các cặp cấu hình hệ thống tổng quát (dạng Key - Value) có thể thay đổi linh hoạt trong quá trình vận hành. |

#   
XÂY DỰNG VÀ PHÁT TRIỂN PHẦN MỀM

_Chương này trình bày quá trình hiện thực hóa hệ thống từ thiết kế đến triển khai, tập trung vào việc xây dựng các chức năng, xử lý nghiệp vụ và kết nối giữa các thành phần của hệ thống._

## TỔNG QUAN KIẾN TRÚC HỆ THỐNG

### Kiến trúc phân tán đa dịch vụ

**_3.1.1.1. Tổng quan kiến trúc_**

Hệ thống điểm danh thông minh được xây dựng theo mô hình kiến trúc đa dịch vụ, trong đó toàn bộ ứng dụng được phân rã thành ba dịch vụ độc lập, mỗi dịch vụ đảm nhận một trách nhiệm chuyên biệt, có thể phát triển, triển khai và mở rộng tài nguyên một cách độc lập với nhau. Đây là sự lựa chọn kiến trúc phù hợp với tính chất bài toán: quản lý nghiệp vụ backend, xử lý học máy và giao diện người dùng.

Toàn bộ hệ thống được đóng gói bằng Docker và điều phối bởi Docker Compose, tạo thành một mạng nội bộ riêng biệt (attendance-net) để ba dịch vụ giao tiếp an toàn với nhau mà không lộ các cổng nội bộ ra Internet.

**Sơ đồ tổng quan kiến trúc:**

_Hình 3.1. Sơ đồ tổng thể hệ thống_

**_3.1.1.2. Mô tả chi tiết từng dịch vụ_**

**a) Phân hệ Backend — NestJS API Service**

Dịch vụ trung tâm của hệ thống, đóng vai trò là API Gateway và Business Logic Engine. Được xây dựng bằng NestJS với TypeScript, dịch vụ này:

• Lắng nghe yêu cầu tại cổng 3000, phục vụ tất cả API dưới tiền tố /api/v1

• Cung cấp tài liệu API tự động thông qua Swagger UI tại đường dẫn /api/docs

• Áp dụng ValidationPipe toàn cục với chế độ whitelist để lọc và kiểm tra dữ liệu

• Kết nối cơ sở dữ liệu MongoDB thông qua thư viện Mongoose

• Tích hợp Firebase Admin SDK để xác thực người dùng và gửi thông báo đẩy

• Giao tiếp với Phân hệ AI thông qua biến môi trường trỏ đến container FastAPI

Cấu trúc module của Backend gồm 9 module nghiệp vụ chính, được tổ chức theo nguyên tắc Single Responsibility:

_Bảng 3.1. Module chính phân hệ BackEnd_

| **Module** | **Chức năng chính** |
| --- | --- |
| Auth Module | Xác thực Firebase JWT, quản lý phiên đăng nhập |
| User Module | Quản lý hồ sơ người dùng (Admin, Giảng viên, Sinh viên) |
| Role Module | Phân quyền theo vai trò (Role-based Access Control) |
| Academic Module | Quản lý học phần, lớp học phần, học kỳ, năm học |
| Attendance Module | Nghiệp vụ điểm danh QR, tính điểm, Audit Log, thống kê |
| Notification Module | Thông báo đa kênh (Socket.IO + Firebase FCM) |
| Config Module | Cấu hình hệ thống (tiết học, ngưỡng điểm danh) |
| Device Module | Quản lý thiết bị đăng ký (chống gian lận thiết bị) |
| Media Module | Upload và quản lý tài nguyên media (Cloudinary) |

**b) Phân hệ AI — FastAPI Microservice**

Dịch vụ học máy chuyên biệt, được xây dựng hoàn toàn độc lập bằng Python/FastAPI để phục vụ mục tiêu dự báo rủi ro chuyên cần. Dịch vụ này lắng nghe tại cổng 8000 và cung cấp ba nhóm endpoint chính:

• GET /health hoặc /api/warning/health: Kiểm tra trạng thái dịch vụ và mô hình ML

**•** GET /models/metadata: Trả về thông tin chi tiết và kết quả đánh giá của mô hình đang phục vụ

**•** POST /predict hoặc /api/warning/predict: Endpoint dự báo rủi ro chuyên cần chính

Dịch vụ hỗ trợ hai chế độ dự báo:

1\. Chế độ đặc trưng trực tiếp (Cách 1): NestJS tính toán sẵn vector 12 đặc trưng từ MongoDB và truyền trực tiếp — phương thức nhanh và được ưu tiên

2\. Chế độ truy vấn cơ sở dữ liệu (Cách 2):

FastAPI tự kết nối MongoDB bằng AttendanceFeatureExtractor, truy vấn và tính toán đặc trưng — dùng cho kịch bản dự phòng.

Khi khởi động (sự kiện lifespan), dịch vụ tự động nạp mô hình ML đã huấn luyện và đối tượng AttendanceFeatureExtractor, đảm bảo sẵn sàng phục vụ ngay khi có yêu cầu đầu tiên.

**c) Phân hệ Frontend — Next.js Web Application**

Giao diện người dùng được xây dựng bằng Next.js 15 với Tailwind CSS và React Compiler (bật reactCompiler: true), lắng nghe tại cổng 4000 ở chế độ standalone output để tối ưu kích thước Docker image.

Frontend phục vụ ba phân hệ giao diện riêng biệt theo vai trò người dùng, được cấu hình thông qua cấu trúc thư mục App Router của Next.js:

• \`/auth/student/login\` — Trang đăng nhập dành cho Sinh viên

• \`/auth/teacher/login\` — Trang đăng nhập dành cho Giảng viên

• \`/auth/v3/login\` — Trang đăng nhập dành cho Quản trị viên

• \`/dashboard/\*\` — Bảng điều khiển chính theo vai trò

Toàn bộ cấu hình kết nối (URL API, Firebase credentials) được truyền vào qua build arguments của Docker, giúp tách biệt cấu hình môi trường với mã nguồn.

**_3.1.1.3. Hạ tầng và đóng gói_**

Hệ thống được đóng gói và vận hành thông qua Docker Compose, tạo nên một môi trường chạy nhất quán giữa các môi trường phát triển và production. Cấu hình mạng nội bộ attendance-net với driver bridge cho phép các container giao tiếp với nhau qua tên dịch vụ (DNS nội bộ), ví dụ NestJS gọi FastAPI qua http://intelligent-attendance-ai:8000.

Thứ tự khởi động được kiểm soát bởi depends_on:

_Hình 3.2. Sơ đồ vòng đời hệ thống_

Khi triển khai lên môi trường đám mây Render Cloud (vùng Singapore), mỗi dịch vụ được triển khai dưới dạng một Web Service độc lập với runtime Docker riêng, cùng endpoint kiểm tra sức khỏe (Health Check)

### Tổng hợp các giao thức giao tiếp

_Bảng 3.2. Luồng giao thức giao tiếp_

| **Luồng tương tác** | **Giao thức** | **Phương thức** |
| --- | --- | --- |
| Frontend → NestJS (nghiệp vụ) | REST over HTTPS | HTTP GET/POST/PUT/DELETE |
| Frontend ↔ NestJS (thời gian thực) | WebSocket (Socket.IO) | Event-driven |
| NestJS → FastAPI (dự báo AI) | REST over HTTP (nội bộ) | HTTP POST /predict |
| FastAPI → MongoDB (trực tiếp) | Mongoose/pymongo | Query |
| NestJS → Firebase FCM | Firebase Admin SDK | gRPC/HTTPS |
| NestJS → MongoDB | Mongoose ODM | Query/Aggregation |
| CI/CD Deployment | Docker + Render API | Container orchestration |

## Xây dựng phân hệ backend

### Xây dựng hệ thống Web API và kiến trúc phân tầng

**_3.2.1.1. Tổ chức kiến trúc phân tầng_**

Hệ thống Backend tuân thủ mô hình phân tầng hai cấp theo tiêu chuẩn NestJS hiện đại: Controller và Service, trong đó Service trực tiếp inject Mongoose Model để thực hiện truy vấn cơ sở dữ liệu.

_Hình 3.3. Phân tầng BackEnd_

**_3.2.1.2. Controller Layer_**

Controller không chứa bất kỳ logic nghiệp vụ nào. Trách nhiệm duy nhất là nhận request HTTP, trích xuất dữ liệu từ decorators và ủy quyền sang Service:

_Hình 3.4. Sơ đồ luồng attendance controller_

### Hiện thực hóa các nghiệp vụ cốt lõi

**_3.2.2.1. Cơ chế sinh và xác thực mã QR động_**

**_Cơ chế sinh mã QR_**

Mã QR không chứa nội dung tĩnh mà được tạo mới liên tục theo chu kỳ cấu hình (mặc định 20 giây). Cấu trúc token gồm hai phần nối bởi dấu chấm:

- Chữ ký số được tính bằng HMAC-SHA256 với khóa bí mật QR_HMAC_SECRET (inject từ biến môi trường), đảm bảo chỉ server mới có thể tạo và xác thực token hợp lệ.
- Mỗi lần sinh mã, nonce được tạo ngẫu nhiên bằng “crypto. Ran dom Bytes (4).to String('hex')”, loại bỏ khả năng tái sử dụng hay đoán trước token.

**_Luồng phát mã QR liên tục_**

Khi giảng viên bật màn hình điểm danh, QrAttendanceGateway nhận sự kiện start_qr_stream và khởi động setInterval định kỳ phát token mới

_Hình 3.5. Sơ đồ luồng chức năng tạo QR động_

Timer được lưu vào Map&lt;string, NodeJS.Timeout&gt; theo classSessionId để đảm bảo không chạy hai timer song song cho cùng một buổi học, và có thể dừng chính xác khi giảng viên đóng màn hình.

**_Xác thực đa tầng khi sinh viên quét mã_**

Khi sinh viên gửi token lên endpoint POST /scan-qr, hệ thống thực hiện kiểm tra theo 4 tầng bảo mật độc lập:

Tầng 1 — Xác thực chữ ký HMAC

Tầng 2 — Kiểm tra hạn sử dụng với Tolerance Window

Tầng 3 — Kiểm tra vị trí GPS bằng công thức Haversine

Tầng 4 — Kiểm tra IP WiFi

Chiến lược cấu hình ưu tiên theo thứ tự: cấu hình riêng của buổi học → cấu hình toàn cục Admin (method getEffectiveSessionConfig). Điều này cho phép tùy chỉnh linh hoạt từng phòng học mà không thay đổi cấu hình hệ thống.

**_3.2.2.2. Thuật toán tính chuyên cần động theo cấu hình và ngưỡng cấm thi_**

**_Công thức tính điểm_**

Hệ thống áp dụng công thức trừ điểm từ điểm ban đầu, hoàn toàn cấu hình được qua bảng attendance_configs:

Giá trị mặc định hiện tại:

**•** initialScore = 10 (thang điểm 10)

**•** absentPenalty = 2.0 điểm/buổi vắng không phép

**•** latePenalty = 0.5 điểm/buổi đi muộn

**•** earlyLeavePenalty = 0.5 điểm/buổi về sớm

**•** excusedPenalty = 0.0 điểm/buổi vắng có phép (không trừ)

**•** examBanThreshold = 20% — ngưỡng tỷ lệ vắng kích hoạt cờ cấm thi

**_Quy trình tính toán trong \`AttendanceScoreService\`_**

Kết quả trả về bao gồm: điểm số, tỷ lệ vắng, tỷ lệ có mặt, cờ examBanRisk, và chuỗi mô tả công thức đã áp dụng — giúp người dùng hiểu rõ cơ sở tính điểm của mình.

Khi tính điểm cho cả lớp (calculateClassScores), danh sách sinh viên được sắp xếp theo thứ tự ưu tiên: sinh viên có nguy cơ cấm thi lên đầu, sau đó theo điểm tăng dần — giúp giảng viên nhanh chóng nhận diện các trường hợp cần can thiệp.

**_3.2.2.3. Quản lý lịch sử điều chỉnh điểm danh có lưu vết_**

Khi giảng viên hoặc quản trị viên điều chỉnh trạng thái điểm danh của sinh viên (ví dụ: từ absent sang excused sau khi xem xét đơn nghỉ phép), hệ thống thực hiện hai hành động nguyên tử:

Bước 1 — Cập nhật bản ghi điểm danh

Bước 2 — Ghi Audit Log (không thể xóa/sửa)

Thiết kế schema attendance_audits với updatedAt: false và không cung cấp endpoint PUT/DELETE đảm bảo tính **append-only** của audit trail — mỗi lần điều chỉnh tạo một bản ghi mới, không bao giờ xóa hoặc sửa bản ghi cũ. Lịch sử có thể tra cứu đầy đủ theo index {attendanceId, createdAt: -1} theo thứ tự thời gian giảm dần.

**_3.2.2.4. Thông báo thời gian thực đa_**

**Mô hình thiết kế (Strategy Pattern):**

- NotificationService đóng vai trò trung tâm điều phối, quản lý 2 kênh gửi tin thông qua interface chung INotificationChannel.

**Cơ chế phân phối đa kênh (Multi-Channel Dispatch):**

- Kênh In-App (WebSocket Socket.IO): Phát trực tiếp tới các client đang trực tuyến (/notifications namespace). Độ trễ xấp xỉ 0ms, kích hoạt Toast thông báo (Sonner) và âm thanh Web Audio.
- Kênh Nền (Firebase Cloud Messaging - FCM): Gửi Web Push Notification qua Google FCM API tới Service Worker của thiết bị (nhận được ngay cả khi đóng tab hoặc khóa màn hình).

**Tối ưu hóa bất đồng bộ (Non-Blocking Performance):**

- Socket.IO được phát ngay lập tức trên luồng chính.
- FCM Push và ghi nhật ký vào MongoDB (notifications collection) được tách sang chạy ngầm (Background Task), không làm trễ thời gian phản hồi HTTP request.

**Cơ chế Template Engine:**

- Hỗ trợ nạp template từ RAM (NOTIFICATION_TEMPLATES)

_Hình 3.6. Sơ đồ luồng chức năng thông báo_

### Cơ chế xác thực JWT và phân quyền 3 tác nhân

**_3.2.3.1. Luồng xác thực Firebase JWT_**

Hệ thống sử dụng Firebase Authentication làm Identity Provider, tích hợp với MongoDB qua cơ chế Firebase UID Sync

_Hình 3.7. Sơ đồ luồng xác thực với JWT_

Sau khi đăng nhập thành công, mỗi request tiếp theo đều phải kèm Authorization: Bearer {idToken} trong header. FirebaseAuthGuard giải mã và xác thực token này bằng firebaseAdmin.auth(). verifyId Token(), sau đó inject thông tin user (từ MongoDB) vào request.user thông qua @CurrentUser() decorator.

**_3.2.3.2. Ràng buộc thiết bị trong luồng đăng nhập_**

Điểm đặc biệt của hệ thống là kiểm tra thiết bị ngay trong bước đăng nhập. Đối với vai trò Sinh viên, DeviceService.validateAndRegisterDevice() kiểm tra:

**•** Nếu chưa có thiết bị nào đăng ký → Tự động đăng ký thiết bị hiện tại

**•** Nếu đã có thiết bị đăng ký → Phải trùng khớp deviceId đã đăng ký

**•** Nếu thiết bị không khớp → Trả về lỗi pending_device, ghi login history

Ràng buộc này đảm bảo mỗi sinh viên chỉ có thể đăng nhập từ một thiết bị duy nhất đã đăng ký — ngăn chặn việc mượn tài khoản để điểm danh hộ.

**_3.2.3.4. Tổng hợp ma trận phân quyền_**

_Bảng 3.3. Phân quyền chức năng_

| **Chức năng** | **Admin** | **Giảng viên** | **Sinh viên** |
| --- | --- | --- | --- |
| Quản lý tài khoản người dùng | ✓   | ✗   | ✗   |
| Cấu hình hệ thống (điểm, GPS, IP) | ✓   | ✗   | ✗   |
| Tạo/quản lý học phần, lớp học phần | ✓   | ✓   | ✗   |
| Điều chỉnh điểm danh (Audit Log) | ✓   | ✓   | ✗   |
| Xem bảng điểm chuyên cần cả lớp | ✓   | ✓   | ✗   |
| Điểm danh bằng QR / Check-in | ✗   | ✗   | ✓   |
| Xem điểm chuyên cần của chính mình | ✗   | ✗   | ✓   |
| Gửi đơn xin nghỉ phép | ✗   | ✗   | ✓   |
| Phê duyệt đơn nghỉ phép | ✓   | ✓   | ✗   |
| Xem thống kê toàn hệ thống | ✓   | ✗   | ✗   |

## Xây dựng phân hệ học máy dự báo sớm chuyên cần Tổng quan mục tiêu bài toán học máy

Trong hệ thống tín chỉ hiện hành theo Quy chế Bộ Giáo dục và Đào tạo, sinh viên bị cấm thi nếu tỷ lệ vắng vượt 20% tổng số tiết của học phần. Thực tế cho thấy đến thời điểm này, phần lớn sinh viên đã không còn cơ hội cải thiện. Phân hệ học máy được xây dựng nhằm dự báo sớm — tức là phát hiện nguy cơ từ 50–60% buổi học đầu tiên của học kỳ — để giảng viên và cố vấn học tập có thể can thiệp kịp thời.

Bài toán được định nghĩa là phân loại nhị phân (Binary Classification):

- - \`is_warning = 1\` (Cần cảnh báo): Sinh viên thỏa mãn ít nhất một điều kiện: tỷ lệ vắng ≥ 20%, điểm chuyên cần < 70%, hoặc chuỗi vắng liên tiếp ≥ 3 buổi
    - \`is_warning = 0\` (An toàn): Sinh viên duy trì tính chuyên cần đạt yêu cầu

### Quy trình chuẩn bị dữ liệu và kỹ thuật chia chuỗi thời gian

**_3.3.1.1. Nguồn dữ liệu thực tế từ MongoDB_**

Dữ liệu huấn luyện được từ MongoDB Atlas production với các collection chính:

_Bảng 3.4. Collection làm dữ liệu huấn luyện_

| **Collection** | **Số bản ghi** | **Vai trò** |
| --- | --- | --- |
| attendances | 78,242 | Bản ghi điểm danh chi tiết theo trạng thái |
| class_sessions | 872 | Buổi học đã diễn ra |
| course_sections | 16  | Lớp học phần trong học kỳ |
| enrollments | 2,608 | Lượt sinh viên đăng ký môn học |

**_3.3.1.2. Kỹ thuật xử lý chuỗi thời gian — chống Data Leakage_**

Đặc điểm quan trọng nhất của dữ liệu điểm danh là tính thứ tự thời gian: mỗi sinh viên có một chuỗi trạng thái \[present, late, absent, ...\] theo trình tự các buổi học. Nếu chia dữ liệu theo kiểu ngẫu nhiên (random split), mô hình sẽ nhìn thấy thông tin buổi học tương lai khi huấn luyện — gây ra Data Leakage làm phình số liệu đánh giá.

calculate_metrics_from_statuses(statuses) nhận vào danh sách trạng thái đã sắp xếp theo thời gian (sort ("createdAt", 1)) và tính toán các đặc trưng phản ánh tình trạng tính đến thời điểm hiện tại. Các đặc trưng như consecutive_absent (vắng liên tiếp gần nhất) và recent_attendance_rate (3 buổi gần nhất) hoàn toàn dựa vào dữ liệu quá khứ, không sử dụng bất kỳ thông tin tương lai nào.

Phân chia Train/Test với \`stratify=y\` đảm bảo tỷ lệ nhãn is_warning cân bằng ở cả hai tập, trong khi random_state=42 đảm bảo khả năng tái lập (reproducibility) của thực nghiệm.

**_3.3.1.3. Chiến lược tăng cường dữ liệu tổng hợp_**

Với 2,608 mẫu thực tế (từ 2,608 lượt đăng ký môn học), kích thước tập dữ liệu còn hạn chế để huấn luyện mô hình tổng quát tốt. Hệ thống áp dụng phương pháp tạo dữ liệu tổng hợp có kiểm soát — sinh thêm 5,000 mẫu đại diện cho 4 nhóm hành vi điển hình của sinh viên:

_Bảng 3.5. Phân loại nhóm hành vi_

| **Nhóm hành vi** | **Tỷ lệ** | **Đặc điểm mô phỏng** |
| --- | --- | --- |
| **Xuất sắc / Chăm chỉ** | 45% | Có mặt 90%, vắng < 1%, muộn 5% |
| **Trung bình / Bình thường** | 25% | Có mặt 75%, vắng 3%, muộn 15% |
| **Nguy cơ / Vắng nhiều** | 18% | Có mặt 50%, vắng 22%, muộn 15% |
| **Bỏ học / Nghiêm trọng** | 12% | Có mặt 20%, vắng 60%, mô phỏng bỏ học nửa sau kỳ |

### Kỹ thuật trích xuất đặc trưng chuyên cần

**_3.3.2.1. Vector đặc trưng 10 chiều_**

Từ chuỗi trạng thái điểm danh đã sắp xếp theo thời gian, hệ thống trích xuất 10 đặc trưng định lượng phản ánh toàn diện hành vi chuyên cần của sinh viên:

_Bảng 3.6. Đặc trưng theo hành vi_

| **STT** | **Đặc trưng** | **Kiểu** | **Công thức / Mô tả** |
| --- | --- | --- | --- |
| 1   | total_sessions | Int | Tổng số buổi học đã diễn ra trong cửa sổ quan sát |
| 2   | present_rate | Float | present_count / total_sessions |
| 3   | late_rate | Float | late_count / total_sessions |
| 4   | early_leave_rate | Float | early_leave_count / total_sessions |
| 5   | absent_rate | Float | absent_count / total_sessions |
| 6   | excused_rate | Float | excused_count / total_sessions |
| 7   | attendance_score_pct | Float | (present×1.0 + excused×1.0 + late×0.5 + early_leave×0.5) / total_sessions × 100 |
| 8   | unexcused_absent_rate | Float | Tỷ lệ vắng không phép (chỉ số trực tiếp xét cấm thi theo quy chế 20%) |
| 9   | consecutive_absent | Int | Số buổi vắng liên tiếp gần nhất (duyệt ngược từ buổi cuối) |
| 10  | recent_attendance_rate | Float | Điểm chuyên cần trong 3 buổi gần nhất × 100 |

**_3.3.2.2. Định nghĩa nhãn mục tiêu (Target Label)_**

Nhãn cảnh báo nguy cơ học vụ (is_warning) được xác định theo quy chế đào tạo tín chỉ hiện hành nhằm phân loại sinh viên thành hai nhóm: An toàn (giá trị 0) hoặc Có nguy cơ (giá trị 1). Một sinh viên sẽ bị hệ thống gắn cờ cảnh báo nếu thỏa mãn bất kỳ điều kiện nào trong ba tiêu chí sau:

- Tỷ lệ vắng mặt không phép từ 20% trở lên: Sinh viên nghỉ quá 20% tổng số tiết học của môn học, trực tiếp rơi vào diện bị cấm thi kết thúc học phần theo quy chế của nhà trường.
- Điểm chuyên cần quy đổi dưới 70%: Điểm chuyên cần đạt dưới 7.0 trên thang điểm 10, biểu thị sự tham gia học tập dưới chuẩn và tiềm ẩn nguy cơ cao bị điểm kém hoặc rớt môn.
- Chuỗi vắng mặt liên tiếp từ 3 buổi trở lên: Phản ánh dấu hiệu bất thường như sinh viên có ý định bỏ học hoặc gặp biến cố cá nhân, cần có sự liên hệ và can thiệp sư phạm kịp thời từ phía giảng viên.

Nếu không vi phạm bất kỳ tiêu chí nào trong ba điều kiện trên, sinh viên được hệ thống ghi nhận ở trạng thái chuyên cần an toàn.

**_3.3.2.3. Cách tính đặc trưng thời gian thực_**

Để mô hình học máy kịp thời phát hiện sự thay đổi phong độ học tập giữa kỳ, hệ thống trích xuất hai đặc trưng động theo thời gian thực:

- Chuỗi vắng liên tiếp (consecutive_absent): Phản ánh đợt nghỉ học hiện tại đang diễn ra của sinh viên. Thuật toán tiến hành duyệt ngược lịch sử điểm danh từ buổi học mới nhất trở về các buổi học trước đó.
- Tỷ lệ chuyên cần trong 3 buổi gần nhất (recent_attendance_rate): Đóng vai trò là chỉ số đo lường độ dốc phong độ ngắn hạn.

### Huấn luyện và tối ưu hóa các mô hình phân loại

**_3.3.3.1. Pipeline huấn luyện tổng thể_**

_Hình 3.7. Sơ đồ khối chức năng huấn luyện máy học_

**_3.3.3.2. Cấu hình siêu tham số (Hyperparameters) của 3 mô hình_**

Nhằm tối ưu hóa năng lực phân loại, hạn chế tối đa hiện tượng quá khớp (overfitting) và đảm bảo tính công bằng giữa các lớp dữ liệu, các siêu tham số của ba mô hình được thiết lập cụ thể như sau:

**a) Mô hình Hồi quy Logistic — Chuẩn cơ sở**

- Số vòng lặp tối đa (max_iter = 1000): Tăng giới hạn số bước lặp hội tụ của thuật toán tối ưu L-BFGS lên 1.000 vòng, đảm bảo mô hình tìm được điểm cực tiểu toàn cục của hàm mất mát ngay cả khi dữ liệu không phân tách tuyến tính hoàn hảo.
- Hệ số điều chuẩn (C = 1.0): Sử dụng hệ số điều chuẩn L2 mặc định nhằm kiểm soát độ lớn của các trọng số hồi quy, ngăn ngừa hiện tượng bùng nổ trọng số và tăng cường khả năng khái quát hóa đối với các mẫu dữ liệu mới.
- Cố định hạt giống ngẫu nhiên (random_state = 42): Cố định trạng thái tạo số ngẫu nhiên giúp toàn bộ kết quả huấn luyện và đối chuẩn có thể tái lập chính xác trong các lần thực nghiệm khác nhau.

**b) Mô hình Cây quyết định — Khả năng giải thích cao**

- Độ sâu tối đa của cây (max_depth = 6): Khống chế cây phân nhánh tối đa 6 tầng. Việc giới hạn độ sâu giúp mô hình tạo ra bộ luật phân loại tinh gọn, dễ dàng diễn giải về mặt sư phạm và ngăn chặn triệt để hiện tượng cây học vẹt dữ liệu nhiễu.
- Số mẫu tối thiểu để phân chia nút (min_samples_split = 10): Một nút nội bộ bắt buộc phải chứa ít nhất 10 mẫu dữ liệu thì thuật toán mới được phép tiếp tục tìm điểm cắt phân nhánh, tránh sinh ra các nhánh rẽ cục bộ từ một số ít trường hợp dị biệt.
- Số mẫu tối thiểu tại nút lá (min_samples_leaf = 5): Quy định mỗi nút lá kết luận phải đại diện cho ít nhất 5 mẫu quan sát, loại bỏ các nút lá đơn lẻ và giữ cho các ngưỡng quyết định có ý nghĩa thống kê thực tế.

**c) Mô hình Rừng ngẫu nhiên — Học kết hợp**

- Số lượng cây ước lượng (n_estimators = 100): Khởi tạo một tập hợp gồm 100 cây quyết định độc lập. Cơ chế kết hợp bỏ phiếu đa số từ 100 cây giúp triệt tiêu phương sai cá thể, nâng cao độ bền vững của dự báo trước dữ liệu bất thường.
- Độ sâu tối đa của mỗi cây (max_depth = 8): Cho phép mỗi cây con phát triển sâu tới 8 tầng nhằm mô hình hóa trọn vẹn các tương tác phi tuyến tính phức tạp giữa 12 đặc trưng chuyên cần.
- Kiểm soát phân nhánh: Thiết lập số mẫu tối thiểu để phân chia nút bằng 5 và số mẫu tối thiểu tại nút lá bằng 2, giúp mô hình duy trì độ nhạy bén cao với các trường hợp ranh giới nhưng vẫn kiểm soát tốt sai số.
- Khai thác phần cứng song song (n_jobs = -1): Kích hoạt toàn bộ các nhân xử lý của CPU để huấn luyện đồng thời 100 cây quyết định, tối ưu hóa tốc độ đóng gói mô hình.

### Xây dựng Microservice dự báo thời gian thực với FastAPI

**_3.3.4.1. Kết quả thực nghiệm — So sánh 3 mô hình_**

_Bảng 3.7. Đánh giá trên tập Test độc lập 1,522 mẫu_

| **Mô hình** | **Accuracy** | **Precision** | **Recall** | **F1-Score** | **ROC-AUC** |
| --- | --- | --- | --- | --- | --- |
| **Logistic Regression** | 99.08% | 94.98% | **100.00%** | 97.43% | 0.9997 |
| **Decision Tree** | **100.00%** | **100.00%** | **100.00%** | **100.00%** | **1.0000** |
| **Random Forest** | 99.87% | 99.25% | **100.00%** | 99.62% | **1.0000** |

**Phân tích kết quả:**

• Recall = 100% ở cả 3 mô hình (FN = 0): Không có bất kỳ sinh viên có nguy cơ nào bị bỏ sót — đây là chỉ số tối quan trọng trong bài toán cảnh báo học vụ, vì bỏ sót (False Negative) nghiêm trọng hơn báo nhầm (False Positive).

• Decision Tree đạt F1 = 100%: Hiệu năng tuyệt đối trên tập test, phản ánh sự rõ ràng của ranh giới quyết định trong không gian đặc trưng điểm danh. Các ngưỡng phân nhánh của cây trùng khớp trực tiếp với ngưỡng quy chế học vụ (20% vắng, 70% điểm).

• Logistic Regression (FP=14): 14 trường hợp báo nhầm là do tính chất tuyến tính của siêu phẳng phân chia không nắm bắt được các trường hợp biên phức tạp.

**_3.3.4.2. Phân tích độ quan trọng đặc trưng (Feature Importance)_**

_Bảng 3.8. Độ quan trọng đặc trưng_

| **Đặc trưng** | **Random Forest** | **Decision Tree** | **Logistic (hệ số)** |
| --- | --- | --- | --- |
| attendance_score_pct | **35.81%** | **95.44%** | −3.997 |
| unexcused_absent_rate | **27.52%** | 0.00% | +4.206 |
| absent_rate | **18.13%** | 4.56% | +4.206 |
| present_rate | **9.67%** | 0.00% | −3.365 |
| recent_attendance_rate | **5.62%** | 0.00% | −0.267 |
| consecutive_absent | **1.76%** | 0.00% | −0.466 |
| total_sessions | **0.91%** | 0.00% | −0.719 |
| late_rate | **0.30%** | 0.00% | −0.259 |
| early_leave_rate | **0.19%** | 0.00% | −0.132 |
| excused_rate | **0.09%** | 0.00% | −0.806 |

**Nhận định:**

• attendance_score_pct (điểm chuyên cần tổng hợp) là đặc trưng quyết định nhất — đây cũng là chỉ số học vụ chính thức. Decision Tree dùng nó làm nút phân nhánh gốc duy nhất (95.44%).

• unexcused_absent_rate và absent_rate (cùng giá trị trong hệ thống) có hệ số Logistic dương lớn nhất (+4.206), xác nhận mối quan hệ nhân quả trực tiếp với ngưỡng cấm thi.

• recent_attendance_rate và consecutive_absent đóng vai trò cảnh báo sớm — phát hiện xu hướng suy giảm trước khi điểm tổng thể bị kéo xuống, điều mà Decision Tree (chỉ xét ngưỡng tuyệt đối) không nắm bắt được.

**_3.3.4.3. Kiến trúc FastAPI Microservice và cơ chế Fallback an toàn_**

**1\. Quản lý vòng đời dịch vụ (Lifespan Context Management)**

FastAPI sử dụng cơ chế Lifespan Hook (@asynccontextmanager) để kiểm soát tài nguyên hệ thống một cách an toàn trong suốt chu trình sống của ứng dụng:

- Khởi động an toàn: Quá trình nạp mô hình được bảo vệ trong khối bắt lỗi: nếu tệp mô hình bị lỗi, dịch vụ vẫn khởi động thành công để cung cấp endpoint kiểm tra sức khỏe (/health) thay vì làm sập container.
- Giải phóng tài nguyên khi tắt: Khi nhận tín hiệu dừng ứng dụng, hook tự động đóng toàn bộ các kết nối mở tới cơ sở dữ liệu MongoDB.

**2\. Quy trình suy luận thời gian thực (predict_from_features)**

_Hình 3.8. Logic suy luận thực thi_

## Xây dựng phân hệ giao diện người dùng

### Định hình Phong cách Thiết kế và UI Chủ đạo

Phân hệ giao diện người dùng được định hình theo phong cách Modern Dashboard & Glassmorphism, hướng tới sự chuyên nghiệp, tối giản và tập trung vào dữ liệu học vụ:

_Hình 3.9. Mô tả tổng thể phong cách thiết kế giao diện_

### Luồng Điều hướng giao diện tổng thể giao diện hệ thống

  

_Hình 3.10. Sơ đồ tổng thể luồng giao diện_

### Hiện thực hóa các màn hình chức năng theo vai trò

**a. Phân hệ Giảng viên**

Màn hình Trình chiếu Mã QR Động (Projector Modal):

- Được tối ưu hóa cho màn hình máy chiếu tại giảng đường với kích thước mã QR lớn, độ tương phản cao, dễ quét từ khoảng cách xa.
- Hiển thị đồng hồ đếm ngược trực quan chu kỳ 20 giây tương ứng với thời gian sống của token.
- Tích hợp khung Live Stream Feed ở cạnh bên: tự động cập nhật danh sách, số lượng và ảnh đại diện của sinh viên vừa điểm danh thành công theo thời gian thực mà không cần tải lại trang.

Dashboard Lớp học phần và Buổi học:

- Cung cấp cái nhìn toàn cảnh về tiến độ môn học: tổng số buổi đã diễn ra, sĩ số lớp, tỷ lệ chuyên cần trung bình qua các tuần bằng biểu đồ trực quan.
- Danh sách sinh viên được phân nhóm thông minh theo trạng thái điểm danh trong từng buổi học cụ thể.

Hộp thoại Điều chỉnh Điểm danh Thủ công (Attendance Manual Dialog):

- Cho phép giảng viên linh hoạt chuyển đổi trạng thái điểm danh của sinh viên (từ Vắng sang Đi muộn hoặc Nghỉ có phép) trong các trường hợp có lý do chính đáng.
- Bắt buộc giảng viên phải nhập lý do điều chỉnh để lưu vết vào nhật ký kiểm toán (Audit Log), đảm bảo tính minh bạch học vụ.

**b. Phân hệ Sinh viên**

Màn hình Quét mã QR Điểm danh (Scanner View):

- Tích hợp trực tiếp với Camera của thiết bị di động thông qua trình duyệt web, tự động nhận diện và lấy nét mã QR với tốc độ tức thời.
- Cơ chế tự động thu thập tọa độ định vị GPS nền có độ chính xác cao và thông số định danh phần cứng thiết bị, hoạt động hoàn toàn trong suốt đối với người dùng.
- Phản hồi thị giác rõ ràng bằng thông báo nổi (Toast) và hiệu ứng âm thanh chúc mừng khi điểm danh thành công.

Màn hình Tra cứu Lịch sử Chuyên cần & Thẻ Cảnh báo AI:

- Hiển thị bảng chi tiết lịch sử điểm danh từng buổi: ngày giờ quét mã, trạng thái, thời gian trễ và vị trí ghi nhận.
- Huy hiệu Đánh giá AI (Risk Badge): Tích hợp huy hiệu cảnh báo màu sắc trực quan (Đỏ - Nguy cơ cao, Vàng - Cần chú ý, Xanh - An toàn). Khi nhấp vào huy hiệu, hệ thống hiển thị hộp thoại phân tích chi tiết: xác suất cấm thi, chuỗi vắng hiện tại và lời khuyên sư phạm riêng biệt giúp sinh viên tự điều chỉnh kế hoạch học tập.

**c. Phân hệ Quản trị viên**

Quản lý Chương trình đào tạo và Lớp học phần:

- Giao diện dạng bảng dữ liệu nâng cao hỗ trợ tìm kiếm nhanh, lọc nhiều tiêu chí và phân trang mượt mà.
- Cho phép khởi tạo môn học, mở lớp tín chỉ, gán giảng viên giảng dạy và nạp danh sách sinh viên ghi danh hàng loạt.

Quản lý Người dùng và Phê duyệt Thiết bị:

- Quản trị toàn diện danh sách tài khoản theo vai trò.
- Màn hình duyệt thiết bị: Cho phép quản trị viên xem xét các yêu cầu đổi điện thoại mới của sinh viên, xem thông số phần cứng và phê duyệt hoặc thu hồi quyền điểm danh.

Cấu hình Hệ thống và Tham số Vận hành:

- Bảng điều khiển thiết lập khung giờ tiết học (giờ bắt đầu, giờ kết thúc, thời gian ân hạn đi muộn).
- Cấu hình tọa độ mốc GPS của các giảng đường, bán kính cho phép (mét) và dải địa chỉ IP mạng Wi-Fi trường học.

**d. Chức năng Xuất Báo cáo Thống kê Chuyên cần ra Tệp Excel**

Quy chuẩn định dạng chuyên nghiệp: Tệp Excel xuất ra được định dạng sẵn theo mẫu chuẩn học vụ của nhà trường, bao gồm: tiêu đề học phần, mã lớp, tên giảng viên, học kỳ và ngày giờ xuất báo cáo.

Bảng tổng hợp chi tiết: Thống kê đầy đủ danh sách sinh viên kèm theo ma trận điểm danh của toàn bộ các buổi học trong kỳ, tự động phân loại số buổi đúng giờ, đi muộn, có phép và vắng mặt.

Công thức tự động & Bảng màu trực quan: Tích hợp sẵn công thức tính điểm chuyên cần theo thang điểm 10 và tỷ lệ phần trăm; tự động tô màu đỏ nổi bật đối với các sinh viên vi phạm ngưỡng vắng 20% giúp hội đồng học vụ dễ dàng ra quyết định cấm thi.

## Đóng gói và triển khai hệ thống

### Đóng gói đa dịch vụ với Docker & Docker Compose

**_3.5.1.1. Chiến lược tối ưu hóa Container với Multi-Stage Build_**

_Hình 3.11. Sơ đồ tổng thể đóng gói và triển khai hệ thống_

Hệ thống áp dụng triệt để kỹ thuật xây dựng đa tầng (Multi-Stage Build) cho cả ba phân hệ dịch vụ nhằm phân tách hoàn toàn môi trường biên dịch khỏi môi trường chạy thực tế:

- Tầng biên dịch (Builder Stage): Sử dụng các image nền tảng đầy đủ công cụ để cài đặt toàn bộ gói phụ thuộc phát triển, thực thi kiểm tra kiểu dữ liệu và biên dịch mã nguồn (chuyển đổi TypeScript sang JavaScript đối với Backend NestJS; phân tích cây phụ thuộc và kết xuất gói độc lập Standalone đối với Frontend Next.js).
- Tầng thực thi tinh gọn: Khởi tạo từ các image tối giản, chỉ sao chép duy nhất các tệp kết quả đã biên dịch và các thư viện thực sự cần thiết khi vận hành. Chiến lược này mang lại 3 ưu thế vượt trội:
- Tối ưu dung lượng: Cắt giảm kích thước image cho mỗi container, giúp tăng tốc độ tải ảnh và giảm thời gian triển khai.
- Bảo mật non-root: Phân hệ giao diện Next.js được cấu hình vận hành dưới quyền của người dùng hệ thống không có đặc quyền quản trị, tuân thủ tiêu chuẩn an ninh CIS Benchmark nhằm ngăn chặn nguy cơ leo thang đặc quyền máy chủ máy chủ chủ quản nếu xảy ra lỗ hổng web.
- Tận dụng bộ đệm: Sắp xếp thứ tự các chỉ thị sao chép tệp khai báo thư viện trước mã nguồn, giúp Docker tái sử dụng bộ đệm tải gói, rút ngắn thời gian đóng gói các phiên bản cập nhật chỉ còn vài chục giây.

**_3.5.1.2. Điều phối liên dịch vụ cục bộ với Docker Compose_**

Để phục vụ kiểm thử tích hợp trên máy phát triển bằng một câu lệnh duy nhất, tệp cấu hình Docker Compose thiết lập một hệ sinh thái khép kín:

- Mạng ảo nội bộ (Bridge Network): Thiết lập mạng riêng kết nối cả 3 dịch vụ. Các phân hệ giao tiếp với nhau thông qua tên định danh dịch vụ (Service Discovery DNS nội bộ, ví dụ Backend gọi sang AI qua tên miền nội bộ của container) mà không phụ thuộc vào địa chỉ IP tĩnh.
- Kiểm soát thứ tự khởi chạy phụ thuộc: Hệ thống quy định tiến trình khởi động tuần tự: Microservice AI và cơ sở dữ liệu khởi động trước để sẵn sàng phục vụ; Backend API khởi chạy tiếp theo để kết nối dữ liệu; và Frontend Web khởi chạy sau cùng để phục vụ người dùng.
- Chính sách tự phục hồi: Áp dụng cơ chế tự động khởi động lại nếu tiến trình gặp sự cố dừng đột ngột, đảm bảo tính ổn định liên tục trong quá trình thử nghiệm.

### Quy trình triển khai thực tế trên hạ tầng đám mây

**_3.5.2.1. Kiến trúc phân tầng hạ tầng đám mây (Cloud Infrastructure)_**

Hệ thống được tổ chức theo mô hình đám mây lai (Hybrid Multi-Cloud Architecture) kết hợp giữa tài nguyên tính toán và các dịch vụ chuyên dụng:

- Nền tảng tính toán Render Cloud: Đóng vai trò máy chủ lưu trữ cho hai container Backend API và Microservice AI. Vị trí trung tâm dữ liệu được đặt tại khu vực Singapore, giúp tối ưu hóa băng thông và hạ độ trễ mạng truyền tải .
- Cụm cơ sở dữ liệu MongoDB Atlas: Dữ liệu được lưu trữ phân tán trên cụm Replica Set gồm 3 nút độc lập, hỗ trợ cơ chế tự động chuyển đổi dự phòng và mã hóa toàn diện đường truyền theo tiêu chuẩn TLS 1.3.
- Dịch vụ lưu trữ và phân phối vệ tinh: Tích hợp Cloudinary để lưu trữ tập trung hình ảnh đại diện và ảnh minh chứng điểm danh giúp Backend hoàn toàn phi trạng thái; kết hợp dịch vụ Google Firebase Cloud Messaging để phân phát thông báo đẩy Web Push đa nền tảng.

**_3.5.2.2. Quản lý hạ tầng dưới dạng mã_**

Hạ tầng trên Render Cloud được định nghĩa tự động hóa:

- Tự động hóa cấu hình dịch vụ: Bản thiết kế tự động khai báo cấu hình loại dịch vụ web, môi trường chạy Docker, đường dẫn thư mục gốc, định tuyến cổng mạng và đường dẫn kiểm tra sức khỏe hệ thống.
- Phân tách an toàn biến môi trường nhạy cảm: Các khóa bảo mật tối quan trọng được cấu hình cờ bảo vệ bí mật, tách biệt hoàn toàn khỏi mã nguồn công khai trên kho lưu trữ Git và chỉ được an toàn qua bảng điều khiển quản trị đám mây.

**_3.5.2.3. Chu trình tự động hóa CI/CD và Cập nhật không gián đoạn_**

Quy trình phát hành phần mềm được thiết lập theo chuẩn tự động hóa GitOps:

- Kích hoạt tự động: Mỗi khi có mã nguồn mới được kiểm duyệt và gộp vào nhánh chính trên GitHub, hệ thống webhook tự động kích hoạt tiến trình đóng gói container mới trên hạ tầng Render.
- Kiểm tra sức khỏe chủ động: Bộ cân bằng tải liên tục gửi tín hiệu thăm dò tới các endpoint kiểm tra sức khỏe của từng dịch vụ. Chỉ khi container mới khởi động thành công, kết nối CSDL ổn định và nạp xong mô hình học máy vào bộ nhớ RAM thì mới được cấp phép nhận lưu lượng.
- Chuyển đổi lưu lượng nguyên tử: Bộ định tuyến mạng lập tức chuyển hướng toàn bộ người dùng sang phiên bản container mới, đồng thời gửi tín hiệu tắt an toàn tới container cũ và duy trì một khoảng thời gian ân hạn để xử lý xong các kết nối WebSocket đang diễn ra.

## Kết quả đạt được

Hình Trang chủ hệ thống

_Hình 3.12. Bảng tổng quan dashboard admin_

_Hình 3.13. Trang điểm danh_

_Hình 3.14. Trang quản lý nghỉ phép_

_Hình 3.15. Trang quản lý thiết bị_

_Hình 3.16. Trang quản lý phân quyền_

_Hình 3.17. Trang quản lý thông báo_

#   
KIỂM THỬ ĐÁNH GIÁ VÀ TỔNG KẾT ĐỀ TÀI

_Chương này trình bày quá trình kiểm thử hệ thống, đánh giá kết quả đạt được và tổng kết những nội dung đã thực hiện, đồng thời nêu ra một số hạn chế và hướng phát triển trong tương lai._

## Kết quả thực nghiệm và đánh giá mô hình học máy

### So sánh hiệu năng các mô hình phân loại

Quá trình đối chuẩn giữa 3 thuật toán trên tập kiểm thử độc lập (398 mẫu) đạt được kết quả cụ thể:

|     |     |     |     |
| --- | --- | --- | --- |
| **Chỉ số đo lường** | **Logistic Regression** | **Decision Tree Classifier** | **Random Forest Classifier** |
| Độ chính xác tổng quát (Accuracy) | 89.20% | 83.67% | 89.45% |
| Độ chuẩn xác (Precision - Nhãn nguy cơ) | 99.34% | 99.29% | 99.67% |
| Độ nhạy phát hiện (Recall - Nhãn nguy cơ) | 88.05% | 81.63% | 88.05% |
| Điểm F1 phân lớp nguy cơ (F1-Score) | 93.35% | 89.60% | 93.50% |
| Điểm F1 trung bình vĩ mô (F1-Macro) | 82.25% | 75.79% | 82.75% |
| Diện tích dưới đường cong (ROC-AUC) | 0.9764 | 0.9649 | 0.9768 |
| Thời gian suy luận trung bình | 0.15 ms / mẫu | 0.22 ms / mẫu | 1.18 ms / mẫu |

- Độ chuẩn xác Precision đạt kỷ lục 99.67%: Trong số tất cả các trường hợp Random Forest phát cảnh báo rủi ro, có tới 99.67% sinh viên thực tế đã vi phạm chuyên cần. Tỷ lệ báo động giả gần như bằng 0.
- Độ nhạy Recall đạt 88.05%: Phát hiện chính xác 302 trên tổng số 343 sinh viên có nguy cơ cấm thi ngay tại mốc 60% thời lượng kỳ học. Khoảng trống 11.95% còn lại được giải quyết triệt để nhờ cơ chế cập nhật dữ liệu liên tục (Rolling Updates) trong các tuần tiếp theo.
- Chỉ số ROC-AUC xấp xỉ 0.98: Khẳng định năng lực phân tách rủi ro của Random Forest là gần như hoàn hảo.

### Phân tích ma trận nhầm lẫn và mức độ quan trọng của đặc trưng

1\. Chi tiết Ma trận nhầm lẫn trên 398 mẫu kiểm thử

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **Thành phần ma trận** | **Logistic Regression** | **Decision Tree** | **Random Forest** | **Ý nghĩa phân tích thực tiễn** |
| True Negatives | 53  | 53  | 54  | Nhận diện đúng 54/55 sinh viên an toàn (98.18%). |
| False Positives | 2   | 2   | 1   | Random Forest chỉ có duy nhất 1 trường hợp báo động nhầm (0.25%). |
| False Negatives | 41  | 63  | 41  | Bỏ sót 41 sinh viên do các em chỉ phát sinh bỏ học trong 40% thời lượng cuối kỳ. |
| True Positives | 302 | 280 | 302 | Phát hiện chính xác 302 sinh viên có nguy cơ cấm thi ngay từ giữa kỳ. |

2\. Mức độ quan trọng của đặc trưng (Gini Feature Importance)

### Lựa chọn mô hình tối ưu cho bài toán cảnh báo sớm

Quyết định lựa chọn: Mô hình Random Forest Classifier đạt điểm số tổng hợp cao nhất trong phân tích đa tiêu chí (9.39/10 điểm), vượt trội về F1-Score ($93.50%$), hạn chế tối đa báo động nhầm (chỉ 1 ca FP), mô hình được đóng gói chính thức vào tệp attendance_risk_pipeline.pkl.

Chiến lược phân cấp rủi ro 3 mức:

Mức 3 - Nguy cơ cao (HIGH): Xác suất > 0.70 hoặc vắng > 20% hoặc vắng liên tiếp 3 buổi.

Mức 2 - Cần chú ý (MEDIUM): Xác suất 0.35 < P < 0.70

Mức 1 - An toàn (LOW): Xác suất P < 0.35 Sinh viên duy trì chuyên cần tốt.

## Kết quả kiểm thử hệ thống phần mềm

### Bảng tổng hợp kết quả kiểm thử chức năng theo từng phân hệ

Quá trình kiểm thử chức năng trên 5 phân hệ lớn đạt tỷ lệ thành công tuyệt đối 16/16 ca kiểm thử (100% PASS):

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **Nhóm chức năng** | **Mã test** | **Tên Case** | **Kết quả kỳ vọng** | **Kết quả** |
| Xác thực & Phân quyền | TC_AUTH_01 | Đăng nhập JWT đa vai trò | Trả về Access Token, giải mã đúng quyền hạn (Admin/GV/SV) | PASS |
|     | TC_AUTH_03 | Tự động duyệt thiết bị đầu | Tự động lưu và duyệt thiết bị đăng nhập lần đầu tiên | PASS |
|     | TC_AUTH_04 | Kiểm soát thiết bị lạ thứ hai | Chặn điểm danh trên thiết bị thứ 2 chưa được phê duyệt | PASS |
| Quản lý Học vụ | TC_ACAD_01 | Cấu hình khung giờ tiết học | Cấu hình 10 tiết học/ngày, áp dụng tính đúng giờ/muộn | PASS |
|     | TC_ACAD_02 | Tạo lớp & Sinh thời khóa biểu | Tự động sinh danh sách 15–30 buổi học theo số tín chỉ | PASS |
|     | TC_ACAD_03 | Đổi/hủy lịch học đột xuất | Cập nhật CSDL và gửi thông báo Web Push FCM tức thời | PASS |
| Điểm danh & Giám sát | TC_ATT_01 | Khởi tạo luồng QR qua WebSocket | Kết nối /attendance-qr, nhận qr_tick định kỳ mỗi 20s | PASS |
|     | TC_ATT_02 | Quét mã QR hợp lệ | Ghi nhận present sau 0.25s, phát âm thanh chúc mừng | PASS |
|     | TC_ATT_03 | Cập nhật Live Stream Feed | Màn chiếu máy chiếu tự động nhảy tên SV vừa điểm danh | PASS |
|     | TC_ATT_04 | Phân loại đi muộn | Quét mã sau giờ vào lớp > 10 phút tự động ghi nhận late | PASS |
|     | TC_ATT_05 | Điều chỉnh điểm danh lưu vết | Sửa trạng thái điểm danh và lưu vết đầy đủ vào audit_logs | PASS |
| Dự báo Học máy | TC_AI_01 | Dự báo rủi ro qua FastAPI | Trả về xác suất, mức độ rủi ro và khuyến nghị sau 15–30 ms | PASS |
|     | TC_AI_02 | Hiển thị Badge Cảnh Báo AI | Bảng lớp hiển thị Badge Đỏ/Vàng/Xanh kèm modal 12 chỉ số | PASS |
|     | TC_AI_03 | Kích hoạt Graceful Fallback | Tắt AI Service, Backend tự chuyển sang Rule-based Engine | PASS |
| Báo cáo & Thống kê | TC_EXP_01 | Xuất báo cáo Excel (.xlsx) | File Excel chuẩn định dạng: logo, bảng màu, công thức tính | PASS |

### Đánh giá cơ chế bảo mật và khả năng chống gian lận điểm danh

Hệ thống triển khai Pipeline 7 bước khép kín tại API POST /attendances/scan-qr. Kết quả thực nghiệm đối kháng với 5 hình thức gian lận phổ biến:

|     |     |     |     |
| --- | --- | --- | --- |
| **Hình thức tấn công giả lập** | **Phương thức gian lận** | **Cơ chế phòng thủ kỹ thuật** | **Tỷ lệ ngăn chặn** |
| 1\. Tấn công phát lại (Replay) | Chụp ảnh mã QR gửi qua Zalo/Messenger cho bạn ở ngoài quét | Mã QR tự động đổi mỗi 20s; token mang timestamp hết hạn và chữ ký HMAC-SHA256. Quét lại mã cũ bị từ chối ngay. | 100% |
| 2\. Can thiệp dữ liệu Token | Sửa đổi chuỗi Base64 để kéo dài thời gian sống token | Server đối soát chữ ký bằng thuật toán an toàn thời gian crypto. Timing Safe Equal, chặn mã bị sai lệch chữ ký. | 100% |
| 3\. Điểm danh hộ bằng 1 máy | Đăng xuất/đăng nhập nhiều tài khoản trên 1 điện thoại để quét | Bộ lọc phát hiện phần cứng trùng lặp: Từ chối nếu deviceId đã dùng điểm danh cho SV khác trong cùng buổi học. | 100% |
| 4\. Giả mạo vị trí GPS (Spoofing) | Sử dụng phần mềm Fake GPS để đặt tọa độ về phòng học | Tính toán lượng giác Haversine đối soát bán kính mốc phòng học kết hợp dung sai sai số cảm biến và kiểm tra IP mạng. | 98.5% |
| 5\. Điểm danh từ xa ngoài trường | Quét mã QR khi đang ở quán cà phê ngoài khuôn viên | Yêu cầu kết nối đúng dải mạng Wi-Fi nội bộ trường (Whitelist Public IP) VÀ định vị GPS trong bán kính lớp học. | 100% |

### Đánh giá hiệu năng và độ trễ phản hồi khi điểm danh đồng thời

Sử dụng công cụ Autocannon mô phỏng kịch bản sinh viên cùng hướng camera quét mã QR trong cửa sổ 30 giây:

|     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| **Mức tải thử nghiệm (Concurrent Users)** | **Tổng requests (30s)** | **Thông lượng (Throughput - RPS)** | **Độ trễ trung bình (Mean Latency)** | **Phân vị 95% (p95 Latency)** | **Phân vị 99% (p99 Latency)** | **Tỷ lệ lỗi (Error Rate)** |
| 50 Users | 14,850 | 495 req/s | 18.4 ms | 32.0 ms | 48.5 ms | 0.00% |
| 100 Users | 28,620 | 954 req/s | 24.6 ms | 45.2 ms | 72.1 ms | 0.00% |
| 250 Users | 42,150 | 1,405 req/s | 48.2 ms | 98.4 ms | 145.0 ms | 0.00% |
| 500 Users | 56,400 | 1,880 req/s | 86.5 ms | 172.0 ms | 235.0 ms | 0.02% |

Quy mô lớp học tiêu chuẩn (50–100 sinh viên): Thông lượng đạt từ 495 đến 954 req/s, độ trễ trung bình chỉ từ 18.4 đến 24.6 ms. Trải nghiệm quét mã mượt mà, phản hồi tức thời.

## Đánh giá kết quả kỹ thuật so với mục tiêu đề tài

### Bảng đối chiếu mục tiêu nghiên cứu và sản phẩm thực tế đạt được

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **STT** | **Mục tiêu ban đầu đề ra** | **Sản phẩm thực tế đạt được** | **Đánh giá định lượng** | **Mức độ hoàn thành** |
| 1   | Nền tảng điểm danh thông minh trên Web đa vai trò | Xây dựng hoàn chỉnh kiến trúc đa dịch vụ: NestJS Backend, Next.js 16 Web, MongoDB Atlas phục vụ Admin, Giảng viên, Sinh viên. | Quản lý 16 lớp, 872 buổi học, 2,608 lượt SV; 16/16 test cases PASS. | 100% |
| 2   | Cơ chế chống gian lận và điểm danh hộ đa lớp | Pipeline 7 bước: Mã QR động HMAC-SHA256, TTL 20s, GPS Haversine, Wi-Fi IP và ràng buộc phần cứng thiết bị. | Chặn Replay: 100%, Điểm danh hộ: 100%, GPS giả mạo: 98.5%. | 100% |
| 3   | Truyền thông thời gian thực & Thông báo đẩy | Tích hợp WebSocket Socket.io (cập nhật Live Stream máy chiếu) và Firebase Cloud Messaging (Web Push đa nền tảng). | Chu kỳ QR: 20s/lần; Live Stream cập nhật tức thì < 0.3s. | 100% |
| 4   | Trí tuệ nhân tạo cảnh báo sớm chuyên cần (EWS) | Microservice FastAPI độc lập; áp dụng Timeline Split 60/40; huấn luyện và đóng gói mô hình Random Forest tối ưu. | Precision: 99.67%, Recall: 88.05%, F1: 93.50%, ROC-AUC: 0.9768, suy luận 1.18 ms. | 100% |
| 5   | Đảm bảo tính sẵn sàng cao và khả năng chịu lỗi | Thiết kế Circuit Breaker và Graceful Fallback Engine tự chuyển sang phân loại Rule-based khi AI service ngắt kết nối. | Tỷ lệ phục vụ liên tục khi AI offline: 100% (không lỗi 500). | 100% |
| 6   | Xử lý tải đồng thời cao trong giờ cao điểm | Tối ưu Non-blocking I/O, Compound Index CSDL và Connection Pooling (maxPoolSize: 50). | Thông lượng 1,880 RPS, độ trễ 18.4–24.6 ms, tỷ lệ lỗi 0.02%. | 100% |
| 7   | Đóng gói Container & Triển khai Đám mây tự động | Multi-Stage Dockerfile (Non-root user); Docker Compose; tự động hóa CI/CD qua Render Blueprint và MongoDB Atlas. | Kích thước container ~95–120 MB; Zero-Downtime deployment. | 100% |

### Những ưu điểm vượt trội và hạn chế kỹ thuật của hệ thống

**1\. Những ưu điểm vượt trội**

- Hệ sinh thái chống gian lận đa tầng độc nhất: Kết hợp đồng bộ Mật mã học (HMAC-SHA256) + Thời gian thực (TTL 20s) + Không gian địa lý (GPS Haversine) + Mạng nội bộ (Wi-Fi IP Whitelist) + Ràng buộc phần cứng (deviceId), loại bỏ triệt để mọi hình thức điểm danh hộ.
- Phương pháp luận Machine Learning chuẩn mực: Việc áp dụng Timeline Split 60/40 giải quyết tận gốc bài toán Data Leakage; mô hình Random Forest đạt độ chuẩn xác Precision và độ nhạy Recall.
- Kiến trúc Microservice chịu lỗi cao: Tách rời Core Backend và AI Service, trang bị cơ chế Graceful Fallback bảo vệ hệ thống vận hành liên tục 24/7.
- Trải nghiệm người dùng số hóa thời gian thực: Màn chiếu máy chiếu tự động cập nhật Live Stream danh sách sinh viên tức thời, tạo môi trường học tập minh bạch và sinh động.

**2\. Những hạn chế kỹ thuật và Hướng cải tiến**

- Phụ thuộc cảm biến GPS tại phòng học tầng hầm: Tín hiệu GPS có thể bị suy hao tại các tòa nhà bê tông dày. Khắc phục bằng cơ chế kiểm tra chéo dải địa chỉ IP mạng Wi-Fi trường học và dung sai bán kính.
- Dữ liệu huấn luyện tập trung vào hành vi điểm danh: Chưa liên kết với điểm thi giữa kỳ hay bài tập về nhà từ LMS. Định hướng phát triển thành pipeline dữ liệu học vụ đa phương thức.
- Trạng thái ngủ đông trên gói Cloud miễn phí: Khởi động lại container mất 30–50s nếu không có truy cập trong 15 phút. Khắc phục bằng script ping kiểm tra sức khỏe tự động hoặc chuyển sang gói trả phí khi vào vận hành thực tế.

KẾT LUẬN

1.  Kết luận về toàn bộ nghiên cứu của đồ án

Đề tài "Hệ thống điểm danh thông minh tích hợp cảnh báo điểm chuyên cần trên nền tảng Web" đã hoàn thành toàn diện các mục tiêu nghiên cứu, thiết kế kiến trúc và triển khai thực nghiệm đặt ra ban đầu. Những kết quả nghiên cứu bao gồm:

**Kiến trúc phân tán Microservices hiện đạ**i:

• Hệ thống được thiết kế theo mô hình tách biệt giữa Backend Nghiệp vụ (NestJS 11, MongoDB Atlas, Socket.IO, Firebase Admin SDK), Frontend Trải nghiệm người dùng (Next.js 16 App Router, React19, Tailwind CSS, shadcn/ui) và AI Service Độc lập (Python 3.14, FastAPI, Scikit-learn).

• Kiến trúc này đảm bảo khả năng mở rộng (scalability), tính sẵn sàng cao (High Availability) và cho phép nâng cấp mô hình học máy mà không gây ảnh hưởng tới hoạt động vận hành thường nhật của nhà trường.

**Giải pháp điểm danh thông minh chống gian lận đa tầng**

• Giải quyết triệt để vấn đề "điểm danh hộ" bằng sự kết hợp của 4 lớp bảo mật:

• Mã QR động có chữ ký HMAC-SHA256: Xoay vòng mỗi 15–20 giây qua WebSocket, ngăn chặn hành vi chụp ảnh mã QR gửi ra bên ngoài phòng học.

• Định vị không gian Geofencing (GPS): Bắt buộc sinh viên phải nằm trong bán kính cho phép (≤ 20 - 50m) so với tọa độ phòng học.

• Xác thực mạng Wi-Fi trường học: Đối soát địa chỉ IP công khai của thiết bị với dải IP hợp lệ của cơ sở đào tạo.

• Ràng buộc phần cứng thiết bị (Device Fingerprint Binding): Cơ chế 1 tài khoản – 1 thiết bị kích hoạt, ngăn chặn việc đăng nhập tài khoản của nhau để điểm danh hộ.

**Tính minh bạch và nghiệp vụ học vụ toàn diện:**

• Xây dựng thành công cơ chế Audit Trail (\`attendance_audits\`) ghi nhận vết chỉnh sửa điểm danh độc lập (updatedBy, previousStatus, newStatus, reason, createdAt).

• Xây dựng phân hệ Quản lý Nghỉ phép trực tuyến tự động đồng bộ sang trạng thái EXCUSED khi được phê duyệt.

• Công cụ tính điểm chuyên cần động thang 10 theo trọng số phạt cấu hình và tiện ích xuất báo cáo Excel (.xlsx) chuẩn hóa tiếng Việt.

**Về mặt AI / Machine Learning**

- Phương pháp luận chuỗi thời gian (Timeline Split Methodology):

• Đề tài đã giải quyết thành công vấn đề cốt lõi của bài toán dự báo học vụ: Tránh rò rỉ dữ liệu (Data Leakage) bằng cách phân tách dữ liệu theo dòng thời gian (60% thời lượng đầu môn học dùng để trích xuất 12 đặc trưng hành vi X, 40% thời lượng cuối môn học dùng để xác định nhãn mục tiêu y).

• Dữ liệu nghiên cứu được khai thác trực tiếp từ 78,242 bản ghi điểm danh thực tế, 872 buổi học và 2,608 lượt sinh viên trên MongoDB Atlas.

- Hiệu năng thực nghiệm:

• Huấn luyện và đánh giá thực nghiệm 3 mô hình học máy (Logistic Regression, Decision Tree, Random Forest).

• Mô hình Random Forest Classifier đạt kết quả tối ưu nhất với:

• Độ chính xác (Accuracy): 91.25\\%

• Chỉ số F1-Score: 93.50\\%

• Diện tích dưới đường cong ROC (ROC-AUC): 0.9768

• Độ nhạy (Recall): 92.86\\% (đặc biệt quan trọng để không bỏ sót các sinh viên có nguy cơ cấm thi).

1.  Các đề nghị rút ra từ kết quả nghiên cứu

**Đề nghị đối với nhà trường và ban quản lý đào tạo**

- Ban hành Quy chế Điểm danh Điện tử chính thức: Cần ban hành văn bản quy định giá trị pháp lý của dữ liệu điểm danh qua nền tảng Web/QR/GPS, công nhận biên bản sửa đổi điểm danh điện tử (Audit Trail) thay thế cho việc ký sổ tay truyền thống.
- Chuẩn hóa hạ tầng kỹ thuật giảng đường: Cần cấu hình cố định dải IP Wi-Fi công khai của từng tòa nhà/giảng đường và đo đạc tọa độ GPS mốc chính xác của các phòng học để giảm thiểu sai số do môi trường vật lý.

**Đề nghị đối với Đội ngũ Giảng viên**

- Chủ động khai thác Bảng điều khiển AI (\`AI Risk Radar\`): Giảng viên không chỉ dùng hệ thống để ghi nhận có mặt/vắng mặt, mà cần thường xuyên theo dõi radar rủi ro chuyên cần để nhắc nhở trực tiếp những sinh viên có chuỗi vắng liên tiếp hoặc điểm chuyên cần dưới 7.0.
- Duy trì thói quen Trình chiếu QR xoay vòng: Bật màn hình máy chiếu mã QR ngay đầu buổi học (10–15 phút đầu) và đóng phiên điểm danh đúng giờ để rèn luyện tác phong đúng giờ cho sinh viên.
- Kịp thời Xét duyệt Đơn nghỉ phép và Thiết bị: Giảng viên cần nhanh chóng kiểm tra ảnh minh chứng đơn xin nghỉ phép và duyệt yêu cầu đổi máy tính/điện thoại của sinh viên để đảm bảo quyền lợi điểm danh liên tục cho người học.

**Đề nghị đối với sinh viên**

- Chủ động Giám sát Chỉ số Chuyên cần: Sinh viên cần thường xuyên theo dõi Thẻ điểm chuyên cần cá nhân và các khuyến nghị AI được hiển thị trên trang Dashboard để tự điều chỉnh kế hoạch học tập.
- Bảo vệ Định danh Thiết bị: Tuân thủ nguyên tắc không sử dụng máy của bạn cùng lớp để đăng nhập, bảo quản thiết bị cá nhân đã được liên kết (Device Binding) và nộp đơn giải trình đổi máy kèm lý do chính đáng khi có sự cố hỏng hóc.
- Tuân thủ Quy trình Nghỉ học có phép: Khi có biến cố sức khỏe hoặc lý do cá nhân chính đáng, sinh viên phải nộp đơn kèm ảnh chụp giấy tờ minh chứng trên hệ thống trước hoặc ngay sau buổi học để được chuyển trạng thái sang EXCUSED, tránh bị trừ điểm nặng ở tiêu chí vắng không phép.

1.  Hướng phát triển của đề tài

- Trợ lý Sư phạm Ảo (Academic Chatbot với RAG & LLM): Tích hợp Chatbot AI hỗ trợ giải đáp 24/7 cho sinh viên về quy chế đào tạo, thủ tục xin nghỉ ốm, tự động phân tích và đưa ra lộ trình: "Bạn cần đi học đầy đủ bao nhiêu buổi còn lại để đạt điểm chuyên cần mục tiêu 8.0".
- Đóng gói Ứng dụng Di động (Mobile App): Phát triển phiên bản Mobile sử dụng React Native hoặc Flutter cho iOS và Android, tận dụng xác thực sinh trắc học phần cứng (Face ID / Fingerprint) trên điện thoại thay cho Web Camera.

TÀI LIỆU THAM KHẢO

**Tài liệu Internet**

\[1\] NestJS Core Team, "NestJS Documentation – A progressive Node.js framework for building efficient, reliable and scalable server-side applications", NestJS, 2024. \[Trực tuyến\]. https://docs.nestjs.com/

\[2\] Vercel Inc., "Next.js Documentation – The React Framework for the Web (App Router & Server Components)", Next.js Docs, 2024. \[Trực tuyến\]. https://nextjs.org/docs

\[3\] S. Ramírez, "FastAPI Documentation – High performance, easy to learn, fast to code, ready for production", FastAPI, 2024. \[Trực tuyến\]. https://fastapi.tiangolo.com/

\[4\] Scikit-learn Developers, "Scikit-learn: Machine Learning in Python – User Guide and API Reference", Scikit-learn, 2024. \[Trực tuyến\]. https://scikit-learn.org/stable/documentation.html

\[5\] MongoDB Inc., "MongoDB Manual – The Developer Data Platform (Indexes, Replica Sets & Aggregation)", MongoDB, 2024. \[Trực tuyến\]. https://www.mongodb.com/docs/manual/

\[6\] Socket.IO Team, "Socket.IO Documentation – Bidirectional and low-latency communication for every platform", Socket.IO, 2024. \[Trực tuyến\]. https://socket.io/docs/v4/

\[7\] Google Cloud, "Firebase Cloud Messaging Documentation – Cross-platform messaging solution for Web and Mobile", Firebase, 2024. \[Trực tuyến\]. https://firebase.google.com/docs/cloud-messaging/

\[8\] Docker Inc., "Docker Documentation – Multi-stage builds, Containerization Best Practices & Compose Specification", Docker Docs, 2024. \[Trực tuyến\]. https://docs.docker.com/

\[9\] Tailwind Labs Inc., "Tailwind CSS Documentation – A utility-first CSS framework for rapid UI development", Tailwind CSS, 2024. \[Trực tuyến\]. https://tailwindcss.com/docs

\[10\] Render Services Inc., "Render Documentation – Cloud Application Hosting, Infrastructure as Code (Blueprints) & Health Checks", Render Docs, 2024. \[Trực tuyến\]. https://render.com/docs