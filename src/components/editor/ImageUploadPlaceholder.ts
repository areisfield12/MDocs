import { Node, mergeAttributes } from "@tiptap/core";

export const ImageUploadPlaceholder = Node.create({
  name: "imageUploadPlaceholder",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-image-upload-placeholder]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-image-upload-placeholder": "",
        class: "image-upload-placeholder",
      }),
      ["div", { class: "spinner" }],
      ["span", {}, "Uploading image\u2026"],
    ];
  },
});
