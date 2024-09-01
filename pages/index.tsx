import React from 'react';
import YouTubePlayer from '../src/components/YouTubePlayer';
import { Layout } from '../src/components/Layout'; // Adjust path as necessary

const HomePage: React.FC = () => {
  return (
    <Layout>
      <YouTubePlayer />
    </Layout>
  );
};

export default HomePage;
