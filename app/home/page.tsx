import { auth, clerkClient } from "@clerk/nextjs/server";
import React from "react";

import { saveOrUpdateUser } from "@/lib/save-or-update-user";

import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Search } from "../components/search";

export default async function HomePage() {
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

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-between">
      <div className="mx-auto mt-4 w-full max-w-2xl px-4 md:px-0">
        <Header />
        <Search />
      </div>

      <Footer />
    </main>
  );
}
