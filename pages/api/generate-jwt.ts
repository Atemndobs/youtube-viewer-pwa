// src/pages/api/generate-jwt.ts

import { NextApiRequest, NextApiResponse } from "next";
import { APPWRITE_URL, APPWRITE_PROJECT, APPWRITE_API_KEY } from "../../src/utils/constants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const response = await fetch(`${APPWRITE_URL}/v1/account/jwt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": APPWRITE_PROJECT,
        "X-Appwrite-Key": APPWRITE_API_KEY,
      },
      body: JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600, // Token expiration time
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to generate JWT");
    }

    res.status(200).json({ jwt: data.jwt });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
}
