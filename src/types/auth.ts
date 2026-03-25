export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  message: string;
  user: User;
};
