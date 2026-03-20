export type SigninUser = {
  id: string;
  email: string | null;
  name: string;
  role: "admin" | "driver";
};
