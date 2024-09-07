import { NextApiRequest, NextApiResponse } from "next";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { isValidYouTubeUrl } from "../../src/utils";
import usePlaylistStore from "../../src/store/playlistStore";
import WebSocket from "ws";

// Define the path to your database
const dbPath = "./db.db";

// Helper function to initialize the database and ensure the playlist table exists
const initializeDatabase = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS playlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      deviceId TEXT NOT NULL
    )
  `);
  return db;
};

// API Handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Initialize the database aaa
  const db = await initializeDatabase();


  try {
    // Handle GET request to fetch playlist
    if (req.method === "GET") {
      // Extract deviceId from the headers (or generate a unique one if not provided)
      const deviceId = req.headers["device-id"] as string;
      console.log({deviceId});
      
      if (!deviceId) {
        return res.status(400).json({ error: "Device ID is required." });
      }
      const rows = await db.all("SELECT url FROM playlist WHERE deviceId = ?", [
        deviceId,
      ]);
      return res.status(200).json({ playlist: rows.map((row) => row.url) });
    }

    // Handle POST request to modify playlist
    if (req.method === "POST") {
      const { url, action, deviceId }: { url?: string; action?: "remove" | "clear"; deviceId: string } = req.body;

      console.log({url, action, deviceId});
      


      

      // Access Zustand store
      const playlistStore = usePlaylistStore.getState();

      // Clear the playlist for the specific device
      if (action === "clear") {
        await db.run("DELETE FROM playlist WHERE deviceId = ?", [deviceId]);
        playlistStore.clearPlaylist();
        // get all playlist for this device
        const rows = await db.all("SELECT url FROM playlist WHERE deviceId = ?", [
          deviceId,
        ]);
        console.log({rows});
        

        // WebSocket Communication
        notifyWebSocket("clear", deviceId, null);

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

        const existingUrl = await db.get(
          "SELECT url FROM playlist WHERE url = ? AND deviceId = ?",
          [url, deviceId]
        );
        if (!existingUrl) {
          return res.status(404).json({ error: "URL not found in playlist" });
        }

        await db.run("DELETE FROM playlist WHERE url = ? AND deviceId = ?", [
          url,
          deviceId,
        ]);
        playlistStore.removePlaylist(url);

        // WebSocket Communication
        notifyWebSocket("remove", deviceId, url);

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

        const existingUrl = await db.get(
          "SELECT url FROM playlist WHERE url = ? AND deviceId = ?",
          [url, deviceId]
        );
        if (existingUrl) {
          return res
            .status(200)
            .json({
              message: "URL already in playlist",
              playlist: playlistStore.playlist,
            });
        }

        await db.run("INSERT INTO playlist (url, deviceId) VALUES (?, ?)", [
          url,
          deviceId,
        ]);
        playlistStore.addToPlaylist(url);

        // WebSocket Communication
        notifyWebSocket("add", deviceId, url);

        return res.status(200).json({
          message: "URL added to playlist",
          playlist: playlistStore.playlist,
        });
      } else {
        return res.status(400).json({ error: "URL is required for add action" });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  } finally {
    await db.close(); // Ensure database connection is closed
  }
}

// WebSocket Notification Helper
function notifyWebSocket(action: string, deviceId: string | null, url: string | null) {
  const socketUrl = process.env.WEBSOCKET_URL || "wss://viewer.atemkeng.de/ws";
  // const socketUrl = "ws://localhost:8681/ws";
  const ws = new WebSocket(socketUrl);

  ws.on("open", () => {
    ws.send(JSON.stringify({ action, deviceId, url }));
    ws.close();
  });

  ws.on("error", (error: WebSocket.ErrorEvent) => {
    console.error("WebSocket error:", error);
  });
}
