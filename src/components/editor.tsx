import { Button } from "@/components/ui/button.tsx";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import MonacoEditor from "@monaco-editor/react";

import { client } from "@/lib/api/fs/client.ts";

async function getFile(
  filePath: string,
  signal?: AbortSignal,
): Promise<string | undefined> {
  const { data } = await client.GET("/file/{filePath}", {
    params: {
      path: {
        filePath: encodeURIComponent(filePath),
      },
    },
    parseAs: "text",
    signal,
  });

  // fix for empty files which are returned as empty objects
  if (typeof data === "object" && Object.keys(data).length === 0) return "";

  return data;
}

async function putFile(filePath: string, text: string): Promise<void> {
  await client.PUT("/file/{filePath}", {
    params: {
      path: {
        filePath: encodeURIComponent(filePath),
      },
    },
    body: text,
    // work-around: deactivate default json.stringify, see https://github.com/OpenAPITools/openapi-generator/issues/7083
    bodySerializer(body) {
      return body;
    },
    parseAs: "text",
  });
}

function Editor({ filePath }: { filePath: string | undefined }) {
  const [editorText, setEditorText] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: ["getFile", filePath],
    queryFn: ({ signal }) => getFile(filePath!, signal),
    enabled: ((): boolean => !(filePath === undefined))(),
  });

  useEffect(() => {
    if (query.isSuccess) {
      setEditorText(query.data);
    }
  }, [query.isSuccess, query.data]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (fileContent: string) => putFile(filePath!, fileContent),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["getFile", "filePath"] }),
  });

  if (filePath === undefined) {
    return <></>;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {filePath}
      <MonacoEditor
        value={editorText || ""}
        onChange={(e) => setEditorText(e)}
        className="h-full resize-none border-none"
      />
      <div className="flex flex-row gap-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            setEditorText(query.data);
          }}
        >
          Cancel
        </Button>
        <Button
          className="w-full"
          onClick={() => {
            if (editorText !== undefined) {
              mutation.mutate(editorText);
            }
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export { Editor };
