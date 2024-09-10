require('dotenv').config();


export const APPWRITE_JWT_KEY = "appwrite-jwt";
export const APPWRITE_URL = process.env.NEXT_PUBLIC_APPWRITE_URL || "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "66dd6a930016525d0250";
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "66dd6b2e001e88088187";
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || "66dd6b3f00091b47a5e5";
export const APPWRITE_API_KEY = process.env.NEXT_PUBLIC_APPWRITE_API_KEY || "standard_9378b884fd1e991ad418fee4217df927dcb39f25ca3058312c3bad42b80e616a9ffd19d3c635e62d8952e24fcd3c60f9c745e0cf26305f6526f9d9b9f580f4aca1db077b6c7f2e2eabbec959b698b6515905931e7baf09cdfe55f373becf487cc78e6300f850525ed278733e2d6e90deb424601be9671f975ccef7f790f8a125";

