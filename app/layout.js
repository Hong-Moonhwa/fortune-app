import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata = {
  title: "MBTI × 사주 오늘의 운세",
  description: "MBTI와 사주명리학을 결합한 나만의 맞춤 운세",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${notoSansKr.className} min-h-full bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950`}
      >
        {children}
      </body>
    </html>
  );
}
