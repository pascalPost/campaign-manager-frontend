import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { catchError, transport } from "@/lib/utils.ts";
import { createPromiseClient } from "@connectrpc/connect";
import { CampaignManagerService } from "@/lib/proto/cm/v1/cm_connect.ts";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TriangleAlert } from "lucide-react";

const settingsSchema = z.object({
  workingDir: z.string().min(1),
  lsfUsername: z.string().min(1),
  lsfPassword: z.string().min(1),
});

const client = createPromiseClient(CampaignManagerService, transport);

export function SettingsPage() {
  const queryClient = useQueryClient();

  const query = useQuery<void, string>({
    queryKey: ["getSettings"],
    queryFn: () =>
      client.getSettings({}).then((res) => {
        console.log(`Fetching: ${JSON.stringify(res)}`);
        form.reset({
          workingDir: res.workingDir,
          lsfUsername: res.lsfUsername,
          lsfPassword: res.lsfPassword,
        });
      }),
  });

  const mutation = useMutation({
    mutationFn: (settings: z.infer<typeof settingsSchema>) => {
      return client.setSettings({
        workingDir: settings.workingDir,
        lsfUsername: settings.lsfUsername,
        lsfPassword: settings.lsfPassword,
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["getSettings"] })
        .catch((error) => console.log(error));
    },
    onError: (error) => {
      toast.error(
        `Error encountered while saving settings: ${error as string}`,
      );
      console.error(error);
    },
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      workingDir: "",
      lsfUsername: "",
      lsfPassword: "",
    },
  });

  function onSubmit(data: z.infer<typeof settingsSchema>) {
    console.log(data);
    mutation.mutate(data);
  }

  function onReset() {
    form.reset();
  }

  // TODO insert either spinner or skeleton
  if (query.isFetching) return "Loading...";

  if (query.error) {
    toast.error(`Error encountered while fetching settings: ${query.error}`);
    return (
      <div className="px-0 md:px-8">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Settings
        </h1>
      </div>
    );
  }

  return (
    <div className="px-0 md:px-8">
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Settings
      </h1>
      <div className="w-full py-4 md:max-w-2xl">
        <Form {...form}>
          <form
            onSubmit={(event) => catchError(form.handleSubmit(onSubmit)(event))}
            onReset={onReset}
            className="space-y-8"
          >
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              General
            </h2>
            <FormField
              control={form.control}
              name="workingDir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Directory</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/work/data"
                      type="text"
                      {...field}
                      value={form.getValues("workingDir")}
                    />
                  </FormControl>
                  <FormDescription>
                    The working directory (on the server) where the project
                    files are stored.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              LSF
            </h2>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="lsfUsername"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormDescription>The LSF username.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lsfPassword"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      The LSF password.
                      <br />
                      <span className="text-orange-500">
                        <TriangleAlert /> Warning: The password is right now
                        transferred in plain text. Use this for test purposes
                        only. This will be replaced as soon as possible with a
                        predefined security token,{" "}
                        <a
                          href="https://www.ibm.com/docs/fr/slac/10.1.0?topic=islacws-logging-in-web-services-pre-defined-security-token"
                          className="font-medium underline underline-offset-4"
                        >
                          see
                        </a>
                        .
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit">Save</Button>
              <Button type="reset" variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
