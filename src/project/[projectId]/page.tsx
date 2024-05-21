"use client";

import { GetColumnDef, Job, JobTable } from "./job-table.tsx";

const jobs: Job[] = [
  {
    id: "0",
    param: {
      key1: "v0",
      key2: "v0",
      key3: "v0",
    },
    status: "PENDING",
  },
  {
    id: "1",
    param: {
      key1: "v1",
      key2: "v1",
      key3: "v1",
    },
    status: "RUNNING",
    scheduler_id: "504342",
  },
  {
    id: "2",
    param: {
      key1: "v2",
      key2: "v2",
      key3: "v2",
    },
    status: "COMPLETED",
    scheduler_id: "504344",
  },
  {
    id: "3",
    param: {
      key1: "v3",
      key2: "v3",
      key3: "v3",
    },
    status: "FAILED",
    scheduler_id: "504347",
  },
  {
    id: "4",
    param: {
      key1: "v4",
      key2: "v4",
      key3: "v4",
    },
    status: "CANCELLED",
  },
];

export function ProjectPage({ params }: { params: { projectId: string } }) {
  return (
    <div>
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Project {params.projectId}
      </h1>
      <div className="mt-4">
        <JobTable columns={GetColumnDef(jobs)} data={jobs} />
      </div>
    </div>
  );
}
