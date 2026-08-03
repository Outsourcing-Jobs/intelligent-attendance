export interface LoginDto {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface UserRole {
  _id?: string;
  code?: string;
  name?: string;
  permissions?: string[];
  isActive?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  _id?: string;
  id?: string;
  firebaseUid?: string;
  email: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  avatar?: string;
  picture?: string;
  phone?: string;
  status?: string;
  userCode?: string;
  classId?: string;
  departmentId?: string;
  roleCode?: string;
  roleName?: string;
  permissions?: string[];
  role?: UserRole;
  roleId?: string | UserRole;
}

export interface LoginResponse {
  idToken?: string;
  refreshToken?: string;
  accessToken?: string;
  customToken?: string;
  expiresIn?: string | number;
  user?: UserProfile;
  menus?: any[];
  message?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
  resetLink?: string;
}

export interface ResetPasswordDto {
  oobCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  email?: string;
}
