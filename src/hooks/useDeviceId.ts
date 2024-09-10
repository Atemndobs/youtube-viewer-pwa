import { useEffect, useState } from 'react';

const generateDeviceId = () => {
  return 'device-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrGenerateDeviceId = async () => {
      // Check if the deviceId exists in localStorage
      let storedDeviceId = localStorage.getItem('deviceId');

      if (!storedDeviceId) {
        // If no deviceId exists, fetch it from the server or generate a new one
        try {
          const response = await fetch('/api/deviceId');
          const data = await response.json();
          storedDeviceId = data.deviceId || generateDeviceId();  // Generate a new one if not available
        } catch (error) {
          console.error('Failed to fetch or generate deviceId:', error);
          storedDeviceId = generateDeviceId();  // Fallback to generating a new deviceId
        }
      }

      // Ensure that storedDeviceId is always a string before storing it
      if (storedDeviceId) {
        localStorage.setItem('deviceId', storedDeviceId);
        setDeviceId(storedDeviceId);
      }
    };

    fetchOrGenerateDeviceId();
  }, []);

  return deviceId;
};

export default useDeviceId;
