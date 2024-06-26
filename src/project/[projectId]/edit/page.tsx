import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileTree } from "@/components/file-tree.tsx";
import { useState } from "react";
import { Editor } from "@/components/editor.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "wouter";

type ProjectEditorPageProps = {
  projectId: string;
};

export function ProjectEditorPage({ projectId }: ProjectEditorPageProps) {
  const [selectedFile, setSelectedFile] = useState<string | undefined>(
    undefined,
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Project {projectId} Editor
      </h1>
      <div className="mt-4 flex flex-row-reverse gap-5">
        <Button className="min-w-80" asChild>
          <Link href={`/project/${projectId}`}>Close</Link>
        </Button>
      </div>
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-md border"
      >
        <ResizablePanel defaultSize={25}>
          <FileTree
            rootPath={`/${projectId}`}
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
