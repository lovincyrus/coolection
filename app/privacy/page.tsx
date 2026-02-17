import { Footer } from "../components/footer";

export const metadata = {
  title: "Privacy Policy — Coolection",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-20">
        <h1 className="font-serif text-3xl font-bold text-text-primary">
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-sm font-medium text-text-primary">
              How Coolection uses your data
            </h2>
            <p className="mt-2">
              Coolection stores the URLs you save, along with their titles and
              metadata, on the server you are signed into. If you self-host,
              that data lives entirely on your own infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium text-text-primary">
              Browser extensions
            </h2>
            <p className="mt-2">
              The Chrome and Safari extensions store an API token locally so
              they can save bookmarks on your behalf. The Safari extension also
              stores your server URL in on-device storage shared between the
              app and the extension. No browsing history, page content, or
              personal information is ever collected.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium text-text-primary">
              What we do not collect
            </h2>
            <p className="mt-2">
              Coolection does not use analytics, tracking, or advertising. No
              data is shared with third parties. No cookies are set beyond what
              is required for authentication.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium text-text-primary">Contact</h2>
            <p className="mt-2">
              Questions about this policy? Reach out at{" "}
              <a
                href="mailto:hello@coolection.co"
                className="font-medium text-text-primary hover:underline"
              >
                hello@coolection.co
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
