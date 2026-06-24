import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password — Reset Your Password",
  description:
    "Forgot your password? Enter your email to receive a secure password reset link for your Get Tours Nepal account.",
  robots: { index: true, follow: true },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
