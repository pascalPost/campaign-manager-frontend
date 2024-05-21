"use client";

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
import { createPromiseClient } from "@connectrpc/connect";
import { CampaignManagerService } from "@/lib/proto/cm/v1/cm_connect";
import { catchError, transport } from "@/lib/utils.ts";
import { toast } from "sonner";

type Project = {
  projectName: string;
  csvFilePath: string;
};

const client = createPromiseClient(CampaignManagerService, transport);

export function CreateProjectPage() {
  const form = useForm<Project>({
    defaultValues: {
      projectName: "",
      csvFilePath: "",
    },
  });

  function onSubmit(data: Project) {
    console.log(data);
    client
      .newProject({
        projectName: data.projectName,
        csvFilePath: data.csvFilePath,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        toast.error(`Error encountered while creating project: ${error}`);
        console.error(error);
      });
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
          <FormField
            control={form.control}
            name="csvFilePath"
            render={({ field: { ...fieldProps } }) => (
              <FormItem>
                <FormLabel>CSV File</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    accept=".csv"
                    // onChange={(event) => {
                    //   onChange(event.target.files[0].name);
                    // }}
                  />
                </FormControl>
                <FormDescription>
                  Import a csv file with parameters for job generation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5">
            <Button type="submit" className="w-full">
              Start
            </Button>
            <Button type="reset" className="w-full" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
