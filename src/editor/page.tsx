import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileTree } from "@/components/file-tree.tsx";
import { useState } from "react";
import { Editor } from "@/components/editor.tsx";

export function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<string | undefined>(
    undefined,
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Editor
      </h1>
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-md border"
      >
        <ResizablePanel defaultSize={25}>
          <FileTree
            selectedFileProps={{
              selectedFile: selectedFile,
              handleChangeSelectedFile: (fileId: string) => {
                setSelectedFile(fileId);
              },
            }}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <Editor filePath={selectedFile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
