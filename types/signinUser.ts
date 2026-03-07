export type SigninUser = {
  uid: string;
  email: string | null;
  name: string;
  role: "admin" | "driver";
};
