import {
  ArrowRightIcon,
  BookmarkIcon,
  CompassIcon,
  FolderOpenIcon,
  GlobeIcon,
  PuzzleIcon,
  SearchIcon,
} from "lucide-react";
import { Link } from "next-view-transitions";
import Balancer from "react-wrap-balancer";

import { Footer } from "./components/footer";

const platforms = [
  {
    icon: GlobeIcon,
    label: "Web App",
    description: "Save and manage bookmarks from any browser",
  },
  {
    icon: PuzzleIcon,
    label: "Chrome Extension",
    description: "One-click save from your toolbar",
  },
  {
    icon: CompassIcon,
    label: "Safari Extension",
    description: "Native extension for Safari on iOS and Mac",
  },
];

const features = [
  {
    icon: BookmarkIcon,
    label: "Save",
    description:
      "One click to save. Use browser extensions or the web app to capture any link instantly.",
  },
  {
    icon: FolderOpenIcon,
    label: "Organize",
    description:
      "Collections that make sense. Group bookmarks into lists and find them when you need them.",
  },
  {
    icon: SearchIcon,
    label: "Search",
    description:
      "Find anything fast. Full-text search across all your saved links and metadata.",
  },
];

export default async function RootPage() {
  return (
    <main className="relative flex w-full flex-col items-center">
      {/* Hero */}
      <section
        aria-label="Hero"
        className="relative flex min-h-[80dvh] w-full flex-col items-center justify-center"
      >
        <div
          aria-hidden="true"
          className="background-gradient-pattern pointer-events-none absolute left-1/2 top-0 z-10 hidden h-[100px] w-full -translate-x-1/2 -translate-y-1/2 opacity-[0.15] md:block"
        />

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full stroke-border opacity-50 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid"
              width="200"
              height="200"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y="-1" className="overflow-visible fill-surface">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth="0"
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth="0"
            fill="url(#grid)"
          />
        </svg>

        <div className="relative z-20 mx-auto w-full max-w-2xl px-4 text-center">
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Your bookmarks, everywhere
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg text-text-secondary">
            <Balancer>
              Save from Chrome, Safari, or the web. Find anything instantly.
            </Balancer>
          </p>

          <div className="mt-10">
            <Link
              href="/sign-in"
              className="text-md group inline-flex items-center rounded-full bg-inverted px-5 py-2.5 font-semibold text-text-inverted transition-colors hover:opacity-90"
            >
              Get started
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section
        aria-label="Platforms"
        className="w-full py-20 md:py-28"
      >
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-center font-serif text-2xl font-bold text-text-primary sm:text-3xl">
            Save from anywhere
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {platforms.map((platform) => (
              <div key={platform.label} className="text-center">
                <platform.icon className="mx-auto h-6 w-6 text-icon-default" />
                <p className="mt-3 text-sm font-medium text-text-primary">
                  {platform.label}
                </p>
                <p className="mt-1 text-sm text-text-tertiary">
                  {platform.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-label="Features" className="w-full py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="rounded-lg bg-surface p-6"
              >
                <feature.icon className="h-5 w-5 text-icon-default" />
                <p className="mt-3 text-sm font-medium text-text-primary">
                  {feature.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-tertiary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section aria-label="Preview" className="w-full py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <div className="overflow-hidden rounded-xl border shadow-sm">
            {/* Browser title bar */}
            <div className="flex items-center gap-1.5 bg-surface-hover px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            </div>
            {/* Demo video */}
            <div className="relative aspect-[16/10] w-full bg-bg">
              <video
                src="/demo-dashboard.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="h-full w-full object-cover object-top"
                aria-label="Coolection dashboard demo showing bookmarks being searched and organized"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Self-hosting */}
      <section
        aria-label="Self-hosting"
        className="w-full bg-surface py-20 md:py-28"
      >
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-text-primary sm:text-3xl">
            Open source &amp; self-hosted
          </h2>

          <p className="mx-auto mt-4 max-w-md text-text-secondary">
            Run Coolection on your own infrastructure. Fully open source.
          </p>

          <div className="mt-8">
            <a
              href="https://github.com/lovincyrus/coolection"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border bg-bg px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              View on GitHub
              <ArrowRightIcon className="ml-2 h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
