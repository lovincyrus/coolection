"use client";

import { ClipboardCopyIcon, ExternalLinkIcon, KeyIcon, StarIcon, TrashIcon, Twitter } from "lucide-react";
import { Link } from "next-view-transitions";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface TokenInfo {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLastUsed(iso: string | null) {
  if (!iso) return "Never used";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export default function SettingsPage() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [showForm, setShowForm] = useState(false);

  // GitHub stars sync state
  const [githubUsername, setGithubUsername] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    configured: boolean;
    githubUsername: string | null;
    lastSyncedAt: string | null;
  } | null>(null);

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch("/api/token/list");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/github-stars/status");
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
        if (data.githubUsername) {
          setGithubUsername(data.githubUsername);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchTokens();
    fetchSyncStatus();
  }, [fetchTokens, fetchSyncStatus]);

  async function createToken() {
    setCreating(true);
    try {
      const res = await fetch("/api/token/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName }),
      });
      if (res.status === 409) {
        toast.error("Token limit reached (max 5)");
        return;
      }
      if (!res.ok) {
        toast.error("Failed to generate token");
        return;
      }
      const data = await res.json();
      setNewToken(data.token);
      setTokenName("");
      setShowForm(false);
      toast.success("Token generated");
      fetchTokens();
    } catch {
      toast.error("Failed to generate token");
    } finally {
      setCreating(false);
    }
  }

  async function revokeToken(id: string, name: string) {
    if (!window.confirm(`Revoke token "${name || "Unnamed token"}"? Any extension using it will stop working.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/token/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to revoke token");
        return;
      }
      toast.success("Token revoked");
      fetchTokens();
    } catch {
      toast.error("Failed to revoke token");
    }
  }

  function copyToken() {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      toast.success("Copied to clipboard");
    }
  }

  async function syncStars() {
    if (!githubUsername.trim()) {
      toast.error("Enter a GitHub username");
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch("/api/github-stars/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUsername: githubUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Sync failed");
        return;
      }
      toast.success(data.message);
      fetchSyncStatus();
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
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
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900">API Tokens</h2>
              <p className="mt-1 text-xs text-gray-500">
                Generate tokens to use with the Coolection browser extensions.
              </p>
            </div>
            {!showForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                <KeyIcon className="mr-1 h-3 w-3" />
                New Token
              </Button>
            )}
          </div>

          {showForm && (
            <div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
              <label className="text-xs font-medium text-gray-700">
                Token name
              </label>
              <Input
                placeholder='e.g. "Chrome Desktop" or "Safari iPhone"'
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="h-9 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    createToken();
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createToken}
                  disabled={creating}
                >
                  <KeyIcon className="mr-1 h-3 w-3" />
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setTokenName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {newToken && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded-md border bg-gray-50 px-3 py-2 text-xs">
                  {newToken}
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

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Loading...
            </div>
          ) : tokens.length === 0 ? (
            <div className="rounded-md border border-dashed py-8 text-center text-xs text-gray-400">
              No tokens yet. Create one to start using extensions.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tokens.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border bg-gray-50 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {t.name || "Unnamed token"}
                      </span>
                      <span className="font-mono text-xs text-gray-400">
                        ...{t.tokenPrefix}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Created {formatDate(t.createdAt)}
                      {" · "}
                      {formatLastUsed(t.lastUsedAt)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeToken(t.id, t.name)}
                    className="shrink-0 text-xs text-gray-500 hover:text-red-600"
                  >
                    <TrashIcon className="mr-1 h-3 w-3" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}

          <hr className="my-4 border-dashed" />

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                GitHub Stars
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Sync your starred repositories into your collection.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
            <label className="text-xs font-medium text-gray-700">
              GitHub username
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g. octocat"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="h-9 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    syncStars();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={syncStars}
                disabled={syncing}
                className="shrink-0"
              >
                <StarIcon className="mr-1 h-3 w-3" />
                {syncing ? "Syncing..." : "Sync Stars"}
              </Button>
            </div>
            {syncStatus?.configured && (
              <p className="text-xs text-gray-500">
                Last synced {syncStatus.lastSyncedAt
                  ? formatLastUsed(syncStatus.lastSyncedAt)
                  : "never"}
                {syncStatus.githubUsername && (
                  <> as <span className="font-medium">{syncStatus.githubUsername}</span></>
                )}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Only public stars are synced. Subsequent syncs skip unchanged
              stars. Synced repos are automatically grouped into a{" "}
              <strong>GitHub Stars</strong> list in the sidebar.
            </p>
          </div>

          <hr className="my-4 border-dashed" />

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                X Bookmarks
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Tweets saved via the browser extension are automatically grouped
                into an <strong>X Bookmarks</strong> list.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-medium text-gray-700">
                How it works
              </span>
            </div>
            <p className="text-xs text-gray-500">
              When you save a tweet or X bookmark URL through the Coolection
              browser extension, it is automatically added to your{" "}
              <strong>X Bookmarks</strong> list. No extra setup needed.
            </p>
            <p className="text-xs text-gray-400">
              Supported URL formats: x.com status links and x.com/i/bookmarks
              links.
            </p>
          </div>

          <hr className="my-4 border-dashed" />

          <div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
            <span className="text-xs font-medium text-gray-700">
              Setup &amp; Documentation
            </span>
            <p className="text-xs text-gray-500">
              Coolection is open source. For detailed setup instructions,
              extension installation, and self-hosting guides, visit the
              repository.
            </p>
            <a
              href="https://github.com/lovincyrus/coolection"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              <ExternalLinkIcon className="h-3 w-3" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
