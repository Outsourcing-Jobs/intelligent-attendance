# Tài liệu thiết kế Base System — NestJS + MongoDB + Firebase Auth
## Module: User, Role, Config (Dynamic)

---

## 1. Tổng quan kiến trúc

**Nguyên tắc:**
- Firebase chỉ dùng để **xác thực (Authentication)**: đăng ký/đăng nhập, sinh ID Token, quản lý mật khẩu, social login (Google/Facebook nếu cần sau này).
- **MongoDB** lưu toàn bộ dữ liệu nghiệp vụ: thông tin user (profile mở rộng), role, permission, config.
- Backend nhận **Firebase ID Token** từ client (qua header `Authorization: Bearer <idToken>`) → verify bằng **Firebase Admin SDK** → lấy `uid`, `email` → đối chiếu/đồng bộ với bảng `users` trong MongoDB → gắn role/permission từ DB (vì Firebase không biết role nghiệp vụ của bạn).
- Không tự sinh JWT riêng — dùng thẳng Firebase ID Token làm token xác thực cho mọi request. Việc phân quyền (role/permission) hoàn toàn nằm ở DB, không nằm ở Firebase Custom Claims (để linh hoạt, không phải update claims mỗi lần đổi quyền — trừ khi bạn muốn tối ưu sau này).

```
Client (Web/App)
   │  1. Đăng nhập bằng Firebase SDK (email/pass, Google...)
   ▼
Firebase Auth ──► trả về idToken
   │
   │  2. Gọi API kèm Authorization: Bearer <idToken>
   ▼
NestJS Backend
   │  3. FirebaseAuthGuard verify idToken (Firebase Admin SDK)
   │  4. Lấy uid/email → tìm user trong MongoDB (users collection)
   │     - Nếu chưa có → tự tạo user mới (first-time sync) với role mặc định
   │  5. Gắn req.user = { uid, email, role, permissions,... }
   │  6. RolesGuard / PermissionsGuard kiểm tra quyền theo route
   ▼
Controller xử lý nghiệp vụ
```

---

## 2. Cấu trúc thư mục dự án

```
src/
├── main.ts
├── app.module.ts
├── config/
│   ├── firebase/
│   │   ├── firebase-admin.provider.ts
│   │   └── firebase.module.ts
│   └── database/
│       └── mongoose.config.ts
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   ├── permissions.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   ├── firebase-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   ├── interceptors/
│   │   └── transform-response.interceptor.ts
│   └── filters/
│       └── http-exception.filter.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
│   ├── user/
│   │   ├── schemas/user.schema.ts
│   │   ├── dto/
│   │   ├── user.module.ts
│   │   ├── user.controller.ts
│   │   └── user.service.ts
│   ├── role/
│   │   ├── schemas/role.schema.ts
│   │   ├── dto/
│   │   ├── role.module.ts
│   │   ├── role.controller.ts
│   │   └── role.service.ts
│   └── config/
│       ├── schemas/config.schema.ts
│       ├── schemas/menu.schema.ts
│       ├── dto/
│       ├── config.module.ts
│       ├── config.controller.ts
│       └── config.service.ts
```

---

## 3. Thiết kế Schema MongoDB (Mongoose)

### 3.1. `User` (`user.schema.ts`)

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  firebaseUid: string; // uid lấy từ Firebase, dùng làm khóa liên kết chính

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  fullName: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  avatarPublicId: string; // publicId bên Cloudinary, dùng để xóa ảnh cũ khi user đổi avatar (xem mục 19.6)

  @Prop()
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ enum: ['active', 'inactive', 'banned'], default: 'active' })
  status: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  lastLoginAt: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>; // chỗ trống linh hoạt cho các field phát sinh sau này
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 3.2. `Role` (`role.schema.ts`)

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @Prop({ required: true, unique: true })
  code: string; // vd: 'admin', 'teacher', 'student'

  @Prop({ required: true })
  name: string; // Tên hiển thị: 'Quản trị viên'

  @Prop({ type: [String], default: [] })
  permissions: string[]; // vd: ['user:create', 'user:update', 'attendance:view']

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
```

> **Ghi chú permission:** dùng string dạng `module:action` (vd: `user:read`, `config:update`) thay vì tạo hẳn 1 bảng Permission riêng — đơn giản, đủ dùng cho hệ thống vừa/nhỏ. Nếu sau này cần permission phức tạp (theo resource cụ thể), có thể tách bảng `permissions` riêng và role chỉ lưu `permissionIds: ObjectId[]`.

### 3.3. `Config` — bảng cấu hình động (`config.schema.ts`)

Đây là bảng **key-value động**, dùng cho mọi loại cấu hình hệ thống (không chỉ menu) — linh hoạt thêm field mới mà không cần sửa schema.

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfigDocument = Config & Document;

@Schema({ timestamps: true, collection: 'configs' })
export class Config {
  @Prop({ required: true, unique: true, index: true })
  key: string; // vd: 'SYSTEM_NAME', 'MAX_LEAVE_DAYS', 'WIFI_IP_RANGE'

  @Prop({ enum: ['string', 'number', 'boolean', 'json'], default: 'string' })
  type: string;

  @Prop({ type: Object })
  value: any; // lưu giá trị bất kỳ, parse theo `type` khi trả về client

  @Prop({ enum: ['system', 'menu', 'general'], default: 'general' })
  group: string; // để phân nhóm config khi cần lọc theo nhóm

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
```

### 3.4. `Menu` — bảng riêng cho menu (khuyến nghị tách riêng thay vì để chung Config)

Bạn nói *"sau này thêm menu thì chỉ cần gắn url của page đó"* — cách làm gọn nhất là tách hẳn 1 collection `menus` (không nhét vào `configs`), vì menu có cấu trúc cây (cha-con) và cần thứ tự hiển thị, icon,... Nếu nhét vào Config thì sau này rất khó query/sort.

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true, collection: 'menus' })
export class Menu {
  @Prop({ required: true })
  name: string; // Tên hiển thị: 'Quản lý người dùng'

  @Prop({ required: true })
  url: string; // '/users' — chỉ cần gắn field này khi thêm page mới

  @Prop()
  icon: string; // vd: 'user-icon' (tên icon dùng ở FE)

  @Prop({ type: Types.ObjectId, ref: 'Menu', default: null })
  parentId: Types.ObjectId | null; // hỗ trợ menu cha-con

  @Prop({ default: 0 })
  order: number; // thứ tự hiển thị

  @Prop({ type: [String], default: [] })
  permissions: string[]; // menu chỉ hiện nếu user có 1 trong các permission này

  @Prop({ default: true })
  isActive: boolean;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
```

**Cách dùng khi thêm page mới:** chỉ cần insert 1 document vào `menus` với `url` trỏ tới route FE + `permissions` cần thiết → menu tự xuất hiện ở sidebar cho user có quyền tương ứng, không cần sửa code.

---

## 4. Firebase Admin SDK — Setup

### 4.1. Cài đặt

```bash
npm install firebase-admin
```

### 4.2. Provider (`firebase-admin.provider.ts`)

```typescript
import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider = {
  provide: FIREBASE_ADMIN,
  useFactory: () => {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    return admin;
  },
};
```

### 4.3. Module (`firebase.module.ts`)

```typescript
import { Global, Module } from '@nestjs/common';
import { FirebaseAdminProvider } from './firebase-admin.provider';

@Global()
@Module({
  providers: [FirebaseAdminProvider],
  exports: [FirebaseAdminProvider],
})
export class FirebaseModule {}
```

### 4.4. Biến môi trường (`.env`)

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
MONGODB_URI=mongodb://localhost:27017/attendance_system
```

---

## 5. Auth Guard — Verify Firebase Token + Sync User

### 5.1. `FirebaseAuthGuard` (`firebase-auth.guard.ts`)

```typescript
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from '../../config/firebase/firebase-admin.provider';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: typeof admin,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu token xác thực');
    }

    const idToken = authHeader.split(' ')[1];

    try {
      const decoded = await this.firebaseAdmin.auth().verifyIdToken(idToken);

      // Đồng bộ user: nếu chưa tồn tại trong DB thì tự tạo mới
      const user = await this.userService.findOrCreateByFirebase({
        firebaseUid: decoded.uid,
        email: decoded.email,
        isEmailVerified: decoded.email_verified,
      });

      // Gắn thông tin user (kèm role/permissions) vào request để dùng ở guard sau + controller
      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
```

### 5.2. `RolesGuard` / `PermissionsGuard`

```typescript
// permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
```

```typescript
// permissions.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const hasPermission = required.some((p) => user?.permissions?.includes(p));

    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
```

**Cách dùng trong Controller:**

```typescript
@UseGuards(FirebaseAuthGuard, PermissionsGuard)
@RequirePermissions('user:create')
@Post()
create(@Body() dto: CreateUserDto) { ... }
```

### 5.3. `CurrentUser` decorator (lấy nhanh user trong controller)

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

---

## 6. Logic nghiệp vụ chính

### 6.1. `AuthService` / `AuthController` — không tự sinh token, chỉ có 2 việc:

1. **`POST /auth/sync`**: FE gọi sau khi login Firebase thành công (hoặc gọi lồng trong guard tự động như trên) — mục đích chính là để FE lấy về thông tin user + role + permissions + menu ngay sau khi login.
2. **`GET /auth/me`**: lấy thông tin user hiện tại (dùng `FirebaseAuthGuard`).

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user) {
    return user; // đã gồm role, permissions từ guard xử lý sẵn
  }
}
```

### 6.2. `UserService.findOrCreateByFirebase()`

```typescript
async findOrCreateByFirebase(data: {
  firebaseUid: string;
  email: string;
  isEmailVerified: boolean;
}) {
  let user = await this.userModel
    .findOne({ firebaseUid: data.firebaseUid })
    .populate('roleId')
    .lean();

  if (!user) {
    const defaultRole = await this.roleModel.findOne({ code: 'student' }); // role mặc định
    const created = await this.userModel.create({
      firebaseUid: data.firebaseUid,
      email: data.email,
      isEmailVerified: data.isEmailVerified,
      roleId: defaultRole?._id,
    });
    user = await this.userModel
      .findById(created._id)
      .populate('roleId')
      .lean();
  }

  // Cập nhật lastLoginAt (không cần await/block response)
  this.userModel.updateOne({ _id: user._id }, { lastLoginAt: new Date() }).exec();

  return {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: (user.roleId as any)?.code,
    permissions: (user.roleId as any)?.permissions || [],
  };
}
```

### 6.3. `ConfigService` — đọc/ghi config động

```typescript
async getByKey(key: string) {
  const config = await this.configModel.findOne({ key, isActive: true }).lean();
  return config ? this.parseValue(config) : null;
}

async getByGroup(group: string) {
  const configs = await this.configModel.find({ group, isActive: true }).lean();
  return configs.map((c) => this.parseValue(c));
}

async upsert(key: string, value: any, type = 'string', group = 'general') {
  return this.configModel.findOneAndUpdate(
    { key },
    { value, type, group },
    { upsert: true, new: true },
  );
}

private parseValue(config: any) {
  switch (config.type) {
    case 'number': return { ...config, value: Number(config.value) };
    case 'boolean': return { ...config, value: Boolean(config.value) };
    case 'json': return { ...config, value: config.value }; // đã là Object sẵn
    default: return config;
  }
}
```

### 6.4. `MenuService` — lấy menu theo quyền của user (dùng dựng sidebar FE)

```typescript
async getMenuForUser(permissions: string[]) {
  const menus = await this.menuModel
    .find({
      isActive: true,
      $or: [{ permissions: { $size: 0 } }, { permissions: { $in: permissions } }],
    })
    .sort({ order: 1 })
    .lean();

  return this.buildTree(menus); // hàm dựng cây cha-con từ danh sách phẳng
}

private buildTree(menus: any[], parentId: string | null = null): any[] {
  return menus
    .filter((m) => String(m.parentId) === String(parentId))
    .map((m) => ({ ...m, children: this.buildTree(menus, m._id) }));
}
```

---

## 7. Danh sách API đề xuất

| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| GET | `/auth/me` | FirebaseAuthGuard | Lấy thông tin user hiện tại + role + permissions |
| GET | `/users` | FirebaseAuthGuard + `user:read` | Danh sách user (phân trang, filter) |
| GET | `/users/:id` | FirebaseAuthGuard + `user:read` | Chi tiết user |
| PATCH | `/users/:id` | FirebaseAuthGuard + `user:update` | Cập nhật thông tin user |
| PATCH | `/users/:id/role` | FirebaseAuthGuard + `user:update-role` | Gán role cho user |
| PATCH | `/users/:id/status` | FirebaseAuthGuard + `user:update` | Khóa/mở khóa tài khoản |
| GET | `/roles` | FirebaseAuthGuard + `role:read` | Danh sách role |
| POST | `/roles` | FirebaseAuthGuard + `role:create` | Tạo role mới |
| PATCH | `/roles/:id` | FirebaseAuthGuard + `role:update` | Sửa role (đổi permissions) |
| DELETE | `/roles/:id` | FirebaseAuthGuard + `role:delete` | Xóa role |
| GET | `/configs?group=` | FirebaseAuthGuard + `config:read` | Lấy danh sách config theo nhóm |
| GET | `/configs/:key` | FirebaseAuthGuard + `config:read` | Lấy 1 config theo key |
| POST/PUT | `/configs` | FirebaseAuthGuard + `config:update` | Tạo/cập nhật config (upsert theo key) |
| GET | `/menus` | FirebaseAuthGuard | Lấy menu (đã lọc theo quyền user hiện tại) — dùng dựng sidebar |
| POST | `/menus` | FirebaseAuthGuard + `menu:create` | Thêm menu mới — chỉ cần truyền `name`, `url`, `parentId`, `permissions` |
| PATCH | `/menus/:id` | FirebaseAuthGuard + `menu:update` | Sửa menu |
| DELETE | `/menus/:id` | FirebaseAuthGuard + `menu:delete` | Xóa menu |

---

## 8. Seed dữ liệu mặc định (chạy 1 lần khi khởi tạo hệ thống)

```typescript
// seed.ts (chạy độc lập hoặc trong OnModuleInit của 1 module Seed)
const roles = [
  { code: 'admin', name: 'Quản trị viên', permissions: ['*'] }, // '*' = full quyền, check riêng ở guard
  { code: 'teacher', name: 'Giáo viên', permissions: ['attendance:view', 'leave:approve', 'schedule:view'] },
  { code: 'student', name: 'Học sinh/Sinh viên', permissions: ['attendance:checkin', 'leave:create', 'schedule:view'] },
];

const configs = [
  { key: 'SYSTEM_NAME', value: 'Hệ thống quản lý điểm danh', type: 'string', group: 'system' },
  { key: 'WIFI_IP_RANGE', value: '192.168.1.0/24', type: 'string', group: 'system' },
];
```

> Với role `admin` dùng `permissions: ['*']`, cần sửa lại `PermissionsGuard` để check thêm điều kiện: nếu `user.permissions.includes('*')` thì luôn pass.

---

## 9. RolesGuard (check theo role.code, thay cho PermissionsGuard)

### 9.1. `roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### 9.2. `roles.guard.ts`

```typescript
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.includes(user?.role);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
```

### 9.3. Cách dùng trong Controller

```typescript
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Get()
findAll() { ... }
```

### 9.4. Cách "toggle" giữa RolesGuard và PermissionsGuard mà không sửa nhiều chỗ

Vì 2 guard này độc lập, không đè lên nhau, bạn chỉ cần comment/uncomment theo cặp decorator + guard ở từng controller:

```typescript
// Cách A - đang dùng Role (đơn giản)
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin', 'teacher')

// Cách B - đang dùng Permission (chi tiết) — chỉ việc đổi lại khi cần
// @UseGuards(FirebaseAuthGuard, PermissionsGuard)
// @RequirePermissions('user:read')
```

Để gọn hơn, có thể tạo 1 **guard tổng hợp** (`AccessGuard`) đọc cả 2 loại metadata, ưu tiên metadata nào có mặt — nhưng với quy mô đồ án, cách comment/uncomment thủ công như trên là đủ và dễ kiểm soát hơn.

> Lưu ý: `user.role` trong `req.user` lấy từ `role.code` (vd: `'admin'`, `'teacher'`, `'student'`) — đã được set sẵn ở `UserService.findOrCreateByFirebase()` (mục 6.2), nên không cần sửa gì thêm ở phần service.

---

## 10. Rà soát API — bổ sung phần còn thiếu

### 10.1. Login / Logout / Register — làm rõ ai làm gì

Với kiến trúc Firebase Auth, **việc login KHÔNG nằm ở backend** — Firebase Client SDK xử lý trực tiếp trên FE. Backend chỉ nhận token đã có sẵn. Cụ thể:

| Việc | Ai làm | Có cần Google không |
|---|---|---|
| Đăng ký (tạo tài khoản) | FE gọi `createUserWithEmailAndPassword()` (Firebase Client SDK) — **không cần** backend | Không |
| Đăng nhập | FE gọi `signInWithEmailAndPassword()` (Firebase Client SDK) → trả về idToken | Không |
| Đồng bộ vào hệ thống | FE gửi idToken lên `GET /auth/me` (hoặc `POST /auth/sync`) → backend tạo/lấy user trong Mongo | — |
| Đăng xuất | FE gọi `signOut()` (Firebase Client SDK) — xóa token phía client | — |

→ Đúng, **login không cần Google** — bạn chỉ bật **Email/Password provider** trong Firebase Console, không cần bật Google Sign-In. Firebase hỗ trợ độc lập từng provider.

### 10.2. Bổ sung API còn thiếu (đưa vào bảng ở mục 7)

| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| POST | `/auth/sync` | FirebaseAuthGuard | Gọi ngay sau khi FE login xong, để tạo/đồng bộ user + trả về role/menu luôn (gộp `/auth/me` + `/menus` cho gọn 1 lần gọi) |
| POST | `/auth/logout` | FirebaseAuthGuard | Backend gọi `admin.auth().revokeRefreshTokens(uid)` — ép toàn bộ token cũ của user hết hạn ngay (dùng khi: user tự logout muốn chắc chắn, hoặc admin ban tài khoản) |
| POST | `/admin/users` | RolesGuard(`admin`) | Admin tự tạo tài khoản cho user khác (vd: tạo tài khoản giáo viên) — dùng `admin.auth().createUser()` bên Firebase + tạo record Mongo tương ứng |
| DELETE | `/admin/users/:id` | RolesGuard(`admin`) | Xóa tài khoản (xóa cả bên Firebase `admin.auth().deleteUser()` lẫn Mongo) |
| PATCH | `/admin/users/:id/ban` | RolesGuard(`admin`) | Set `status: 'banned'` + gọi `revokeRefreshTokens` để đá user ra ngay lập tức |
| GET | `/admin/roles` / `/admin/configs` | RolesGuard(`admin`) | Các API quản trị nên gom riêng prefix `/admin/*` cho rõ ràng, dễ áp `RolesGuard('admin')` chung ở cấp Controller thay vì từng route |

### 10.3. Refresh Token — không cần backend tự làm

Với Firebase, **refresh token được Firebase Client SDK tự động xử lý**, bạn không cần viết API refresh riêng:

- ID Token hết hạn sau **1 giờ**.
- Firebase Client SDK (Web/Mobile) tự động dùng refresh token (lưu sẵn trong SDK) để lấy ID Token mới — hoàn toàn ngầm, FE không cần code gì thêm ngoài việc luôn lấy token mới nhất trước khi gọi API:

```javascript
// FE - luôn lấy token mới nhất (SDK tự refresh nếu cần) trước khi gọi API
const idToken = await firebase.auth().currentUser.getIdToken();
```

- Trường hợp cần **force logout ngay lập tức** (đổi mật khẩu, bị ban, admin thu hồi quyền) → dùng `admin.auth().revokeRefreshTokens(uid)` ở backend (mục 10.2, API `/auth/logout` và `/admin/users/:id/ban`) — lúc đó token cũ vẫn còn hạn nhưng sẽ bị từ chối ở `verifyIdToken()` do check `revocation time`.

> Muốn `verifyIdToken` biết được token đã bị revoke, phải gọi bằng: `admin.auth().verifyIdToken(idToken, true)` — tham số `true` thứ 2 để check revocation status. Cập nhật lại `FirebaseAuthGuard` (mục 5.1) dùng dòng này thay vì `verifyIdToken(idToken)` thường.

---

## 11. Code chi tiết: Admin Users, Auth (sync/logout), cập nhật Guard

### 11.1. Cập nhật `FirebaseAuthGuard` — check revoke token

```typescript
// firebase-auth.guard.ts (cập nhật lại đoạn verify)
const decoded = await this.firebaseAdmin.auth().verifyIdToken(idToken, true); // true = check revocation
```

Nếu token đã bị revoke (do bị ban hoặc force logout), dòng này sẽ tự throw lỗi (`auth/id-token-revoked`) → rơi vào catch → trả về `401 Unauthorized` như bình thường, không cần code thêm gì khác.

### 11.2. DTO cho Admin tạo user

```typescript
// dto/create-user-by-admin.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserByAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string; // Admin tự đặt mật khẩu ban đầu, user có thể đổi sau

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  roleCode: string; // 'teacher', 'student'...

  @IsOptional()
  @IsString()
  phone?: string;
}
```

```typescript
// dto/update-role.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsNotEmpty()
  roleCode: string;
}
```

### 11.3. `AdminUserController` (`admin-user.controller.ts`)

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserService } from './user.service';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserRoleDto } from './dto/update-role.dto';

@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin') // áp dụng cho TOÀN BỘ controller này, không cần lặp lại từng route
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: { page?: number; limit?: number; keyword?: string }) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateUserByAdminDto) {
    return this.userService.createByAdmin(dto);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.userService.updateRole(id, dto.roleCode);
  }

  @Patch(':id/ban')
  ban(@Param('id') id: string) {
    return this.userService.banUser(id);
  }

  @Patch(':id/unban')
  unban(@Param('id') id: string) {
    return this.userService.unbanUser(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.removeUser(id);
  }
}
```

### 11.4. `UserService` — bổ sung các hàm cho Admin

```typescript
// user.service.ts (bổ sung thêm các method sau, dùng chung với các method đã có ở mục 6.2)

async createByAdmin(dto: CreateUserByAdminDto) {
  // 1. Tạo tài khoản bên Firebase trước
  const firebaseUser = await this.firebaseAdmin.auth().createUser({
    email: dto.email,
    password: dto.password,
    displayName: dto.fullName,
  });

  // 2. Tìm role theo code
  const role = await this.roleModel.findOne({ code: dto.roleCode });
  if (!role) throw new BadRequestException('Role không tồn tại');

  // 3. Tạo record tương ứng trong Mongo
  const user = await this.userModel.create({
    firebaseUid: firebaseUser.uid,
    email: dto.email,
    fullName: dto.fullName,
    phone: dto.phone,
    roleId: role._id,
    isEmailVerified: false,
  });

  return user;
}

async updateRole(userId: string, roleCode: string) {
  const role = await this.roleModel.findOne({ code: roleCode });
  if (!role) throw new BadRequestException('Role không tồn tại');

  const user = await this.userModel.findByIdAndUpdate(
    userId,
    { roleId: role._id },
    { new: true },
  );
  if (!user) throw new NotFoundException('User không tồn tại');

  // Đổi role xong nên force logout luôn để quyền mới có hiệu lực ngay
  await this.firebaseAdmin.auth().revokeRefreshTokens(user.firebaseUid);
  return user;
}

async banUser(userId: string) {
  const user = await this.userModel.findByIdAndUpdate(
    userId,
    { status: 'banned' },
    { new: true },
  );
  if (!user) throw new NotFoundException('User không tồn tại');

  await this.firebaseAdmin.auth().revokeRefreshTokens(user.firebaseUid);
  // Đồng thời disable luôn bên Firebase để chặn cả việc đăng nhập lại
  await this.firebaseAdmin.auth().updateUser(user.firebaseUid, { disabled: true });
  return user;
}

async unbanUser(userId: string) {
  const user = await this.userModel.findByIdAndUpdate(
    userId,
    { status: 'active' },
    { new: true },
  );
  if (!user) throw new NotFoundException('User không tồn tại');

  await this.firebaseAdmin.auth().updateUser(user.firebaseUid, { disabled: false });
  return user;
}

async removeUser(userId: string) {
  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException('User không tồn tại');

  await this.firebaseAdmin.auth().deleteUser(user.firebaseUid);
  await this.userModel.findByIdAndDelete(userId);
  return { message: 'Đã xóa user thành công' };
}
```

> **Lưu ý quan trọng:** Bản thân middleware kiểm tra `status: 'banned'` cần được thêm vào `FirebaseAuthGuard` (mục 5.1) — vì `revokeRefreshTokens` chỉ chặn được token cũ, còn nếu user đã kịp lấy token mới trước khi bị ban thì vẫn lọt qua nếu không check thêm `status` trong DB:

```typescript
// Thêm vào cuối FirebaseAuthGuard, sau khi lấy user từ DB
if (user.status === 'banned') {
  throw new UnauthorizedException('Tài khoản đã bị khóa');
}
```

### 11.5. `AuthController` — bổ sung `/auth/sync` và `/auth/logout`

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from '../user/user.service';
import { MenuService } from '../config/menu.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) {}

  // Gọi ngay sau khi FE login Firebase thành công lần đầu
  @UseGuards(FirebaseAuthGuard)
  @Post('sync')
  async sync(@CurrentUser() user) {
    const menus = await this.menuService.getMenuForUser(user.permissions);
    return { user, menus };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user) {
    return user;
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user) {
    await this.userService.revokeUserToken(user.firebaseUid);
    return { message: 'Đăng xuất thành công' };
  }
}
```

```typescript
// user.service.ts - thêm hàm nhỏ dùng cho logout
async revokeUserToken(firebaseUid: string) {
  return this.firebaseAdmin.auth().revokeRefreshTokens(firebaseUid);
}
```

### 11.6. Cập nhật bảng API tổng hợp (mục 7) — checklist đầy đủ tính đến giờ

| Nhóm | Đã có |
|---|---|
| Auth | `/auth/sync`, `/auth/me`, `/auth/logout` ✅ |
| User (admin) | `/admin/users` (GET, POST), `/admin/users/:id` (GET, DELETE), `/admin/users/:id/role`, `/admin/users/:id/ban`, `/admin/users/:id/unban` ✅ |
| User (self) | `/users/me` (xem/sửa profile của chính mình — nên tách riêng khỏi `/admin/users`, không cần role admin) — **cần bổ sung nếu chưa có** |
| Role | CRUD `/roles` ✅ |
| Config | CRUD `/configs` ✅ |
| Menu | CRUD `/menus` ✅ |

→ Phần còn thiếu duy nhất: **`/users/me` (GET, PATCH)** để chính user tự xem/sửa profile bản thân (không qua nhóm `/admin/users` vì route đó chỉ admin mới gọi được). Đây là API rất hay bị quên vì hay lẫn với `/auth/me` — phân biệt: `/auth/me` trả về thông tin phục vụ *xác thực* (role, permission, menu), còn `/users/me` dùng để *cập nhật hồ sơ cá nhân* (đổi tên, avatar, sđt).

---

## 13. UserSelfController — `/users/me`

### 13.1. DTO cập nhật profile

```typescript
// dto/update-profile.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

### 13.2. Controller

```typescript
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('users/me')
export class UserSelfController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getProfile(@CurrentUser() user) {
    return this.userService.findByFirebaseUid(user.firebaseUid);
  }

  @Patch()
  updateProfile(@CurrentUser() user, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.firebaseUid, dto);
  }
}
```

```typescript
// user.service.ts - bổ sung
async findByFirebaseUid(firebaseUid: string) {
  return this.userModel.findOne({ firebaseUid }).populate('roleId').lean();
}

async updateProfile(firebaseUid: string, dto: UpdateProfileDto) {
  return this.userModel.findOneAndUpdate({ firebaseUid }, dto, { new: true });
}
```

> Chủ động **không cho user tự sửa `email`, `roleId`, `status`** qua route này — chỉ những field vô hại (`fullName`, `avatarUrl`, `phone`). Đổi email/role phải qua `/admin/users/*`.

---

## 14. RoleController — CRUD Role

### 14.1. DTO

```typescript
// dto/create-role.dto.ts
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString() @IsNotEmpty()
  code: string;

  @IsString() @IsNotEmpty()
  name: string;

  @IsArray() @IsOptional()
  permissions?: string[];

  @IsString() @IsOptional()
  description?: string;
}
```

```typescript
// dto/update-role.dto.ts (khác với UpdateUserRoleDto ở mục 11.2 — đây là sửa chính bảng Role)
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
```

### 14.2. Controller

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
```

### 14.3. Service

```typescript
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  findAll() {
    return this.roleModel.find().lean();
  }

  async findById(id: string) {
    const role = await this.roleModel.findById(id).lean();
    if (!role) throw new NotFoundException('Role không tồn tại');
    return role;
  }

  create(dto: Partial<Role>) {
    return this.roleModel.create(dto);
  }

  update(id: string, dto: Partial<Role>) {
    return this.roleModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    // Chặn xóa role nếu đang có user sử dụng — tránh user bị "mồ côi" role
    const inUse = await this.userModel.exists({ roleId: id });
    if (inUse) {
      throw new BadRequestException('Không thể xóa role đang được gán cho user');
    }
    return this.roleModel.findByIdAndDelete(id);
  }
}
```

---

## 15. ConfigController + MenuController — CRUD

### 15.1. DTO Config

```typescript
// dto/upsert-config.dto.ts
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertConfigDto {
  @IsString() @IsNotEmpty()
  key: string;

  value: any; // giá trị tùy loại, không ràng buộc type cụ thể ở DTO

  @IsOptional() @IsIn(['string', 'number', 'boolean', 'json'])
  type?: string;

  @IsOptional() @IsIn(['system', 'menu', 'general'])
  group?: string;

  @IsOptional() @IsString()
  description?: string;
}
```

### 15.2. ConfigController

```typescript
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ConfigService } from './config.service';
import { UpsertConfigDto } from './dto/upsert-config.dto';

@Controller('configs')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // Đọc config: chỉ cần đăng nhập, không cần quyền admin (nhiều config dùng chung cho FE)
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findByGroup(@Query('group') group?: string) {
    return group ? this.configService.getByGroup(group) : this.configService.getAll();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.configService.getByKey(key);
  }

  // Ghi config: bắt buộc admin
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  upsert(@Body() dto: UpsertConfigDto) {
    return this.configService.upsert(dto.key, dto.value, dto.type, dto.group);
  }
}
```

```typescript
// config.service.ts - bổ sung hàm getAll
async getAll() {
  const configs = await this.configModel.find({ isActive: true }).lean();
  return configs.map((c) => this.parseValue(c));
}
```

### 15.3. DTO Menu

```typescript
// dto/create-menu.dto.ts
import { IsArray, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateMenuDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  url: string;

  @IsOptional() @IsString()
  icon?: string;

  @IsOptional() @IsString()
  parentId?: string;

  @IsOptional() @IsNumber()
  order?: number;

  @IsArray() @IsOptional()
  permissions?: string[];
}
```

### 15.4. MenuController

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Lấy menu đã lọc theo quyền của chính user đang đăng nhập — dùng dựng sidebar FE
  @UseGuards(FirebaseAuthGuard)
  @Get()
  getMyMenu(@CurrentUser() user) {
    return this.menuService.getMenuForUser(user.permissions);
  }

  // Từ đây là API cho admin quản trị danh sách menu
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  findAll() {
    return this.menuService.findAll();
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMenuDto>) {
    return this.menuService.update(id, dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
```

```typescript
// menu.service.ts - bổ sung
async findAll() {
  return this.menuModel.find().sort({ order: 1 }).lean();
}

create(dto: Partial<Menu>) {
  return this.menuModel.create(dto);
}

update(id: string, dto: Partial<Menu>) {
  return this.menuModel.findByIdAndUpdate(id, dto, { new: true });
}

remove(id: string) {
  return this.menuModel.findByIdAndDelete(id);
}
```

---

## 16. Module wiring — nối toàn bộ lại với nhau

### 16.1. `mongoose.config.ts`

```typescript
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig: MongooseModuleOptions = {
  uri: process.env.MONGODB_URI,
};
```

### 16.2. `user.module.ts`

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { UserService } from './user.service';
import { AdminUserController } from './admin-user.controller';
import { UserSelfController } from './user-self.controller';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [AdminUserController, UserSelfController],
  providers: [UserService, FirebaseAuthGuard],
  exports: [UserService], // export để AuthModule, RoleModule... dùng lại được
})
export class UserModule {}
```

### 16.3. `role.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
```

### 16.4. `config.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from './schemas/config.schema';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { ConfigService } from './config.service';
import { MenuService } from './menu.service';
import { ConfigController } from './config.controller';
import { MenuController } from './menu.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [ConfigController, MenuController],
  providers: [ConfigService, MenuService],
  exports: [ConfigService, MenuService],
})
export class ConfigModule {}
```

### 16.5. `auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '../config/config.module'; // để dùng MenuService trong /auth/sync

@Module({
  imports: [UserModule, ConfigModule],
  controllers: [AuthController],
})
export class AuthModule {}
```

### 16.6. `app.module.ts` — tổng hợp toàn bộ

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule as NestConfigModule } from '@nestjs/config'; // đọc file .env
import { mongooseConfig } from './config/database/mongoose.config';
import { FirebaseModule } from './config/firebase/firebase.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { ConfigModule } from './modules/config/config.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }), // load .env toàn cục
    MongooseModule.forRoot(process.env.MONGODB_URI),
    FirebaseModule,
    AuthModule,
    UserModule,
    RoleModule,
    ConfigModule,
  ],
})
export class AppModule {}
```

> **Lưu ý:** đặt tên `ConfigModule` (module tự viết) trùng với `ConfigModule` của `@nestjs/config` — nhớ import với alias (`as NestConfigModule`) như trên để tránh conflict tên.

### 16.7. `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // tự loại bỏ field lạ không có trong DTO
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(); // cấu hình lại origin cụ thể khi lên production
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

---

## 17. Swagger Setup — tự sinh doc test API

### 17.1. Cài đặt

```bash
npm install @nestjs/swagger swagger-ui-express
```

### 17.2. Cấu hình trong `main.ts`

Vì hệ thống auth bằng Firebase ID Token (không phải JWT tự sinh), Swagger vẫn khai báo kiểu **Bearer token** bình thường — Swagger UI chỉ cần 1 ô nhập token, không quan tâm token đó do ai cấp:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  // ---- Swagger config ----
  const config = new DocumentBuilder()
    .setTitle('Attendance System API')
    .setDescription(
      'API cho hệ thống quản lý điểm danh và lịch học. ' +
      'Auth dùng Firebase ID Token — lấy token từ Firebase Client SDK sau khi login, ' +
      'sau đó dán vào nút "Authorize" bên dưới (không cần tiền tố "Bearer ").',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Firebase ID Token cũng ở dạng JWT nên khai báo vậy cho đúng chuẩn OpenAPI
        name: 'Authorization',
        in: 'header',
      },
      'firebase-token', // tên định danh để gắn vào từng controller/route bên dưới
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // giữ token đã nhập, khỏi phải paste lại mỗi lần reload trang
    },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

→ Sau khi chạy, truy cập: **`http://localhost:3000/api/docs`**

### 17.3. Gắn `@ApiBearerAuth()` vào controller cần xác thực

Chỉ cần thêm 1 dòng decorator lên đầu class controller (dùng đúng tên `'firebase-token'` đã khai báo ở `main.ts`):

```typescript
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Users')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/users')
export class AdminUserController { ... }
```

Áp dụng tương tự cho: `AuthController` (`@ApiTags('Auth')`), `UserSelfController` (`@ApiTags('Users - Me')`), `RoleController` (`@ApiTags('Roles')`), `ConfigController` (`@ApiTags('Configs')`), `MenuController` (`@ApiTags('Menus')`).

### 17.4. Thêm mô tả cho DTO (để Swagger hiển thị rõ từng field)

```typescript
// dto/create-user-by-admin.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserByAdminDto {
  @ApiProperty({ example: 'teacher01@school.edu.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'teacher', enum: ['admin', 'teacher', 'student'] })
  @IsString()
  @IsNotEmpty()
  roleCode: string;

  @ApiProperty({ example: '0912345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
```

> Không bắt buộc phải thêm `@ApiProperty` cho MỌI DTO ngay từ đầu — Swagger vẫn tự đọc được tên field + kiểu dữ liệu cơ bản từ `class-validator` decorators. Chỉ nên ưu tiên thêm `@ApiProperty` (kèm `example`) cho những DTO hay dùng để test (login sync, tạo user, tạo role) để người test không phải đoán format.

### 17.5. Mô tả response mẫu cho từng route (tùy chọn, nên làm ở route quan trọng)

```typescript
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@ApiOperation({ summary: 'Đồng bộ user sau khi login Firebase, trả về role + menu' })
@ApiOkResponse({
  description: 'Thông tin user hiện tại kèm menu đã lọc theo quyền',
  schema: {
    example: {
      user: {
        id: '664f1c2e...',
        email: 'admin@school.edu.vn',
        fullName: 'Quản trị viên',
        role: 'admin',
        permissions: ['*'],
      },
      menus: [
        { name: 'Quản lý người dùng', url: '/users', children: [] },
      ],
    },
  },
})
@Post('sync')
async sync(@CurrentUser() user) { ... }
```

### 17.6. Cách test nhanh trên Swagger UI với Firebase token

1. Login trên FE (hoặc dùng Firebase REST API `signInWithPassword` để lấy nhanh idToken khi chưa có FE):
   ```bash
   curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<FIREBASE_WEB_API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@school.edu.vn","password":"123456","returnSecureToken":true}'
   ```
   → lấy field `idToken` trong response.
2. Vào `http://localhost:3000/api/docs` → bấm nút **Authorize** (góc trên bên phải) → dán `idToken` vào ô (không cần gõ chữ `Bearer`, Swagger tự thêm) → **Authorize** → **Close**.
3. Từ giờ mọi request "Try it out" trong Swagger đều tự gắn kèm token này ở header.

> Lưu ý: `idToken` hết hạn sau 1 giờ — hết hạn thì lấy lại token mới bằng bước 1 rồi Authorize lại.

---

## 18. Cloudinary Setup — upload ảnh (avatar, tài liệu...)

Dùng để lưu file ảnh (avatar user, ảnh minh chứng đơn nghỉ học...) — không lưu file trực tiếp trên server (mất khi deploy lại, không scale được), mà upload lên Cloudinary và chỉ lưu **URL** vào MongoDB.

### 18.1. Cài đặt

```bash
npm install cloudinary multer
npm install -D @types/multer
```

### 18.2. Biến môi trường (`.env`)

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> Lấy 3 giá trị này ở Cloudinary Dashboard → Console → phần "Product Environment Credentials".

### 18.3. Provider (`cloudinary.provider.ts`)

```typescript
import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cloudinary;
  },
};
```

### 18.4. Module (`cloudinary.module.ts`)

```typescript
import { Global, Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Global() // để module nào cũng inject được CloudinaryService mà không cần import lại
@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
```

### 18.5. Service upload (`cloudinary.service.ts`)

Upload theo dạng **stream** (nhận buffer từ Multer, không cần ghi file tạm ra ổ đĩa):

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { v2 as CloudinaryType } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof CloudinaryType) {}

  uploadImage(
    file: Express.Multer.File,
    folder = 'avatars',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder, // vd: 'avatars', 'leave-request-attachments'
          resource_type: 'image',
          transformation: [{ width: 500, height: 500, crop: 'limit' }], // giới hạn kích thước, tránh ảnh quá nặng
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
```

```bash
npm install streamifier
npm install -D @types/streamifier
```

### 18.6. Controller upload avatar — gắn luôn vào `UserSelfController` (mục 13)

```typescript
import {
  Body, Controller, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users - Me')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard)
@Controller('users/me')
export class UserSelfController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  getProfile(@CurrentUser() user) {
    return this.userService.findByFirebaseUid(user.firebaseUid);
  }

  @Patch()
  updateProfile(@CurrentUser() user, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.firebaseUid, dto);
  }

  @ApiConsumes('multipart/form-data') // để Swagger UI hiện ô chọn file thay vì ô text
  @UseInterceptors(FileInterceptor('file')) // 'file' phải khớp tên field gửi lên từ FE (FormData)
  @Post('avatar')
  async uploadAvatar(@CurrentUser() user, @UploadedFile() file: Express.Multer.File) {
    // Xóa ảnh cũ trên Cloudinary trước (nếu có) để tránh rác tích tụ
    const current = await this.userService.findByFirebaseUid(user.firebaseUid);
    if (current?.avatarPublicId) {
      await this.cloudinaryService.deleteImage(current.avatarPublicId);
    }

    const { url, publicId } = await this.cloudinaryService.uploadImage(file, 'avatars');
    return this.userService.updateProfile(user.firebaseUid, {
      avatarUrl: url,
      avatarPublicId: publicId,
    });
  }
}
```

> Field `file` trong `@UploadedFile()` phải trùng tên key mà FE gửi lên trong `FormData` (`formData.append('file', fileObj)`). Nếu FE dùng tên khác, sửa lại tham số trong `FileInterceptor('...')` cho khớp.

### 18.7. Validate file trước khi upload (nên có, tránh upload rác/file quá to)

```typescript
import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

@Post('avatar')
async uploadAvatar(
  @CurrentUser() user,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // giới hạn 5MB
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
      ],
    }),
  )
  file: Express.Multer.File,
) {
  // ...
}
```

### 18.8. Wiring vào `app.module.ts`

```typescript
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';

@Module({
  imports: [
    // ...các module khác đã có
    CloudinaryModule,
  ],
})
export class AppModule {}
```

Vì `CloudinaryModule` đã đánh dấu `@Global()`, chỉ cần import 1 lần duy nhất ở `AppModule` — `UserModule` (chứa `UserSelfController`) không cần import lại, tự inject `CloudinaryService` được luôn.

### 18.9. Dùng lại cho các module khác (không chỉ avatar)

Vì `CloudinaryService` là global, bất kỳ module nào sau này (module Đơn xin nghỉ học của C — đính kèm ảnh minh chứng, module Báo cáo — lưu file PDF/Word export...) đều gọi thẳng `cloudinaryService.uploadImage(file, 'leave-request-attachments')` mà không cần setup lại gì thêm — chỉ đổi tên `folder` cho từng loại tài liệu để dễ quản lý trên Cloudinary Dashboard.

---

## 19. Điểm cần lưu ý khi triển khai

1. **Không set custom claims trên Firebase cho role/permission** — vì bạn cần cập nhật ngay lập tức khi đổi quyền (custom claims chỉ refresh sau khi FE lấy token mới, có độ trễ). Toàn bộ role/permission luôn lấy từ MongoDB tại thời điểm request.
2. **Cache permissions/menu** theo user hoặc theo role bằng Redis (nếu hệ thống lớn) để tránh query DB liên tục ở mỗi request — với đồ án/KLTN thì có thể bỏ qua bước này.
3. **`user:update-role`** nên tách permission riêng biệt với `user:update` thông thường — tránh trường hợp GV tự nâng quyền cho chính mình.
4. Khi FE cần hiển thị sidebar, gọi `GET /menus` ngay sau khi login xong (song song với `/auth/me`) để dựng UI theo quyền.
5. Cân nhắc thêm middleware log lại các thao tác quan trọng (đổi role, đổi config hệ thống) vào 1 collection `audit_logs` — dễ dùng cho phần bảo mật/truy vết trong báo cáo KLTN.
6. **Cloudinary**: khi user đổi avatar mới, nên gọi `deleteImage(oldPublicId)` xóa ảnh cũ trước khi lưu ảnh mới — tránh rác tích tụ trên Cloudinary (miễn phí có giới hạn dung lượng/tháng). Muốn làm việc này thì cần lưu thêm field `avatarPublicId` trong schema `User` (bên cạnh `avatarUrl`) để có `publicId` mà xóa.

---

## 20. Checklist việc cần làm (theo thứ tự) — cập nhật đầy đủ

**Nền tảng:**
- [ ] Setup project NestJS + kết nối MongoDB (`@nestjs/mongoose`)
- [ ] Setup Firebase Admin SDK + biến môi trường (`.env`)
- [ ] Tạo schema `User`, `Role`, `Config`, `Menu`

**Auth & Guard:**
- [ ] Viết `FirebaseAuthGuard` (verify token có check revoke `verifyIdToken(idToken, true)` + check `status === 'banned'`)
- [ ] Viết `RolesGuard` + `@Roles()` decorator (đang dùng chính, mặc định)
- [ ] Viết `PermissionsGuard` + `@RequirePermissions()` decorator (dự phòng, comment sẵn để dùng sau nếu cần)
- [ ] Viết `CurrentUser` decorator

**User:**
- [ ] `UserService.findOrCreateByFirebase` (đồng bộ user lần đầu login)
- [ ] `AdminUserController` (`/admin/users`): CRUD, đổi role, ban/unban
- [ ] `UserSelfController` (`/users/me`): xem/sửa profile cá nhân

**Role:**
- [ ] `RoleController` (`/roles`): CRUD, chặn xóa role đang có user dùng

**Config & Menu:**
- [ ] `ConfigController` (`/configs`): đọc cho mọi user đã login, ghi chỉ admin
- [ ] `MenuController` (`/menus`): `/menus` (lấy menu theo quyền user), `/menus/all` (admin quản trị), CRUD

**Auth Controller:**
- [ ] `/auth/sync` (đồng bộ + trả user + menu), `/auth/me`, `/auth/logout` (revoke token)

**Wiring:**
- [ ] Nối `UserModule`, `RoleModule`, `ConfigModule`, `AuthModule` vào `AppModule`
- [ ] `main.ts`: `ValidationPipe`, `setGlobalPrefix('api/v1')`, `enableCors()`

**Hoàn thiện:**
- [ ] Setup Cloudinary (`CloudinaryModule` global) + endpoint `/users/me/avatar` upload ảnh
- [ ] Setup Swagger (`@nestjs/swagger`) + `@ApiBearerAuth('firebase-token')` cho các controller cần auth
- [ ] Seed dữ liệu mặc định (role `admin`/`teacher`/`student`, config hệ thống, menu cơ bản)
- [ ] Viết Swagger doc (`@nestjs/swagger`) cho toàn bộ API base này trước khi các module nghiệp vụ khác (điểm danh, nghỉ học...) bắt đầu code
- [ ] Test luồng: đăng ký/login FE → gọi `/auth/sync` → admin đổi role → test bị force logout → user bị ban → test không login lại được
