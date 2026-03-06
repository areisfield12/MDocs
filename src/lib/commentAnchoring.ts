interface CommentRange {
  id: string;
  charStart: number;
  charEnd: number;
  quotedText?: string | null;
}

interface AnchoredRange {
  id: string;
  charStart: number;
  charEnd: number;
  orphaned: boolean;
}

/**
 * Find the occurrence of `query` in `text` closest to `hint` position.
 */
function findClosestOccurrence(text: string, query: string, hint: number): number {
  let best = -1;
  let bestDist = Infinity;
  let idx = text.indexOf(query);
  while (idx !== -1) {
    const dist = Math.abs(idx - hint);
    if (dist < bestDist) {
      bestDist = dist;
      best = idx;
    }
    idx = text.indexOf(query, idx + 1);
  }
  return best;
}

/**
 * Build a mapping between flat text offsets and ProseMirror positions.
 * ProseMirror positions include structural offsets (e.g., +1 per block boundary).
 */
export function buildTextMapping(doc: any): {
  flatText: string;
  toProseMirrorPos: (flatOffset: number) => number;
} {
  const chunks: Array<{ text: string; pmStart: number }> = [];

  doc.descendants((node: any, pos: number) => {
    if (node.isText && node.text) {
      chunks.push({ text: node.text, pmStart: pos });
    }
    return true;
  });

  const flatText = chunks.map((c) => c.text).join("");

  function toProseMirrorPos(offset: number): number {
    let accumulated = 0;
    for (const chunk of chunks) {
      if (accumulated + chunk.text.length > offset) {
        return chunk.pmStart + (offset - accumulated);
      }
      accumulated += chunk.text.length;
    }
    return doc.content.size;
  }

  return { flatText, toProseMirrorPos };
}

/**
 * Re-anchor comments to their correct positions in the document.
 * For comments with `quotedText`, verifies the text at stored positions
 * still matches and searches for it if not.
 */
export function reanchorComments(
  comments: CommentRange[],
  doc: any
): AnchoredRange[] {
  const { flatText, toProseMirrorPos } = buildTextMapping(doc);

  return comments.map((c) => {
    if (!c.quotedText) {
      return { id: c.id, charStart: c.charStart, charEnd: c.charEnd, orphaned: false };
    }

    // Check if text at stored position still matches
    const currentText = doc.textBetween(
      Math.min(c.charStart, doc.content.size),
      Math.min(c.charEnd, doc.content.size),
      " "
    );
    if (currentText === c.quotedText) {
      return { id: c.id, charStart: c.charStart, charEnd: c.charEnd, orphaned: false };
    }

    // Position is stale — search flat text for the quoted text
    const flatIdx = findClosestOccurrence(flatText, c.quotedText, 0);
    if (flatIdx !== -1) {
      const newStart = toProseMirrorPos(flatIdx);
      const newEnd = toProseMirrorPos(flatIdx + c.quotedText.length);
      return { id: c.id, charStart: newStart, charEnd: newEnd, orphaned: false };
    }

    // Try prefix match (first 60% of quoted text) for partially edited text
    const minLen = Math.min(20, Math.floor(c.quotedText.length * 0.6));
    if (c.quotedText.length > minLen) {
      const prefix = c.quotedText.slice(0, Math.floor(c.quotedText.length * 0.6));
      const prefixIdx = findClosestOccurrence(flatText, prefix, 0);
      if (prefixIdx !== -1) {
        const newStart = toProseMirrorPos(prefixIdx);
        const newEnd = toProseMirrorPos(prefixIdx + prefix.length);
        return { id: c.id, charStart: newStart, charEnd: newEnd, orphaned: false };
      }
    }

    // Text not found — mark as orphaned
    return {
      id: c.id,
      charStart: Math.min(c.charStart, doc.content.size),
      charEnd: Math.min(c.charEnd, doc.content.size),
      orphaned: true,
    };
  });
}
