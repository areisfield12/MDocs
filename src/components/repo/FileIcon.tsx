import { getFileCategory, getFileCategoryLabel } from "@/lib/file-types";
import { Bot, Palette, BarChart3, FileText } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { FileCategory } from "@/types";

interface FileIconProps {
  path: string;
  showLabel?: boolean;
  className?: string;
}

const iconMap: Record<FileCategory, typeof FileText> = {
  agent: Bot,
  style: Palette,
  gtm: BarChart3,
  doc: FileText,
};

const colorMap: Record<FileCategory, string> = {
  agent: "text-violet-500",
  style: "text-orange-500",
  gtm: "text-blue-500",
  doc: "text-gray-400",
};

export function FileIcon({ path, showLabel = false, className }: FileIconProps) {
  const category = getFileCategory(path);
  const label = getFileCategoryLabel(category);
  const Icon = iconMap[category];
  const color = colorMap[category];

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="flex items-center gap-1.5 cursor-default">
            <Icon className={cn("h-4 w-4", color, className)} />
            {showLabel && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {label}
              </span>
            )}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg"
            sideOffset={4}
          >
            {label}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
