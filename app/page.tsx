import { auth } from "@clerk/nextjs/server";
import { ArrowRightCircleIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { Footer } from "./components/footer";

export default async function Home() {
  const { sessionId } = auth();

  if (sessionId) {
    redirect("/home");
  }

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-between">
      <div
        aria-hidden="true"
        className="background-gradient-pattern pointer-events-none absolute left-1/2 top-0 z-10 h-[200px] w-full -translate-x-1/2 -translate-y-1/2 opacity-[0.15]"
      />

      {/* Vector from https://vaul.emilkowal.ski/ */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full stroke-gray-200 opacity-50 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="FCFCFD"
            width="200"
            height="200"
            x="50%"
            y="-1"
            patternUnits="userSpaceOnUse"
          >
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="-1" className="overflow-visible fill-gray-50">
          <path
            d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
            strokeWidth="0"
          />
        </svg>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#FCFCFD)" />
      </svg>

      <div className="mx-auto mt-4 flex min-h-full w-full max-w-2xl flex-col justify-start px-4 md:mt-[-3.5rem] md:min-h-screen  md:justify-center md:px-0">
        <div className="home-banner rounded-lg border border-gray-100 bg-[#FCFCFD] p-6 shadow-sm backdrop-blur-md md:p-8">
          <h1 className="font-serif text-2xl text-gray-900">
            Coolection <span className="h-8 w-8 text-2xl">🍵</span>
          </h1>

          <div className="mt-3 text-pretty text-sm leading-relaxed text-gray-800">
            <p className="mt-2">
              The internet is <span className="font-medium">great</span>, but
              internet resources can be short-lived. The Internet Archive
              created the{" "}
              <a
                href="https://web.archive.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 no-underline hover:underline"
              >
                Wayback Machine
              </a>{" "}
              to archive the internet, while GitHub preserves codebases in the{" "}
              <a
                href="https://archiveprogram.github.com/arctic-vault"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 no-underline hover:underline"
              >
                Arctic Code Vault
              </a>
              .
            </p>
            <p className="mt-2">
              But what about the links you find useful? They are scattered
              across your browser bookmarks, notes, messages, and emails.
            </p>
            <p className="mt-2">
              Now, all you need to do is <i>remember</i> to save them.
            </p>
          </div>

          <div className="mt-6 text-end">
            <Link
              href="/sign-in"
              className="group rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/90"
            >
              Sign in{""}
              <ArrowRightCircleIcon className="ml-1.5 mt-[-2px] inline-block h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
