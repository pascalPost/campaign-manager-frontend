import { ReactElement, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Settings,
} from "lucide-react";
import { useMutation, useQuery } from "react-query";
import { client } from "@/lib/api/client.ts";
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
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
import { getContainingFolder } from "@/lib/pathUtils.ts";
import { components } from "@/lib/api/v1";

// type FileTreeAction={
//   type: "ADD_FOLDER",
//   path: string
// } | {
//   type: "ADD_FILE",
//   path: string
// } | {
//   type: "UPDATE_FOLDER",
//   path: string,
//   childPaths: string[]
// } | {
//   type: "TOGGLE_FOLD",
//   path: string,
//   isFolded: boolean
// }
//
// function fileTreeReducer(state: Map<string, Folder | File>, action: FileTreeAction): Map<string, Folder | File> {
//   switch (action.type) {
//
//   }
// }

// function fileTreeReducer(state: FileTreeState, action: FileTreeAction): FileTreeState {
//     switch (action.type) {
//         case "ADD_FOLDER":
//             return {
//                 ...state,
//                 [action.path]: {
//                     type: "folder",
//                     path: action.path,
//                     childPaths: [],
//                     isFolded: true,
//                 },
//             };
//         case "ADD_FILE":
//             return {
//                 ...state,
//                 [action.path]: {
//                     type: "file",
//                     path: action.path,
//                 },
//             };
//         case "UPDATE_FOLDER":
//             return {
//                 ...state,
//                 [action.path]: {
//                     ...state[action.path],
//                     childPaths: action.childPaths,
//                 },
//             };
//         case "TOGGLE_FOLD":
//             return {
//                 ...state,
//                 [action.path]: {
//                     ...state[action.path],
//                     isFolded: action.isFolded,
//                 },
//             };
//         default:
//             return state;
//     }
// }

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

const folderNameSchema = z.object({
  // TODO disable / and \ (and other non allowed chars)
  folderName: z.string().min(1).max(50),
});

function AddFolderForm({
  path,
  tree,
  onUpdateFolder,
}: {
  path: string;
  tree: Map<string, Folder | File>;
  onUpdateFolder: (path: string, data: (File | Folder)[]) => void;
}) {
  const form = useForm<z.infer<typeof folderNameSchema>>({
    resolver: zodResolver(folderNameSchema),
    defaultValues: {
      folderName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (filePath: string) => {
      const data = postFileTree(filePath, true).then((data) => "/" + data);
      return data;
    },
    onError: (e: components["schemas"]["Error"]) => {
      toast.error(`Error on folder creation: ${e.message}`);
    },
    onSuccess: (path) => {
      toast.success(`Path created successfully: ${path}`);

      const containingFolderPath: string = getContainingFolder(path);
      const containingFolder = tree.get(containingFolderPath);

      if (
        containingFolder === undefined ||
        containingFolder.type !== "folder"
      ) {
        throw new Error("Error in folder logic");
      }

      // add new path to containing folder
      containingFolder.childPaths?.push(path);

      const newFolder: Folder = {
        type: "folder",
        path: path,
        isFolded: true,
        childPaths: [],
      };

      onUpdateFolder(containingFolderPath, [containingFolder, newFolder]);

      form.reset();
    },
  });

  function onSubmit(value: z.infer<typeof folderNameSchema>) {
    const folderName = value.folderName;
    let newPath = "";
    if (path === "/") {
      newPath = folderName;
    } else {
      newPath = path + "/" + folderName;
      // TODO try to remove this!
      if (newPath.startsWith("/")) {
        newPath = newPath.slice(1);
      }
    }

    mutation.mutate(newPath);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="folderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Folder</FormLabel>
              <FormControl>
                <Input placeholder="folder-name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Add Folder
        </Button>
      </form>
    </Form>
  );
}

function AddPathDialog({
  path,
  tree,
  onUpdateFolder,
}: {
  path: string;
  tree: Map<string, Folder | File>;
  onUpdateFolder: (path: string, data: (File | Folder)[]) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6">
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
            <AddFolderForm
              path={path}
              tree={tree}
              onUpdateFolder={onUpdateFolder}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="file" className="text-left">
                File
              </Label>
              <Input
                id="file"
                defaultValue="file.name"
                className="col-span-3"
              />
              <Button disabled>Add File</Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

// function DeletePathDialog({ path }: { path: string }) {
//   return (
//     <AlertDialog>
//       <AlertDialogTrigger>Open</AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//           <AlertDialogDescription>
//             This action cannot be undone. This will permanently delete your
//             account and remove your data from our servers.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//           <AlertDialogAction>Continue</AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }

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

type FolderMenuProps = {
  path: string;
  tree: Map<string, Folder | File>;
  onUpdateFolder: (path: string, data: (File | Folder)[]) => void;
  onDeletePath: (path: string) => void;
};

function FolderMenu(props: FolderMenuProps) {
  return (
    <div className="invisible flex flex-row items-center gap-1 group-hover:visible">
      <AddPathDialog
        path={props.path}
        tree={props.tree}
        onUpdateFolder={props.onUpdateFolder}
      />
      <ModifyPathDialog path={props.path} onDeletePath={props.onDeletePath} />
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

async function callGetFileTree(path: string, signal?: AbortSignal) {
  if (path === "/") {
    return client.GET("/fileTree", {
      signal,
    });
  } else {
    return client.GET("/fileTree/{path}", {
      params: { path: { path: removeLeadingSlash(path) } },
      signal,
    });
  }
}

async function getFileTree(path: string, signal?: AbortSignal) {
  const { data, error } = await callGetFileTree(path, signal);

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
  path: string;
  tree: Map<string, Folder | File>;
  onChangeFold: (path: string, state: boolean) => void;
  onUpdateFolder: (path: string, data: (File | Folder)[]) => void;
  onDeletePath: (path: string) => void;
  selectedFileProps: SelectedFileProps;
};

function FileTreeFolder(props: FileTreeFolderProps) {
  const folder = props.tree.get(props.path) as Folder;
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
      props.onUpdateFolder(props.path, query.data);
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
            onClick={() => props.onChangeFold(props.path, false)}
          />
          <div>{folderName}</div>
        </div>
        <FolderMenu
          path={props.path}
          tree={props.tree}
          onUpdateFolder={props.onUpdateFolder}
          onDeletePath={props.onDeletePath}
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
    const folder = props.tree.get(props.path) as Folder;

    return (
      <>
        <li className="group flex h-7 w-full flex-row justify-between">
          <div className="flex flex-row items-center">
            <ChevronDown
              className="h-4 w-4 hover:cursor-pointer"
              onClick={() => props.onChangeFold(props.path, true)}
            />
            {folderName}
          </div>
          <FolderMenu
            path={props.path}
            tree={props.tree}
            onUpdateFolder={props.onUpdateFolder}
            onDeletePath={props.onDeletePath}
          />
        </li>
        <ul className="pl-4">
          {folder.childPaths?.map((entry) => {
            const res = props.tree.get(entry);
            if (!res) return;
            if (res.type === "file") {
              return (
                <FileTreeFile
                  key={entry}
                  file={res}
                  selectedFileProps={props.selectedFileProps}
                />
              );
            }
            if (res.type === "folder") {
              return (
                <FileTreeFolder
                  key={entry}
                  path={entry}
                  tree={props.tree}
                  onChangeFold={props.onChangeFold}
                  onUpdateFolder={props.onUpdateFolder}
                  onDeletePath={props.onDeletePath}
                  selectedFileProps={props.selectedFileProps}
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
  // TODO: enhance with immer
  const [tree, setTree] = useState(
    new Map<string, Folder | File>([
      [
        "/",
        { type: "folder", path: "/", childPaths: undefined, isFolded: true },
      ],
    ]),
  );

  function handleDeletePath(path: string) {
    // TODO delete content
    tree.delete(path);
    setTree(new Map(tree));
  }

  function handleChangeFold(path: string, state: boolean) {
    const folder = tree.get(path) as Folder;
    folder.isFolded = state;
    setTree(new Map(tree.set(path, folder)));
  }

  function handleUpdateFolder(path: string, data: (File | Folder)[]) {
    const folder = tree.get(path) as Folder;
    data.forEach((e) => {
      tree.set(e.path, e);
    });
    folder.childPaths = data.map((e) => e.path);
    setTree(new Map(tree));
  }

  return (
    <>
      <ul className="mx-1 mt-1">
        <FileTreeFolder
          key={"/"}
          path={"/"}
          tree={tree}
          onChangeFold={handleChangeFold}
          onUpdateFolder={handleUpdateFolder}
          onDeletePath={handleDeletePath}
          selectedFileProps={props.selectedFileProps}
        />
      </ul>
    </>
  );
}

export { FileTree };
