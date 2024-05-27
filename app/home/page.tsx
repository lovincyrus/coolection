"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import React from "react";

import { saveOrUpdateUser } from "@/lib/save-or-update-user";

import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { ListNavigationClient } from "../components/list-navigation-client";
import { MainResultsClient } from "../components/main-results-client";
import { SearchBar } from "../components/search-bar";

export async function generateMetadata() {
  return {
    title: "Home · Coolection",
  };
}

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
    <main>
      <div className="mx-auto min-h-dvh w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        <Header heading="Home" />

        <div className="mt-14 flex flex-col">
          <ListNavigationClient />

          <div className="h-4" />

          <SearchBar />

          <div className="h-4" />

          <MainResultsClient />
        </div>
      </div>

      <Footer type="home" />
    </main>
  );
}
