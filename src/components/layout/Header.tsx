"use client";

import { useSession, signOut } from "next-auth/react";
import { PanelLeftClose, PanelLeftOpen, ChevronDown, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { SaveIndicator } from "./SaveIndicator";
import { SaveStatus } from "@/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  saveStatus?: SaveStatus;
  prNumber?: number;
  prUrl?: string;
  onSave?: () => void;
  onProposeChanges?: () => void;
  filePath?: string;
}

export function Header({
  sidebarOpen,
  onToggleSidebar,
  saveStatus,
  prNumber,
  prUrl,
  onSave,
  onProposeChanges,
  filePath,
}: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 h-14 flex-shrink-0">
      {/* Left: sidebar toggle + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen
            ? <PanelLeftClose className="h-5 w-5" />
            : <PanelLeftOpen className="h-5 w-5" />
          }
        </button>

        {filePath && (
          <span className="text-sm text-gray-500 truncate max-w-xs">
            {filePath}
          </span>
        )}
      </div>

      {/* Center: Save indicator */}
      {saveStatus && (
        <SaveIndicator
          status={saveStatus}
          prNumber={prNumber}
          prUrl={prUrl}
          onSave={onSave}
          onProposeChanges={onProposeChanges}
        />
      )}

      {/* Right: User menu */}
      {session?.user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {session.user.name?.[0] ?? "U"}
                </div>
              )}
              <span className="text-sm text-gray-700 max-w-24 truncate">
                {session.user.githubLogin ?? session.user.name}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm"
              align="end"
              sideOffset={4}
            >
              <DropdownMenu.Label className="px-3 py-2 text-xs text-gray-400">
                {session.user.email}
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer outline-none"
                onSelect={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </header>
  );
}
