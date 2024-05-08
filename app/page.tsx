import Link from "next/link";
import React from "react";

export default async function Home() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-between px-4 md:px-0">
      <div className="mx-auto mt-[-4rem] flex min-h-screen w-full max-w-xl flex-col justify-center">
        <h1 className="font-serif text-2xl text-gray-900">
          Coolection <span className="h-8 w-8 text-2xl">🍵</span>
        </h1>

        <div className="mt-3 text-pretty text-sm text-gray-800">
          <p className="mt-2">
            The internet is <span className="font-medium">great</span>, but
            internet resources can be short-lived. The Internet Archive created
            the Wayback Machine to archive the internet, while GitHub preserves
            codebases in the Arctic Code Vault.
          </p>
          <p className="mt-2">
            But what about the links you find useful? They are scattered across
            your browser bookmarks, notes, messages, and emails.
          </p>
          <p className="mt-2">
            Now all you need to do is <i>remember</i> to save them.
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/sign-in"
            className="rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
