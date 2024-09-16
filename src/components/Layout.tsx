// src/components/Layout.tsx
import React from 'react';
import { Layout as AntLayout } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design CSS
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported
import Link from 'next/link'; // Import Link for Next.js navigation

const { Content, Footer } = AntLayout;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AntLayout className="min-h-screen">
      <script async src="https://cse.google.com/cse.js?cx=675971d1c62a24514"></script>
      <Content className="bg-black flex-grow">
        {children}
      </Content>

      {/* Footer */}
      <Footer className="bg-black text-gray-600 text-center py-4">
        &copy; {new Date().getFullYear()} ATEM. All Rights Reserved.
        <br />
        <Link href="/privacy-policy" className="text-blue-500">Privacy Policy</Link>
      </Footer>
    </AntLayout>
  );
};
