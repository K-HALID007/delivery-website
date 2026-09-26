import ToastContainerWrapper from "@/components/common/ToastContainerWrapper";
import UserComplaintBot from "@/components/chatbot/user-complaint-bot";
import "./globals.css";

export const metadata = {
  title: "Prime Dispatcher - Courier Tracker",
  description: "Professional courier and package tracking system with AI-powered support",
  icons: {
    icon: [
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg?v=2',
    apple: '/favicon.svg?v=2',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <UserComplaintBot />
        <ToastContainerWrapper />
      </body>
    </html>
  );
}
