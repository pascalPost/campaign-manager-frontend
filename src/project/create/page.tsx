import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { catchError } from "@/lib/utils.ts";
import { toast } from "sonner";
import { useMutation } from "react-query";
import { client } from "@/lib/api/client.ts";

type Project = {
  projectName: string;
};

async function postProjects(name: string) {
  const { data, error } = await client.POST("/projects", {
    body: { name },
  });
  if (error) throw error;
  return data.id;
}

export function CreateProjectPage() {
  const form = useForm<Project>({
    defaultValues: {
      projectName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (projectName: string) => {
      return postProjects(projectName);
    },
    onError: (e) => {
      toast.error(`Error on folder creation: ${e}`);
    },
    onSuccess: (data) => {
      toast.success(`Project ${data} created.`);
    },
  });

  function onSubmit(data: Project) {
    mutation.mutate(data.projectName);
    // client
    //   .newProject({
    //     projectName: data.projectName,
    //     csvFilePath: data.csvFilePath,
    //   })
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((error) => {
    //     toast.error(`Error encountered while creating project: ${error}`);
    //     console.error(error);
    //   });
  }

  return (
    <>
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Create Project
      </h1>
      <Form {...form}>
        <form
          onSubmit={(event) => catchError(form.handleSubmit(onSubmit)(event))}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Project Name" {...field} />
                </FormControl>
                <FormDescription>The name of the project.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5">
            <Button type="submit" className="w-full">
              Create
            </Button>
            <Button
              type="reset"
              className="w-full"
              variant="secondary"
              disabled
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
