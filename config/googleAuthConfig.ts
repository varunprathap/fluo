export const googleAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  redirectUri:
    typeof window !== "undefined"
      ? `${window.location.origin}/admin/dash/apps`
      : "",
  scope: "email profile openid https://www.googleapis.com/auth/drive.file",
  responseType: "token",
};