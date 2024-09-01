import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design CSS
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported

const { Header, Content, Footer } = AntLayout;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AntLayout className="min-h-screen">

{/* 
      <Header className="bg-black text-gray-400 sticky top-0 z-0">
        <div className="container mx-auto flex items-center justify-between h-full">
          <div className="text-xl font-bold text-center flex-grow">
            YouTube Video Viewer
          </div>
        </div>
      </Header>
       */}

      {/* Main Content */}
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
