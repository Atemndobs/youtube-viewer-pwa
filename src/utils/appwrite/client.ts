
"use client";

// import { Account, Appwrite, Storage } from "@refinedev/appwrite";
import { Client, Databases, Query, Account,Storage } from "appwrite";
import {
  APPWRITE_JWT_KEY,
  APPWRITE_PROJECT,
  APPWRITE_URL,
  COLLECTION_ID,
  DATABASE_ID,
} from "../constants";
import Cookies from "js-cookie";

export const appwriteClient = new Client();

const appwriteJWT = Cookies.get(APPWRITE_JWT_KEY);


// console.log("====================================");

// console.log("appwriteJWT", appwriteJWT);

if (appwriteJWT) {
  appwriteClient.setJWT(appwriteJWT);
}


appwriteClient.setEndpoint(APPWRITE_URL).setProject(APPWRITE_PROJECT);


export const appwriteAccount = new Account(appwriteClient);
export const appwriteStorage = new Storage(appwriteClient);
export const appwriteDatabase = new Databases(appwriteClient);
export const appwriteQuery = Query;





