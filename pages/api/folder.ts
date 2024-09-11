
import { NextApiRequest, NextApiResponse } from "next";
import { appwriteDatabase } from "../../src/utils/appwrite/client"; // Adjust path as necessary
import { DATABASE_ID, FOLDER_COLLECTION_ID } from "../../src/utils/constants";
import { Query } from "appwrite";

// Helper function to initialize the Appwrite database
const getAppwriteDatabase = async () => {
    const database = appwriteDatabase;
    return database;
  };
  
  // API Handler
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const db = await getAppwriteDatabase();
  
  
    try {
      // Handle POST request to create a folder
      if (req.method === "POST") {
        const { folderName, playlistItems, deviceId }: { folderName: string; playlistItems: { url: string; title: string }[]; deviceId: string } = req.body;
  
        if (!folderName || !playlistItems || !deviceId) {
          return res.status(400).json({ error: "folderName, playlistItems, and deviceId are required" });
        }
  
        // Check if the folder with the same name already exists for the device
        const existingFolder = await db.listDocuments(DATABASE_ID, FOLDER_COLLECTION_ID, [
          Query.equal('deviceId', deviceId),
          Query.equal('folderName', folderName),
        ]);
  
        if (existingFolder.documents.length > 0) {
          return res.status(400).json({ error: "Folder already exists" });
        }
  
        // Create a new folder
        await db.createDocument(DATABASE_ID, FOLDER_COLLECTION_ID, 'unique()', {
          folderName,
          playlistItems,
          deviceId
        });
  
        return res.status(201).json({
          message: "Folder created successfully",
          folderName,
        });
      }
  
      // Handle GET request to fetch folders
      if (req.method === "GET") {
        const deviceId = req.headers["device-id"] as string;
  
        if (!deviceId) {
          return res.status(400).json({ error: "Device ID is required." });
        }
  
        const response = await db.listDocuments(DATABASE_ID, FOLDER_COLLECTION_ID, [
          Query.equal('deviceId', deviceId),
        ]);
  
        const folders = response.documents.map((doc) => ({
          folderName: doc.folderName,
          playlistItems: doc.playlistItems
        }));
  
        return res.status(200).json({ folders });
      }
  
      // Method not allowed
      return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }
  };
  
  