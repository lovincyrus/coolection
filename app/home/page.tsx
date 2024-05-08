import { auth, clerkClient } from "@clerk/nextjs/server";
import React from "react";

import { saveOrUpdateUser } from "@/lib/save-or-update-user";

import { HomeHome } from "../components/home-home";

export default async function Home() {
  const { userId } = auth().protect();

  const user = await clerkClient.users.getUser(userId);

  if (!user) return null;

  const userData = {
    userId: user.id,
    email: user.emailAddresses[0].emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await saveOrUpdateUser(userData);

  return <HomeHome />;
}
