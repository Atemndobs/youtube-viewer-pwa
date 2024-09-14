import React from 'react';
import { Button, Layout, Typography } from 'antd';
import { useRouter } from 'next/router';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const PrivacyPolicy: React.FC = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Layout style={{ background: isDarkMode ? 'black' : 'white', minHeight: '100vh' }}>
       <div className="p-4">
        {/* Back Button */}
        <Link href="/" className="text-blue-500 flex items-center mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Watchlist
        </Link>

       <Content style={{ padding: '50px', margin: '0 auto', maxWidth: '800px', color: isDarkMode ? 'white' : 'black' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          {isDarkMode ? (
            <SunOutlined onClick={toggleDarkMode} style={{ color: 'white', cursor: 'pointer' }} />
          ) : (
            <MoonOutlined onClick={toggleDarkMode} style={{ color: 'black', cursor: 'pointer' }} />
          )}
        </div>
        <Title level={1} style={{ color: isDarkMode ? 'white' : 'black' }}>Privacy Policy</Title>
        <meta name="description" content="Privacy policy for Watchlist Viewer and the YouTube Watchlist Chrome extension." />
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          Welcome to the Privacy Policy page of the Watchlist Viewer and the YouTube Watchlist Chrome extension. We value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data.
        </Paragraph>
        
        <Title level={2} style={{ color: isDarkMode ? 'white' : 'black' }}>1. Information We Collect</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          Our application and Chrome extension do not collect any personal information. We only store YouTube video URLs that you save to your watchlist and use a randomly generated device ID to manage watchlists across sessions.
        </Paragraph>
        
        <Title level={2} style={{ color: isDarkMode ? 'white' : 'black' }}>2. How We Use Your Information</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          The stored YouTube video URLs are used to provide the functionality of the watchlist and sync your watchlist across sessions. No personal data is required or shared.
        </Paragraph>
        
        <Title level={2} style={{ color: isDarkMode ? 'white' : 'black' }}>3. Data Security</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          We take appropriate measures to ensure the security of your data. However, we cannot guarantee absolute security as no method of transmission over the internet or electronic storage is completely secure.
        </Paragraph>
        
        <Title level={2} style={{ color: isDarkMode ? 'white' : 'black' }}>4. YouTube Watchlist Chrome Extension Privacy Policy</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          This video player works together with the YouTube Watchlist Chrome Extension.
        </Paragraph>
        
        <Title level={3} style={{ color: isDarkMode ? 'white' : 'black' }}>4.1. YouTube Watchlist Chrome Extension</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          This extension does not collect any personal information. It stores only the URLs of the YouTube videos the user has saved for the watchlist and uses a randomly generated device ID to manage watchlists across sessions. No personal data is required or shared.
        </Paragraph>
        
        <Title level={3} style={{ color: isDarkMode ? 'white' : 'black' }}>4.2. Location</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          The extension may use the IP address to generate a unique device identifier to sync video watchlists across devices. No precise location data is collected or stored.
        </Paragraph>
        
        <Title level={3} style={{ color: isDarkMode ? 'white' : 'black' }}>4.3. Web History</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          The extension collects YouTube video URLs that the user saves to their watchlist. This information is only used to provide the extension's functionality and is not shared or sold.
        </Paragraph>
        
        <Title level={3} style={{ color: isDarkMode ? 'white' : 'black' }}>4.4. User Activity</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          The extension monitors when a user saves a YouTube video to their watchlist and tracks interactions with the video URLs. This data is only used to manage the user's watchlist.
        </Paragraph>
        
        <Title level={3} style={{ color: isDarkMode ? 'white' : 'black' }}>4.5. Website Content</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          The extension collects YouTube URLs when users save videos to their watchlist. This data is essential for the extension to function as intended and is not shared externally.
        </Paragraph>
        
        <Title level={3} style={{ color: isDarkMode ? 'white' : 'black' }}>Contact Us</Title>
        <Paragraph style={{ color: isDarkMode ? 'white' : 'black' }}>
          If you have any questions or concerns about this privacy policy, please contact us at <a href="mailto:bertrand@atemkeng.de">bertrand@atemkeng.de</a>.
        </Paragraph>
      </Content>
       </div>

    </Layout>
  );
};

export default PrivacyPolicy;

