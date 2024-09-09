// src/pages/api/playlist.ts

import { NextApiRequest, NextApiResponse } from "next";
import { appwriteDatabase, appwriteClient } from "../../src/utils/appwrite/client"; // Adjust path as necessary
import { DATABASE_ID, COLLECTION_ID } from "../../src/utils/constants";
import { isValidYouTubeUrl } from "../../src/utils";
import usePlaylistStore from "../../src/store/playlistStore";

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
    // Handle GET request to fetch playlist
    if (req.method === "GET") {
      const deviceId = req.headers["device-id"] as string;
      console.log("===================STARTING GET REQUEST=====================");
      
      console.log({deviceId});

      
      if (!deviceId) {
        return res.status(400).json({ error: "Device ID is required." });
      }

      const response = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal('deviceId', deviceId)
      ]);
      

      const playlist = response.documents.map((doc) => doc.url);
      // console.log({ playlist });
      

      return res.status(200).json({ playlist });
    }

    // Handle POST request to modify playlist
    if (req.method === "POST") {
      const { url, action, deviceId }: { url?: string; action?: "remove" | "clear"; deviceId: string } = req.body;

      const playlistStore = usePlaylistStore.getState();

      // Clear the playlist for the specific device
      if (action === "clear") {
        const response = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.equal('deviceId', deviceId)
        ]);

        for (const doc of response.documents) {
          await db.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
        }
        
        playlistStore.clearPlaylist();
        return res.status(200).json({
          message: "Playlist cleared",
          playlist: playlistStore.playlist,
        });
      }

      // Remove a specific URL from the playlist
      if (action === "remove") {
        if (!url) {
          return res.status(400).json({ error: "URL is required for remove action" });
        }

        const response = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.equal('deviceId', deviceId),
          Query.equal('url', url)
        ]);

        if (response.documents.length === 0) {
          return res.status(404).json({ error: "URL not found in playlist" });
        }

        await db.deleteDocument(DATABASE_ID, COLLECTION_ID, response.documents[0].$id);
        playlistStore.removePlaylist(url);

        return res.status(200).json({
          message: "URL removed from playlist",
          playlist: playlistStore.playlist,
        });
      }

      // Add a new URL to the playlist
      if (url) {
        if (!isValidYouTubeUrl(url)) {
          return res.status(400).json({ error: "Invalid YouTube URL" });
        }

        const response = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.equal('deviceId', deviceId),
          Query.equal('url', url)
        ]);

        if (response.documents.length > 0) {
          return res.status(200).json({
            message: "URL already in playlist",
            playlist: playlistStore.playlist,
          });
        }

        await db.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
          url,
          deviceId
        });

        playlistStore.addToPlaylist(url);

        const updatedResponse = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.equal('deviceId', deviceId)
        ]);

        return res.status(200).json({
          message: "URL added to playlist",
          playlist: updatedResponse.documents.map((doc) => doc.url),
        });
      } else {
        return res.status(400).json({ error: "URL is required for add action" });
      }
    }

    // // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Database error" });
  }
}

