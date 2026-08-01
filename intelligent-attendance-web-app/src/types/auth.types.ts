export interface LoginDto {
  username: string;
  password: string;
  remember?: boolean;
}

export interface RegisterDto {
  username: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  userType?: "student" | "faculty";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  avatar?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserProfile;
  message?: string;
}
