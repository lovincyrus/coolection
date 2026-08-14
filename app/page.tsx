import {
  BookmarkIcon,
  ChromeIcon,
  CompassIcon,
  FolderOpenIcon,
  GithubIcon,
  ListPlusIcon,
  SearchIcon,
  ServerIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";

import { fontSerif } from "@/lib/fonts";

const features = [
  {
    icon: BookmarkIcon,
    title: "One-click saving",
    description: "Keep the page you’re on without breaking your flow",
  },
  {
    icon: FolderOpenIcon,
    title: "Flexible lists",
    description: "Organize bookmarks around projects, interests, and ideas",
  },
  {
    icon: SearchIcon,
    title: "Full-text search",
    description: "Find any saved link by title, description, or content",
  },
  {
    icon: SparklesIcon,
    title: "Smart organization",
    description: "Let Coolection suggest the right list for every new link",
  },
  {
    icon: ChromeIcon,
    title: "Chrome extension",
    description: "Save the current tab straight from your browser toolbar",
  },
  {
    icon: CompassIcon,
    title: "Safari extension",
    description: "Keep links from Safari on Mac, iPhone, and iPad",
  },
  {
    icon: ListPlusIcon,
    title: "Quick capture",
    description: "Paste a URL and Coolection fills in the useful details",
  },
  {
    icon: ShieldCheckIcon,
    title: "Private by default",
    description: "No public profile, follower counts, or attention traps",
  },
  {
    icon: ServerIcon,
    title: "Self-hostable",
    description: "Run your collection on infrastructure you control",
  },
  {
    icon: GithubIcon,
    title: "Open source",
    description: "Inspect the code, contribute a fix, or make it your own",
  },
];

function ProductIcon() {
  return (
    <div className="relative mb-2.5 grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border border-neutral-950/5 bg-[#f4a13b] shadow-xl">
      <Image
        src="/icon.svg"
        alt="Coolection app icon"
        width={72}
        height={72}
        priority
        className="h-[72px] w-[72px] brightness-0 invert"
      />
    </div>
  );
}

function Actions() {
  return (
    <div className="mb-3 flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
      <a
        href="https://www.coolection.co/sign-in"
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#26251f] px-6 text-[13px] font-semibold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#37362f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26251f]/25 sm:w-auto"
      >
        Start your collection
      </a>
      <a
        href="https://github.com/lovincyrus/coolection"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-black/[0.06] bg-[#e9e8e4] pl-6 pr-3 text-[13px] font-semibold text-[#26251f] transition-colors hover:bg-[#dfded9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26251f]/20 sm:w-auto"
      >
        <span>View on GitHub</span>
        <span className="rounded bg-black/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-[#26251f]/50">
          OSS
        </span>
      </a>
    </div>
  );
}

function DemoBackdrop({ closing = false }: { closing?: boolean }) {
  return (
    <>
      <Image
        src="https://iip.smk.dk/iiif/jp2/x346d846q_kmssp437.tif.jp2/full/!1200,/0/default.jpg"
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className={`-z-20 object-cover brightness-[0.92] contrast-[0.88] saturate-[0.55] ${
          closing ? "object-top" : "object-center"
        }`}
      />
      <div
        className={`absolute inset-0 -z-10 ${
          closing
            ? "bg-[linear-gradient(to_top,#f7f7f5_0%,transparent_70%)]"
            : "bg-[linear-gradient(to_bottom,#f7f7f5_0%,transparent_60%)]"
        }`}
      />
      <div className="absolute inset-0 -z-30 bg-[#f7f7f5]" />
    </>
  );
}

export default function RootPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] text-[#26251f] transition-colors duration-200 selection:bg-black/10">
      <div className="flex min-h-screen flex-col items-center justify-center pb-9 pt-20 sm:pt-24">
        <section className="landing-reveal-one flex w-full max-w-3xl flex-col items-center px-8 text-center">
          <ProductIcon />

          <h1
            className={`${fontSerif.className} mb-7 max-w-2xl text-[40px] font-normal leading-[1.08] tracking-[-0.025em] sm:text-5xl`}
          >
            Your bookmarks, organized everywhere
          </h1>

          <Actions />

          <div className="mb-6 text-sm leading-5 text-[#26251f]/50 md:mb-1">
            Web app ·{" "}
            <a
              href="#features"
              className="underline decoration-black/25 underline-offset-2 transition-colors hover:decoration-black/60"
            >
              Chrome &amp; Safari extensions included
            </a>
          </div>
        </section>

        <section
          aria-label="Product demo"
          className="landing-reveal-two mx-auto w-full max-w-[1600px] md:px-6"
        >
          <div className="relative overflow-hidden md:rounded-b-2xl">
            <DemoBackdrop />
            <div className="mx-auto w-full max-w-[960px] px-6 py-6 md:py-24">
              <video
                src="/demo-dashboard.mp4"
                poster="/screenshot-dashboard.png"
                autoPlay
                loop
                muted
                playsInline
                className="aspect-[8/5] h-auto w-full rounded-xl border border-black/10 object-contain shadow-[0_12px_36px_rgba(38,37,31,0.12)] sm:rounded-2xl sm:shadow-[0_20px_60px_rgba(38,37,31,0.14)]"
                aria-label="Coolection dashboard demo"
              />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="landing-reveal-two flex w-full max-w-[840px] scroll-mt-12 flex-col px-8 pt-16 sm:pt-24"
        >
          <div
            className={`${fontSerif.className} mb-10 flex flex-col gap-4 text-left text-[28px] font-normal leading-[1.2] tracking-[-0.015em] sm:mb-20 sm:text-[32px]`}
          >
            <p>
              Coolection is a home for the links you want to keep. It’s fast,
              searchable, and available everywhere.
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-x-10 gap-y-8 text-left sm:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex max-w-72 flex-col items-start gap-3 py-1"
              >
                <div className="flex items-center justify-center rounded-lg bg-black/[0.04] p-2">
                  <feature.icon
                    className="mt-0.5 h-6 w-6 shrink-0 text-[#26251f] opacity-45"
                    strokeWidth={1.2}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-medium leading-[25px]">
                    {feature.title}
                  </h2>
                  <p className="text-sm leading-5 text-[#26251f]/55">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mb-16 text-left text-base leading-[25px] text-[#26251f]/55 sm:mb-24">
            Plus browser extensions, automatic metadata, fast list filtering,
            and{" "}
            <a
              href="https://github.com/lovincyrus/coolection"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-black/25 underline-offset-2 transition-colors hover:decoration-black/60"
            >
              lots more
            </a>
            .
          </div>
        </section>

        <section className="landing-reveal-two mx-auto mb-8 w-full max-w-[1600px] sm:mb-20 md:px-6">
          <div className="relative overflow-hidden md:rounded-t-2xl">
            <DemoBackdrop closing />
            <div className="flex flex-col items-center gap-6 px-8 pb-20 pt-28 sm:pt-32">
              <div
                className={`${fontSerif.className} max-w-2xl text-center text-[28px] font-normal leading-[1.2] tracking-[-0.015em] text-[#26251f] sm:text-[32px]`}
              >
                Coolection is free and open source. No account needed.
              </div>
              <Actions />
            </div>
          </div>
        </section>

        <footer className="w-full max-w-[1600px] px-8 text-sm text-[#26251f]/50 md:px-12">
          <div className="hidden grid-cols-3 items-end sm:grid">
            <div className="flex items-center gap-1.5 pb-0.5">
              <span>By</span>
              <a
                href="https://www.lovincyrus.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="border-b border-dotted border-black/20 pb-px font-medium transition-opacity hover:opacity-60"
              >
                Cyrus Goh
              </a>
            </div>
            <div className="flex justify-center">
              <Image
                src="/icon.svg"
                alt="Coolection"
                width={80}
                height={93}
                className="h-[93px] w-20 object-contain opacity-70"
              />
            </div>
            <div className="flex items-center justify-end gap-5 pb-0.5">
              <a
                href="https://github.com/lovincyrus/coolection"
                target="_blank"
                rel="noreferrer noopener"
                className="border-b border-dotted border-black/20 pb-px font-medium transition-opacity hover:opacity-60"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="flex items-end justify-between sm:hidden">
            <div className="flex items-center gap-1.5">
              <span>By</span>
              <a
                href="https://www.lovincyrus.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="border-b border-dotted border-black/20 pb-px font-medium transition-opacity hover:opacity-60"
              >
                Cyrus Goh
              </a>
            </div>
            <div className="flex gap-5">
              <a href="https://github.com/lovincyrus/coolection">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
