import './globals.css';

export const metadata = {
  title: 'MesoDB',
  description: 'A customised price tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}