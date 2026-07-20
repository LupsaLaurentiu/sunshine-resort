export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  admin: AdminUser;
};

export type CurrentAdminResponse = AdminUser;