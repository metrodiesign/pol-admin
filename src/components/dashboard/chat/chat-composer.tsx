"use client";

import { useState } from "react";
import { Image as ImageIcon, Paperclip, Mic, Smile } from "lucide-react";

export function ChatComposer() {
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center gap-2 border-t border-[rgba(145,158,171,0.2)] bg-card px-3 py-2.5">
      {/* Emoji button */}
      <button
        type="button"
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
        aria-label="Emoji"
      >
        <Smile className="size-5" />
      </button>

      {/* Text input */}
      <input
        type="text"
        placeholder="Type a message"
        aria-label="Type a message"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-transparent text-[15px] leading-6 text-grey-800 outline-none placeholder:text-grey-400"
      />

      {/* Trailing buttons */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
          aria-label="Attach image"
        >
          <ImageIcon className="size-5" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
          aria-label="Attach file"
        >
          <Paperclip className="size-5" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-100 hover:text-grey-800"
          aria-label="Voice message"
        >
          <Mic className="size-5" />
        </button>
      </div>
    </div>
  );
}
