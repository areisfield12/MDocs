import Image from "@tiptap/extension-image";

/**
 * Extended Image extension that supports a `data-markdown-src` attribute.
 * This stores the relative markdown path (e.g. "/images/photo.jpg") separately
 * from the `src` which uses a full GitHub raw URL for in-editor preview.
 *
 * On HTML→Markdown conversion, Turndown reads `data-markdown-src` to produce
 * the correct relative path in the markdown output.
 */
export const EditorImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-markdown-src": {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-markdown-src"),
        renderHTML: (attributes: Record<string, string | null>) => {
          if (!attributes["data-markdown-src"]) return {};
          return { "data-markdown-src": attributes["data-markdown-src"] };
        },
      },
    };
  },
});
