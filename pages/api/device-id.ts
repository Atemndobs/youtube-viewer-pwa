// src/pages/api/device-id.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { appwriteDatabase } from '../../src/utils/appwrite/client';
import { DATABASE_ID, COLLECTION_ID } from '../../src/utils/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const deviceId = req.headers['device-id'] as string | null;

        try {
            const retrievedDeviceId = await getDeviceIdFromDatabase(deviceId);
            console.log('retrievedDeviceId', retrievedDeviceId);
            
            if (retrievedDeviceId) {
                return res.status(200).json({ deviceId: retrievedDeviceId });
            } else {
                return res.status(404).json({ error: 'Device ID not found' });
            }
        } catch (error) {
            console.error('Error handling GET request:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function getDeviceIdFromDatabase(deviceId: string | null) {
    console.log('deviceId', deviceId);
    
    if (deviceId) {
        try {
            // Example logic to retrieve device ID from the database
            const device = await appwriteDatabase.getDocument(DATABASE_ID, COLLECTION_ID, deviceId);
            return device ? device.deviceId : null;
        } catch (error) {
            console.error('Error retrieving device ID from database:', error);
            return null;
        }
    }
    
    // Create a new device ID if not found
    const newDeviceId = 'device-' + Math.random().toString(36).substr(2, 9);
    try {
        await appwriteDatabase.createDocument(DATABASE_ID, COLLECTION_ID, newDeviceId, { deviceId: newDeviceId });
        return newDeviceId;
    } catch (error) {
        console.error('Error creating new device ID:', error);
        return null;
    }
}