import React from 'react';
import { Layout as AntLayout } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design CSS
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported

const { Content, Footer } = AntLayout;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AntLayout className="min-h-screen">
      <Content className="bg-black flex-grow">
        {children}
      </Content>

      {/* Footer */}
      <Footer className="bg-black text-gray-600 text-center py-4">
        &copy; {new Date().getFullYear()} ATEM. All Rights Reserved.
      </Footer>
    </AntLayout>
  );
};
