import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한/영 타자 연습",
  description: "포켓몬 프로필로 즐기는 한글과 영어 타자 연습"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
