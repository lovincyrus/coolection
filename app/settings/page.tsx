"use client";

import { ClipboardCopyIcon, KeyIcon, RefreshCwIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";

export default function SettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  async function generateToken() {
    setLoading(true);
    try {
      const response = await fetch("/api/token/generate", {
        method: "POST",
      });
      if (!response.ok) {
        toast.error("Failed to generate token");
        return;
      }
      const data = await response.json();
      setToken(data.token);
      setHasToken(true);
      toast.success("Token generated");
    } catch {
      toast.error("Failed to generate token");
    } finally {
      setLoading(false);
    }
  }

  function copyToken() {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success("Copied to clipboard");
    }
  }

  return (
    <main>
      <div className="mx-auto min-h-dvh w-full max-w-2xl px-4 pt-4 md:border-l md:border-r md:border-dashed xl:max-w-4xl 2xl:max-w-6xl">
        <div className="mx-auto w-full max-w-2xl xl:max-w-4xl 2xl:max-w-6xl">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center space-x-1">
              <div className="flex h-8 w-8 items-center justify-center text-2xl">
                <Link href="/home">🍵</Link>
              </div>
              <span className="ml-1 text-xs font-medium text-gray-800">
                Settings
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-900">API Token</h2>
            <p className="mt-1 text-xs text-gray-500">
              Generate a token to use with the Coolection browser extension.
            </p>
          </div>

          {token && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded-md border bg-gray-50 px-3 py-2 text-xs">
                  {token}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToken}
                  className="shrink-0"
                >
                  <ClipboardCopyIcon className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-amber-600">
                Save this token — you won&apos;t see it again.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!hasToken ? (
              <Button
                variant="outline"
                size="sm"
                onClick={generateToken}
                disabled={loading}
              >
                <KeyIcon className="mr-1 h-3 w-3" />
                Generate Token
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      "This will replace your existing token. Continue?",
                    )
                  ) {
                    generateToken();
                  }
                }}
                disabled={loading}
              >
                <RefreshCwIcon className="mr-1 h-3 w-3" />
                Regenerate Token
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Paste this token into your browser extension to start saving links.
          </p>
        </div>
      </div>
    </main>
  );
}
