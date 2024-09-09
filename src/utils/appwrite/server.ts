// src/utils/appwrite/server.ts

import {
  APPWRITE_JWT_KEY,
  APPWRITE_PROJECT,
  APPWRITE_URL,
} from "../constants";
import { cookies } from "next/headers";
import { Account, Client } from "node-appwrite";

export const getSessionClient = async () => {
  const client = new Client()
    .setEndpoint("http://appwrite.atemkeng.de:8060/v1")
    .setProject("66ddb94b000f6fb2b9d2");

  const session = cookies().get(APPWRITE_JWT_KEY);
  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setJWT(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
};