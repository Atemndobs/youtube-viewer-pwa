// playlist.ts
import { NextApiRequest, NextApiResponse } from "next";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { isValidYouTubeUrl } from "../../src/utils";
import usePlaylistStore from "../../src/store/playlistStore";
import WebSocket from "ws";

// Define the path to your database
const dbPath = "./db.db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Helper function to initialize the database and ensure the playlist table exists
  const initializeDatabase = async () => {
    // Open database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    // Create the playlist table if it doesn't exist
    await db.exec(`
    CREATE TABLE IF NOT EXISTS playlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      deviceId TEXT NOT NULL
    )
  `);

    return db;
  };

  const db = await initializeDatabase();

  // Extract deviceId from the headers (or generate a unique one if not provided)
  const deviceId = req.headers['device-id'] as string;
  if (!deviceId) {
    return res.status(400).json({ error: "Device ID is required." });
  }

  if (req.method === "GET") {
    try {
      // Fetch playlist items for the specific device from the database
      const rows = await db.all("SELECT url FROM playlist WHERE deviceId = ?", [deviceId]);
      // Return the playlist as JSON
      res.status(200).json({ playlist: rows.map((row) => row.url) });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
    } finally {
      await db.close(); // Ensure database connection is closed
    }
  } else if (req.method === "POST") {
    const { url, action }: { url?: string; action?: "remove" | "clear" } = req.body;

    // Access the Zustand store
    const playlistStore = usePlaylistStore.getState();

    try {
      if (action === "clear") {
        // Clear the playlist for this specific device in the database
        await db.run("DELETE FROM playlist WHERE deviceId = ?", [deviceId]);

        // Clear the playlist in Zustand store
        playlistStore.clearPlaylist();

        // WebSocket Communication
        const socketUrl = process.env.WEBSOCKET_URL || "wss://viewer.atemkeng.de/ws";
        const ws = new WebSocket(socketUrl);

        ws.on("open", () => {
          ws.send(JSON.stringify({ action: "clear" }));
          ws.close();
        });

        return res.status(200).json({
          message: "Playlist cleared",
          playlist: playlistStore.playlist,
        });
      }

      if (action === "remove") {
        if (!url) {
          return res.status(400).json({ error: "URL is required for remove action" });
        }

        // Check if the URL exists in the database for this specific device
        const existingUrl = await db.get("SELECT url FROM playlist WHERE url = ? AND deviceId = ?", [url, deviceId]);
        if (!existingUrl) {
          return res.status(404).json({ error: "URL not found in playlist" });
        }

        // Remove URL from the database for this device
        await db.run("DELETE FROM playlist WHERE url = ? AND deviceId = ?", [url, deviceId]);

        // Remove URL from Zustand store
        playlistStore.removePlaylist(url);

        // WebSocket Communication
        const socketUrl = process.env.WEBSOCKET_URL || "wss://viewer.atemkeng.de/ws";
        const ws = new WebSocket(socketUrl);

        ws.on("open", () => {
          ws.send(JSON.stringify({ action: "remove", url }));
          ws.close();
        });

        return res.status(200).json({
          message: "URL removed from playlist",
          playlist: playlistStore.playlist,
        });
      }

      // Default action is to add the URL
      if (url) {
        if (!isValidYouTubeUrl(url)) {
          return res.status(400).json({ error: "Invalid YouTube URL" });
        }

        // Check if the URL already exists for this device in the database
        const existingUrl = await db.get("SELECT url FROM playlist WHERE url = ? AND deviceId = ?", [url, deviceId]);
        if (existingUrl) {
          return res.status(200).json({
            message: "URL already in playlist",
            playlist: playlistStore.playlist,
          });
        }

        // Add URL to the database for this device
        await db.run("INSERT INTO playlist (url, deviceId) VALUES (?, ?)", [url, deviceId]);

        // Add URL to Zustand store
        playlistStore.addToPlaylist(url);

        // WebSocket Communication
        const socketUrl = process.env.WEBSOCKET_URL || "wss://viewer.atemkeng.de/ws";
        const ws = new WebSocket(socketUrl);

        ws.on("open", () => {
          ws.send(JSON.stringify({ action: "add", url }));
          ws.close();
        });

        return res.status(200).json({
          message: "URL added to playlist",
          playlist: playlistStore.playlist,
        });
      } else {
        return res.status(400).json({ error: "URL is required for add action" });
      }
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    } finally {
      await db.close(); // Ensure database connection is closed
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
