import { Link } from "wouter";
import { Button } from "@/components/ui/button.tsx";
import { ProjectTable } from "./project-table.tsx";
import { CirclePlus } from "lucide-react";

export function DashboardPage() {
  return (
    <div>
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>
      <div className="mt-4 flex flex-row-reverse gap-5">
        <Button className="min-w-80" asChild>
          <Link href="/project/create">
            <CirclePlus className="mr-2" /> Add Project
          </Link>
        </Button>
      </div>
      <div className="mt-4">
        <ProjectTable />
      </div>
    </div>
  );
}
