import { ArrowRightCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Footer } from "./components/footer";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export default async function RootPage() {
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

      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-1 flex-col justify-center px-4 md:mt-[-3.5rem] md:px-0">
        <div className="simple-bg rounded-lg border border-gray-100 bg-[#FCFCFD] p-6 shadow-sm backdrop-blur-md md:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Coolection <span className="h-8 w-8 text-2xl">🍵</span>
          </h1>

          <div className="mt-3 grid gap-4 text-pretty leading-relaxed text-gray-800">
            <p className="text-sm">
              <span className="font-medium">Coolection</span> makes organizing
              your favorite links easy. It&apos;s designed to be single-purpose
              and focused on simplicity.
            </p>
          </div>

          <div className="mt-4 text-start">
            <Link
              href="/sign-in"
              className="group rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/90"
            >
              Sign in{""}
              <ArrowRightCircleIcon className="ml-1.5 mt-[-2px] inline-block h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:transition-transform" />
            </Link>
          </div>

          <figure className="mt-6 flex h-full w-full flex-col items-center justify-center gap-6">
            <Image
              src="/demo.png"
              width={580}
              height={500}
              placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(580, 500))}`}
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
              alt="Screenshot of Coolection"
              className="mt-6 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            />

            <figcaption className="font-serif text-sm">
              <q>Superhuman for bookmarking</q>
            </figcaption>
          </figure>
        </div>
      </div>

      <Footer />
    </main>
  );
}
