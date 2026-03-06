"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface AIEditModalProps {
  open: boolean;
  onClose: () => void;
  selectedText: string;
  onAccept: (newText: string) => void;
}

export function AIEditModal({
  open,
  onClose,
  selectedText,
  onAccept,
}: AIEditModalProps) {
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setInstruction("");
      setResult("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleAsk = async () => {
    if (!instruction.trim()) return;

    setStreaming(true);
    setResult("");

    try {
      const response = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText,
          instruction: instruction.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.actionable ?? "AI editing failed");
        return;
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setResult(accumulated);
      }
    } catch {
      toast.error("Failed to connect to AI. Check your connection and try again.");
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title="Ask AI to edit"
      description="Describe how you want to change the selected text"
    >
      <div className="space-y-4">
        {/* Selected text preview */}
        <div>
          <div className="text-xs font-medium text-fg-tertiary mb-1">Selected text</div>
          <div className="bg-surface-secondary border border-border rounded-lg p-3 text-sm text-fg-secondary max-h-24 overflow-y-auto line-clamp-4">
            {selectedText}
          </div>
        </div>

        {/* Instruction input */}
        <div>
          <div className="text-xs font-medium text-fg-tertiary mb-1">
            Instruction
          </div>
          <textarea
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              `"Make this more concise"\n"Rewrite in a friendly professional tone"\n"Expand with an example"`
            }
            rows={3}
            className="w-full text-[13px] px-3 py-2 border border-border rounded-md bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-fg/10 focus:border-fg-tertiary"
          />
          <div className="text-xs text-fg-tertiary mt-1">⌘↵ to send</div>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2">
          {[
            "Make this more concise",
            "Fix grammar and spelling",
            "Make this more professional",
            "Add an example",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInstruction(prompt)}
              className="text-xs px-2.5 py-1 bg-surface-tertiary hover:bg-surface-hover text-fg-secondary rounded-full transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI result */}
        {(result || streaming) && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-fg-tertiary mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              {streaming ? "Writing..." : "Suggested edit"}
            </div>
            <div className="bg-surface-secondary border border-border rounded-md p-3 text-[13px] text-fg whitespace-pre-wrap min-h-16 max-h-48 overflow-y-auto">
              {result}
              {streaming && <span className="animate-pulse">▌</span>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleAsk}
            loading={streaming}
            disabled={!instruction.trim()}
            className="bg-fg hover:bg-fg/90 text-fg-inverted"
          >
            <Sparkles className="h-4 w-4" />
            {result ? "Retry" : "Ask AI"}
          </Button>
          {result && !streaming && (
            <>
              <Button
                onClick={() => {
                  onAccept(result);
                  onClose();
                }}
                variant="primary"
              >
                Accept
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setResult("");
                  setInstruction("");
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Start over
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={onClose} className="ml-auto">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
