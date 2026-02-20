"use client";

import { ClipboardCopyIcon, ExternalLinkIcon, KeyIcon, MonitorIcon, MoonIcon, PaletteIcon, StarIcon, SunIcon, TrashIcon, Twitter } from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "next-view-transitions";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

const themes = [
  { value: "system", label: "System", description: "Follow your OS preference", icon: MonitorIcon },
  { value: "light", label: "Light", description: "Light background", icon: SunIcon },
  { value: "dark", label: "Dark", description: "Dark background", icon: MoonIcon },
  { value: "teal", label: "Teal", description: "Dark with teal accents", icon: PaletteIcon },
] as const;

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
  const { theme, setTheme } = useTheme();
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
              <div className="flex h-8 w-8 items-center justify-center">
                <Link href="/home">
                  <img
                    src="/favicon.ico"
                    alt="Coolection"
                    className="h-5 w-5"
                  />
                </Link>
              </div>
              <span className="ml-1 text-xs font-medium text-text-primary">
                Settings
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6">
          {/* Appearance */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-text-primary">Appearance</h2>
              <p className="mt-1 text-xs text-text-tertiary">
                Choose your preferred theme
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 rounded-md border border-dashed p-4 text-center transition-colors ${
                  theme === t.value
                    ? "border-border-strong bg-surface-active text-text-primary"
                    : "text-text-tertiary hover:bg-surface hover:text-text-primary"
                }`}
              >
                <t.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{t.label}</span>
                <span className="text-[10px] leading-tight text-text-quaternary">{t.description}</span>
              </button>
            ))}
          </div>

          <hr className="my-4 border-dashed" />

          {/* API Tokens */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-text-primary">API Tokens</h2>
              <p className="mt-1 text-xs text-text-tertiary">
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
              <label className="text-xs font-medium text-text-secondary">
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
                <code className="flex-1 break-all rounded-md border bg-surface px-3 py-2 text-xs">
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
            <div className="py-8 text-center text-xs text-text-quaternary">
              Loading...
            </div>
          ) : tokens.length === 0 ? (
            <div className="rounded-md border border-dashed py-8 text-center text-xs text-text-quaternary">
              No tokens yet. Create one to start using extensions.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tokens.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border bg-surface px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {t.name || "Unnamed token"}
                      </span>
                      <span className="font-mono text-xs text-text-quaternary">
                        ...{t.tokenPrefix}
                      </span>
                    </div>
                    <span className="text-xs text-text-tertiary">
                      Created {formatDate(t.createdAt)}
                      {" · "}
                      {formatLastUsed(t.lastUsedAt)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeToken(t.id, t.name)}
                    className="shrink-0 text-xs text-text-tertiary hover:text-red-600"
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
              <h2 className="text-sm font-medium text-text-primary">
                GitHub Stars
              </h2>
              <p className="mt-1 text-xs text-text-tertiary">
                Sync your starred repositories into your collection.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
            <label className="text-xs font-medium text-text-secondary">
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
              <p className="text-xs text-text-tertiary">
                Last synced {syncStatus.lastSyncedAt
                  ? formatLastUsed(syncStatus.lastSyncedAt)
                  : "never"}
                {syncStatus.githubUsername && (
                  <> as <span className="font-medium">{syncStatus.githubUsername}</span></>
                )}
              </p>
            )}
            <p className="text-xs text-text-quaternary">
              Only public stars are synced. Subsequent syncs skip unchanged
              stars.
            </p>
          </div>

          <hr className="my-4 border-dashed" />

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-text-primary">
                <Twitter className="mr-1 inline h-3.5 w-3.5 text-sky-400" />
                X Bookmarks
              </h2>
              <p className="mt-1 text-xs text-text-tertiary">
                Sync your X (Twitter) bookmarks using the browser extension.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
            <p className="text-xs text-text-secondary">
              X bookmarks are synced automatically by the Coolection Chrome
              extension. To get started:
            </p>
            <ol className="list-inside list-decimal text-xs text-text-secondary space-y-1">
              <li>Install the Chrome extension from the repo</li>
              <li>Open extension options and paste your API token</li>
              <li>Enable bookmark sync and set your preferred interval</li>
              <li>Bookmarks will appear in your <span className="font-medium">X Bookmarks</span> list</li>
            </ol>
            <a
              href="https://github.com/lovincyrus/coolection"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary"
            >
              <ExternalLinkIcon className="h-3 w-3" />
              View setup instructions on GitHub
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
