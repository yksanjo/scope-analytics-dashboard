import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SCOPE Analytics Dashboard',
  description: 'Real-time monitoring and visualization platform for agent execution traces',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
