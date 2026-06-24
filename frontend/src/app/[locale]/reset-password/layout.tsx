import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — Set New Password",
  description:
    "Set a new password for your Get Tours Nepal account. Create a strong password with uppercase, lowercase, digits, and special characters.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
