import { ArrowRightCircleIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function Home() {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-between px-4 md:px-0">
      <div className="mx-auto mt-4 flex min-h-screen w-full max-w-xl flex-col justify-start md:mt-[-2.5rem] md:justify-center">
        <div className="rounded-lg bg-gray-100/90 p-6 shadow-inner backdrop-blur md:p-12">
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
              Now all you need to do is <i>remember</i> to save them.
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
    </main>
  );
}
