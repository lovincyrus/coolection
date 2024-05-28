import { ArrowRightCircleIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import React from "react";

import { Footer } from "./components/footer";

export default async function RootPage() {
  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-between">
      <div
        aria-hidden="true"
        className="background-gradient-pattern pointer-events-none absolute left-1/2 top-0 z-10 hidden h-[100px] w-full -translate-x-1/2 -translate-y-1/2 opacity-[0.15] md:block"
      />

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

      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-1 flex-col justify-center px-4 md:mt-[-3.5rem] md:px-0">
        <div className="bg-transparent p-6 md:p-8 ">
          <h1 className="relative z-20 text-center font-serif text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl ">
            Superhuman for bookmarking
          </h1>

          <div className="relative z-20 mt-3 grid gap-4 leading-relaxed text-gray-800 ">
            <p className="mx-auto mt-6 max-w-3xl text-balance text-center text-lg">
              <span className="font-medium">Coolection</span> makes saving,
              organizing, and retrieving your favorite links easy.
            </p>
          </div>

          <div className="relative z-20 mx-auto mt-12 flex max-w-xs flex-col items-center space-y-4 text-center ">
            <Link
              href="/sign-in"
              className="text-md group rounded-full bg-black/80 px-4 py-2 font-semibold text-white transition-colors hover:bg-black/90"
            >
              Sign in{""}
              <ArrowRightCircleIcon className="ml-1.5 mt-[-2px] inline-block h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:transition-transform" />
            </Link>

            <p className="max-w-[8em] text-xs text-neutral-500">
              Available online or self-hosted
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
