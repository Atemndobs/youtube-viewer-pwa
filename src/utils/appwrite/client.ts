// "use client";

// import { Account, Appwrite, Storage } from "@refinedev/appwrite";
// import { APPWRITE_JWT_KEY, APPWRITE_PROJECT, APPWRITE_URL } from "../constants"; // Corrected path
// import Cookies from "js-cookie";



// // Initialize Appwrite client
// export const appwriteClient = new Appwrite();

// console.log("====================================");


// // Set JWT if available in cookies
// const appwriteJWT = Cookies.get(APPWRITE_JWT_KEY);

// console.log("appwriteJWT", appwriteJWT);

// if (appwriteJWT) {
//   appwriteClient.setJWT(appwriteJWT);
// }

// // Configure Appwrite client with endpoint and project
// appwriteClient.setEndpoint(APPWRITE_URL).setProject(APPWRITE_PROJECT);

// // Initialize and export Appwrite services
// export const appwriteAccount = new Account(appwriteClient);
// export const appwriteStorage = new Storage(appwriteClient);

// import { APPWRITE_JWT_KEY, APPWRITE_PROJECT, APPWRITE_URL } from "../constants"; // Corrected path
// import { Client, Account } from "appwrite";
// import {
//   APPWRITE_JWT_KEY,
//   APPWRITE_PROJECT,
//   APPWRITE_URL,
// } from "../constants";
// import { cookies } from "next/headers";
// import { Account, Client } from "node-appwrite";

// export const getSessionClient = async () => {
//   const client = new Client()
//     .setEndpoint("http://appwrite.atemkeng.de:8060/v1")
//     .setProject("66ddb94b000f6fb2b9d2");

//   const session = cookies().get(APPWRITE_JWT_KEY);
//   if (!session || !session.value) {
//     throw new Error("No session");
//   }

//   client.setJWT(session.value);

//   return {
//     get account() {
//       return new Account(client);
//     },
//   };
// };





// const client = new Client()
//     .setEndpoint("http://appwrite.atemkeng.de:8060/v1") // Your API Endpoint
//     .setProject("66ddb94b000f6fb2b9d2"); // Your project ID

// const account = new Account(client);

// const result = await account.get();

// console.log(result);


"use client";

import { Account, Appwrite, Storage, Databases } from "@refinedev/appwrite";
import {
  APPWRITE_JWT_KEY,
  APPWRITE_PROJECT,
  APPWRITE_URL,
} from "../constants";
import Cookies from "js-cookie";

export const appwriteClient = new Appwrite();

const appwriteJWT = Cookies.get(APPWRITE_JWT_KEY);


console.log("====================================");

console.log("appwriteJWT", appwriteJWT);

if (appwriteJWT) {
  appwriteClient.setJWT(appwriteJWT);
}

appwriteClient.setEndpoint(APPWRITE_URL).setProject(APPWRITE_PROJECT);

export const appwriteAccount = new Account(appwriteClient);
export const appwriteStorage = new Storage(appwriteClient);
export const appwriteDatabase = new Databases(appwriteClient);

