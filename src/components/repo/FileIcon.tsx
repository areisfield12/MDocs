import { getFileCategory, getFileIcon, getFileCategoryLabel } from "@/lib/file-types";
import * as Tooltip from "@radix-ui/react-tooltip";

interface FileIconProps {
  path: string;
  showLabel?: boolean;
}

export function FileIcon({ path, showLabel = false }: FileIconProps) {
  const category = getFileCategory(path);
  const icon = getFileIcon(category);
  const label = getFileCategoryLabel(category);

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="flex items-center gap-1.5 cursor-default">
            <span className="text-base leading-none">{icon}</span>
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
