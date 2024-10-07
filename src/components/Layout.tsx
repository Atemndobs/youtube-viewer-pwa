// src/components/Layout.tsx
import React, { useContext } from 'react';
import { Layout as AntLayout } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design CSS
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported
import Link from 'next/link'; // Import Link for Next.js navigation
import { ThemeContext } from '../context/ThemeContext'; // Adjust path if necessary

const { Content, Footer } = AntLayout;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    // Handle missing context error (e.g., if the provider is not found)
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }

  const { isDarkMode } = themeContext;

  return (
    <AntLayout className={`min-h-screen ${isDarkMode ? 'bg-black text-gray-400' : 'bg-white text-gray-800'}`}>
      <script async src="https://cse.google.com/cse.js?cx=675971d1c62a24514"></script>
      <Content className={`flex-grow ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        {children}
      </Content>

      {/* Footer */}
      <Footer className={`text-center py-4 ${isDarkMode ? 'bg-black text-gray-600' : 'bg-white text-gray-800'}`}>
        &copy; {new Date().getFullYear() + ' '} 
        Version {process.env.NEXT_PUBLIC_VERSION || '1.0.2'}

        <br />
        <Link href="/privacy-policy" className="text-blue-500">Privacy Policy</Link>
      </Footer>
    </AntLayout>
  );
};
