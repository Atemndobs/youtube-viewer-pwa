require('dotenv').config();


console.log("process.env.APPWRITE_URL", process.env.APPWRITE_URL);


export const APPWRITE_JWT_KEY = "appwrite-jwt";
export const APPWRITE_URL = process.env.NEXT_PUBLIC_APPWRITE_URL;
export const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;
export const APPWRITE_API_KEY = process.env.NEXT_PUBLIC_APPWRITE_API_KEY;


