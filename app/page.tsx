import { auth, clerkClient } from "@clerk/nextjs/server";
import React from "react";

import { saveOrUpdateUser } from "@/lib/save-or-update-user";

import { HomePage } from "./components/home";

export default async function Home() {
  const { userId } = auth().protect();

  // TODO: store userId to GlobalsProvider
  // console.log("userId: ", userId);

  const user = await clerkClient.users.getUser(userId);

  if (!user) return null;

  // console.log("user: ", user);

  const userData = {
    userId: user.id,
    email: user.emailAddresses[0].emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  // console.log("userData: ", userData);

  await saveOrUpdateUser(userData);

  return (
    <>
      <HomePage />
    </>
  );
}
