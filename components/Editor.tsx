"use client";

// import "@liveblocks/react-ui/styles.css";
// import "@liveblocks/react-tiptap/styles.css";


import { useLiveblocksExtension, FloatingToolbar } from "@liveblocks/react-tiptap";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Threads } from "./Threads";
import { useRoom, useSelf } from "@liveblocks/react/suspense";

export function Editor() {
  const room = useRoom();
  const { connectionId } = useSelf();
  const liveblocks = useLiveblocksExtension();

  const editor = useEditor({
    extensions: [
      liveblocks,
      StarterKit.configure({
        // The Liveblocks extension comes with its own history handling
        history: false,
      }),
    ],
    immediatelyRender: true,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connectionId ? "bg-green-500" : "bg-yellow-500"}`} />
          <span className="text-sm text-gray-600">
            {connectionId ? "Connected" : "Connecting..."}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Room ID: {room.id}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-4">
          <EditorContent editor={editor} className="editor" />
          <FloatingToolbar editor={editor} />
          <Threads editor={editor} />
        </div>
      </div>
      
      <Threads editor={editor} />
    </div>
  );
} 