import { NextApiRequest, NextApiResponse } from "next";
import pb from "src/utils/pocketbaseClient"; // Import PocketBase client
import { getYouTubeVideoTitle, isValidYouTubeUrl } from "src/utils";
import usePlaylistStore from "src/store/playlistStore";
import { parse } from "path";

// API Handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Handle GET request to fetch playlist
    if (req.method === "GET") {
      const deviceId = req.headers["device-id"] as string;
      console.log("===================STARTING GET REQUEST=====================");

      console.log({ deviceId });

      if (!deviceId) {
        return res.status(400).json({ error: "Device ID is required." });
      }

      pb.autoCancellation(false)
      const response = await pb.collection('playlist').getFullList({
        filter: `deviceId="${deviceId}"`
      });

      const playlist = response.map((doc) => ({
        url: doc.url,
        title: doc.title,
      }));

      return res.status(200).json({ playlist });
    }

    // Handle POST request to modify playlist
    if (req.method === "POST") {
      const { url, action, deviceId }: { url?: string; action?: "remove" | "clear"; deviceId: string } = req.body;

      const playlistStore = usePlaylistStore.getState();

      // Clear the playlist for the specific device
      if (action === "clear") {
        pb.autoCancellation(false)
        const response = await pb.collection('playlist').getFullList({
          filter: `deviceId="${deviceId}"`
        });

        for (const doc of response) {
          await pb.collection('playlist').delete(doc.id);
        }
        console.log("Playlist cleared");
        console.log({ response });

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

        const response = await pb.collection('playlist').getFullList({
          filter: `deviceId="${deviceId}" && url="${url}"`
        });

        if (response.length === 0) {
          return res.status(404).json({ error: "URL not found in playlist" });
        }

        await pb.collection('playlist').delete(response[0].id);
        playlistStore.removePlaylist(url);

        console.log({
          "message": "URL removed from playlist",
          url,
          deviceId
        });

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

        console.log("____________Adding URL to playlist__________________");

        // Get the video title (which could be null)
        const video = await getYouTubeVideoTitle(url);

        // Ensure title is a string, use a fallback if null
        const safeTitle = video.title || "Unknown Title";
        const publishedAt = video.stats?.uploadedAt || 'Long time ageo';
        const views = video.stats?.views || 0;
        const likes = video.stats?.likes || 0;
        console.log('TITLE URL================');
        console.log({ safeTitle });

        const response = await pb.collection('playlist').getFullList({
          filter: `deviceId="${deviceId}" && url="${url}"`
        });

        if (response.length > 0) {
          console.log("URL already exists");
          return res.status(200).json({
            message: "URL already in playlist",
            playlist: playlistStore.playlist,
          });
        }

        await pb.collection('playlist').create({
          url,
          deviceId,
          title: safeTitle,
          publishedAt,
          views,
          likes
        });

        // Add to playlist store with the safe title
        playlistStore.addToPlaylist({ url, title: safeTitle, publishedAt, views, likes });

        console.log({
          message: "URL added to playlist",
          url,
          deviceId,
          title: safeTitle,
          publishedAt,
          views,
          likes
        });

        const updatedResponse = await pb.collection('playlist').getFullList({
          filter: `deviceId="${deviceId}"`
        });

        const newPlaylist = updatedResponse.map((doc) => {
          return { url: doc.url, title: doc.title, publishedAt: doc.publishedAt, views: doc.views, likes: doc.likes };
        });

        console.log("Updated Response", updatedResponse);

        console.log('NEW PLAYLIST -----');
        console.log(newPlaylist);

        return res.status(200).json({
          message: "URL added to playlist",
          playlist: newPlaylist
        });
      } else {
        return res.status(400).json({ error: "URL is required for add action" });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Database error" });
  }
}