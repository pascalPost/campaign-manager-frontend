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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

// async function deleteFileTree(path: string) {
//   const { data, error } = await client.DELETE("/fileTree/{path}", {
//     params: {
//       path: {
//         path: path,
//       },
//     },
//   });
//   if (error) throw error;
//   if (!data) return "";
//   return data;
// }

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
    onError: (e) => {
      toast.error(`Error on folder creation: ${e.message}`);
    },
    onSuccess: (path) => {
      toast.success(`Path created successfully: ${path}`);

      const containingFolder = getContainingFolder(path);
      const folder = tree.get(containingFolder) as Folder;
      folder.childPaths?.push(path);

      onUpdateFolder(path, [
        folder,
        { type: "folder", path: path, isFolded: true, childPaths: [] },
      ]);
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
  onUpdateFolder,
}: {
  path: string;
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
            <AddFolderForm path={path} onUpdateFolder={onUpdateFolder} />
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

function ModifyPathDialog({ path }: { path: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Modify path:
            <code className="relative ml-1 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold">
              {path}
            </code>
          </DialogTitle>
          <div className="flex flex-col gap-8 py-4">
            <Button variant="destructive" disabled>
              Delete
            </Button>
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPath" className="text-left">
                File
              </Label>
              <Input id="newPath" defaultValue={path} className="col-span-3" />
              <Button disabled>Rename</Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function FolderMenu({
  path,
  onUpdateFolder,
}: {
  path: string;
  onUpdateFolder: (path: string, data: (File | Folder)[]) => void;
}) {
  return (
    <div className="invisible flex flex-row items-center gap-1 group-hover:visible">
      <AddPathDialog path={path} onUpdateFolder={onUpdateFolder} />
      <ModifyPathDialog path={path} />
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
    const pathWithoutLeadingSlash = path.replace(/^\/+/, "");
    return client.GET("/fileTree/{path}", {
      params: {
        path: {
          path: pathWithoutLeadingSlash,
        },
      },
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
      return {
        type: "folder",
        path: entry.path,
        isFolded: true,
      };
    } else {
      return {
        type: "file",
        path: entry.path,
      };
    }
  });
}

function FileTreeFolder({
  path,
  tree,
  onChangeFold,
  onUpdateFolder,
  selectedFileProps,
}: {
  path: string;
  tree: Map<string, Folder | File>;
  onChangeFold: (path: string, state: boolean) => void;
  onUpdateFolder: (path: string, data: (File | Folder)[]) => void;
  selectedFileProps: SelectedFileProps;
}) {
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
      onUpdateFolder(path, query.data);
    }
  }, [query.data]);

  const folderName = folder.path.split("/").pop() || folder.path;

  if (isFolded) {
    return (
      <li className="group flex h-7 w-full flex-row justify-between">
        <div className="flex flex-row items-center">
          <ChevronRight
            className="h-4 w-4 hover:cursor-pointer"
            onClick={() => onChangeFold(path, false)}
          />
          <div>{folderName}</div>
        </div>
        <FolderMenu path={path} onUpdateFolder={onUpdateFolder} />
      </li>
    );
  }

  if (query.isLoading) return "Loading...";

  if (query.isError) return "Error.";

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
          <FolderMenu path={path} onUpdateFolder={onUpdateFolder} />
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
                  onUpdateFolder={onUpdateFolder}
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

function FileTree({
  selectedFileProps,
}: {
  selectedFileProps: SelectedFileProps;
}) {
  // TODO: enhance with immer
  const [tree, setTree] = useState(
    new Map<string, Folder | File>([
      [
        "/",
        { type: "folder", path: "/", childPaths: undefined, isFolded: true },
      ],
    ]),
  );

  function handleChangeFold(path: string, state: boolean) {
    const folder = tree.get(path) as Folder;
    folder.isFolded = state;
    setTree(new Map(tree.set(path, folder)));
  }

  function handleUpdateFolder(path: string, data: (File | Folder)[]) {
    console.log("handleUpdateFolder", path, data);

    const root = path === "/" ? path : path + "/";
    const folder = tree.get(path) as Folder;

    data.forEach((e) => {
      e.path = root + e.path;
      tree.set(e.path, e);
    });

    folder.childPaths = data.map((e) => e.path);

    console.log("new map", tree);
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
          selectedFileProps={selectedFileProps}
        />
      </ul>
    </>
  );
}

export { FileTree };
