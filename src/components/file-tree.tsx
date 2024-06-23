import { ReactElement, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCcw,
  Settings,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button.tsx";
import { clsx } from "clsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { toast } from "sonner";
import { getContainingFolder } from "@/lib/pathUtils.ts";
import { useImmer } from "use-immer";

import { client } from "@/lib/api/fs/client.ts";
import { components } from "@/lib/api/fs/v1";

function removeLeadingSlash(path: string): string {
  return path.replace(/^\/+/, "");
}

async function deleteFileTree(path: string) {
  const { data, error } = await client.DELETE("/fileTree/{path}", {
    params: {
      path: { path: removeLeadingSlash(path) },
    },
  });
  if (error) throw error;
  return data.path;
}

async function postFileTree(path: string, isDir: boolean): Promise<string> {
  const { data, error } = await client.POST("/fileTree", {
    body: { isDir: isDir, path: path },
  });
  if (error) throw error;
  if (!data) return "";
  return data.path;
}

const pathNameSchema = z.object({
  // TODO disable / and \ (and other non allowed chars)
  pathName: z.string().min(1).max(50),
});

type AddPathFormProps = {
  type: "folder" | "file";
  path: string;
  onAddPath: (data: (File | Folder)[]) => void;
  onSuccess?: () => void;
};

function AddPathForm({ type, path, onAddPath, onSuccess }: AddPathFormProps) {
  const form = useForm<z.infer<typeof pathNameSchema>>({
    resolver: zodResolver(pathNameSchema),
    defaultValues: {
      pathName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (filePath: string) => {
      return postFileTree(filePath, type === "folder");
    },
    onError: (e: components["schemas"]["Error"]) => {
      toast.error(`Error on folder creation: ${e.message}`);
    },
    onSuccess: (path) => {
      toast.success(`Path created successfully: ${path}`);

      if (type === "folder") {
        const newFolder: Folder = {
          type: "folder",
          path: path,
          isFolded: true,
          childPaths: [],
        };

        onAddPath([newFolder]);
      } else {
        const newFile: File = {
          type: "file",
          path: path,
        };

        onAddPath([newFile]);
      }

      form.reset();
      onSuccess?.();
    },
  });

  function onSubmit(value: z.infer<typeof pathNameSchema>) {
    const pathName = value.pathName;
    let newPath = path;
    if (path === "/") {
      newPath += pathName;
    } else {
      newPath += "/" + pathName;
    }

    mutation.mutate(newPath);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="pathName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{type === "folder" ? "Folder" : "File"}</FormLabel>
              <FormControl>
                <Input
                  placeholder={type === "folder" ? "folder-name" : "file-name"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {type === "folder" ? "Add Folder" : "Add File"}
        </Button>
      </form>
    </Form>
  );
}

type AddPathDialogProps = {
  path: string;
  onAddPath: (data: (File | Folder)[]) => void;
};

function AddPathDialog({ path, onAddPath }: AddPathDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          data-testid={`button-addPath-${path}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add folder or file to:
            <code className="relative ml-1 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold">
              {path}
            </code>
          </DialogTitle>
          <div className="flex flex-col gap-8 py-4">
            <AddPathForm
              type="folder"
              path={path}
              onAddPath={onAddPath}
              onSuccess={() => setOpen(false)}
            />
            <AddPathForm
              type="file"
              path={path}
              onAddPath={onAddPath}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

type ModifyPathDialogProps = {
  path: string;
  onDeletePath: (path: string) => void;
};

function ModifyPathDialog(props: ModifyPathDialogProps) {
  const deleteMutation = useMutation({
    mutationFn: (path: string) => {
      return deleteFileTree(path);
    },
    onError: (e: components["schemas"]["Error"]) => {
      toast.error(`Error on folder creation: ${e.message}`);
    },
    onSuccess: (path) => {
      toast.success(`Deleted successfully: ${path}`);
      props.onDeletePath(path);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          data-testid={`button-modifyPath-${props.path}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Modify path:
            <code className="relative ml-1 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold">
              {props.path}
            </code>
          </DialogTitle>
          <div className="flex flex-col gap-8 py-4">
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate(props.path);
              }}
            >
              Delete
            </Button>
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPath" className="text-left">
                File
              </Label>
              <Input
                id="newPath"
                defaultValue={props.path}
                className="col-span-3"
              />
              <Button disabled>Rename</Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

type ReloadButtonProps = {
  onReset: () => void;
};

function ReloadButton({ onReset }: ReloadButtonProps) {
  return (
    <Button variant="outline" size="icon" className="h-6 w-6" onClick={onReset}>
      <RefreshCcw className="h-4 w-4" />
    </Button>
  );
}

type FolderMenuProps = {
  root?: boolean;
  path: string;
  onAddPath: (data: (File | Folder)[]) => void;
  onDeletePath: (path: string) => void;
  onReset: () => void;
};

function FolderMenu({
  root,
  path,
  onAddPath,
  onDeletePath,
  onReset,
}: FolderMenuProps) {
  return (
    <div className="invisible flex flex-row items-center gap-1 group-hover:visible">
      <AddPathDialog path={path} onAddPath={onAddPath} />
      {root ? (
        <ReloadButton onReset={onReset} />
      ) : (
        <ModifyPathDialog path={path} onDeletePath={onDeletePath} />
      )}
    </div>
  );
}

type File = {
  type: "file";
  path: string;
};

type Folder = {
  type: "folder";
  path: string;
  childPaths?: string[];
  isFolded: boolean;
};

type SelectedFileProps = {
  selectedFile?: string;
  handleChangeSelectedFile: (fileId: string) => void;
};

function FileTreeFile({
  file,
  selectedFileProps,
}: {
  file: File;
  selectedFileProps: SelectedFileProps;
}): ReactElement {
  const selected: boolean = file.path === selectedFileProps.selectedFile;
  const fileName: string = file.path.split("/").pop() || file.path;

  return (
    <li
      className={clsx(
        "group flex w-full flex-row justify-between",
        selected && "bg-secondary",
      )}
    >
      <div
        onClick={() => selectedFileProps.handleChangeSelectedFile(file.path)}
        className="ml-5 hover:cursor-pointer"
      >
        {fileName}
      </div>
      <div className="invisible flex flex-row items-center gap-1 group-hover:visible">
        <Button variant="outline" size="icon" className="h-6 w-6">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

async function getFileTree(path: string, signal?: AbortSignal) {
  const { data, error } = await client.GET("/fileTree/{path}", {
    params: { path: { path: encodeURIComponent(path) } },
    signal,
  });

  if (error) throw error;

  if (!data) {
    return [];
  }

  return data.map((entry): File | Folder => {
    if (entry.isDir) {
      return { type: "folder", path: entry.path, isFolded: true };
    } else {
      return { type: "file", path: entry.path };
    }
  });
}

type FileTreeFolderProps = {
  root?: boolean;
  path: string;
  tree: Map<string, Folder | File>;
  onChangeFold: (path: string, state: boolean) => void;
  onAddPath: (data: (File | Folder)[]) => void;
  onDeletePath: (path: string) => void;
  onReset: () => void;
  selectedFileProps: SelectedFileProps;
};

function FileTreeFolder({
  root,
  path,
  tree,
  onChangeFold,
  onAddPath,
  onDeletePath,
  onReset,
  selectedFileProps,
}: FileTreeFolderProps) {
  const folder = tree.get(path) as Folder;
  const isFolded = folder.isFolded;

  const query = useQuery({
    queryKey: ["getFileTree", folder.path],
    queryFn: ({ signal }) => getFileTree(folder.path, signal),
    enabled: !isFolded && folder.childPaths == undefined,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  useEffect(() => {
    if (query.data) {
      onAddPath(query.data);
    }
  }, [query.data]);

  const folderName = folder.path.split("/").pop() || folder.path;

  if (isFolded) {
    return (
      <li className="group flex h-7 w-full flex-row justify-between">
        <div className="flex flex-row items-center">
          <ChevronRight
            data-testid={`icon-foldedPathState-${folder.path}`}
            className="h-4 w-4 hover:cursor-pointer"
            onClick={() => onChangeFold(path, false)}
          />
          <div>{folderName}</div>
        </div>
        <FolderMenu
          root={root}
          path={path}
          onAddPath={onAddPath}
          onDeletePath={onDeletePath}
          onReset={onReset}
        />
      </li>
    );
  }

  if (query.isLoading) return "Loading...";

  if (query.isError) {
    const error = query.error as components["schemas"]["Error"];
    return `Error: ${error.message}`;
  }

  if (query.isSuccess) {
    const folder = tree.get(path) as Folder;

    return (
      <>
        <li className="group flex h-7 w-full flex-row justify-between">
          <div className="flex flex-row items-center">
            <ChevronDown
              className="h-4 w-4 hover:cursor-pointer"
              onClick={() => onChangeFold(path, true)}
            />
            {folderName}
          </div>
          <FolderMenu
            root={root}
            path={path}
            onAddPath={onAddPath}
            onDeletePath={onDeletePath}
            onReset={onReset}
          />
        </li>
        <ul className="pl-4">
          {folder.childPaths?.map((entry) => {
            const res = tree.get(entry);
            if (!res) return;
            if (res.type === "file") {
              return (
                <FileTreeFile
                  key={entry}
                  file={res}
                  selectedFileProps={selectedFileProps}
                />
              );
            }
            if (res.type === "folder") {
              return (
                <FileTreeFolder
                  key={entry}
                  path={entry}
                  tree={tree}
                  onChangeFold={onChangeFold}
                  onAddPath={onAddPath}
                  onDeletePath={onDeletePath}
                  onReset={onReset}
                  selectedFileProps={selectedFileProps}
                />
              );
            }
          })}
        </ul>
      </>
    );
  }
}

type FileTreeProps = {
  selectedFileProps: SelectedFileProps;
};

function FileTree(props: FileTreeProps) {
  const [tree, updateTree] = useImmer(
    new Map<string, Folder | File>([
      [
        "/",
        { type: "folder", path: "/", childPaths: undefined, isFolded: true },
      ],
    ]),
  );

  const queryClient = useQueryClient();

  function handleReset() {
    // TODO fix reset
    updateTree((draft) => {
      draft.clear();
      draft.set("/", {
        type: "folder",
        path: "/",
        childPaths: undefined,
        isFolded: true,
      });

      queryClient
        .invalidateQueries({ queryKey: ["getFileTree", "/"] })
        .catch((e) => {
          throw e;
        });
    });
  }

  function handleDeletePath(path: string) {
    const parentPath = getContainingFolder(path);
    updateTree((draft) => {
      const parent = draft.get(parentPath) as Folder;
      parent.childPaths = parent.childPaths?.filter((e) => e !== path);

      deleteAllChildren(path);

      function deleteAllChildren(path: string) {
        const place = draft.get(path);
        if (!place) {
          throw new Error(`Path not found in tree: ${path}`);
        }

        if (place.type === "folder") {
          place.childPaths?.forEach(deleteAllChildren);
        }
        draft.delete(path);
      }
    });
  }

  function handleChangeFold(path: string, state: boolean) {
    updateTree((draft) => {
      const folder = draft.get(path) as Folder;
      folder.isFolded = state;
    });
  }

  function handleAddPath(data: (File | Folder)[]) {
    updateTree((draft) => {
      data.forEach((e) => {
        // add new path
        draft.set(e.path, e);

        // modify parent folder
        const containingFolderName = getContainingFolder(e.path);
        const containingFolder = draft.get(containingFolderName) as Folder;
        if (!containingFolder) {
          throw new Error(`Folder not found: ${containingFolderName}`);
        }

        if (!containingFolder.childPaths) {
          containingFolder.childPaths = [];
        }

        containingFolder.childPaths?.push(e.path);
      });
    });
  }

  return (
    <>
      <ul className="mx-1 mt-1">
        <FileTreeFolder
          root={true}
          key={"/"}
          path={"/"}
          tree={tree}
          onChangeFold={handleChangeFold}
          onAddPath={handleAddPath}
          onDeletePath={handleDeletePath}
          onReset={handleReset}
          selectedFileProps={props.selectedFileProps}
        />
      </ul>
    </>
  );
}

export { FileTree };
