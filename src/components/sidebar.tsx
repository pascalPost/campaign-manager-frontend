import { Button } from "@/components/ui/button.tsx";
import { Link } from "wouter";
import { Activity, CircleGauge, CirclePlus } from "lucide-react";

export function Sidebar() {
  return (
    <div className="flex w-full flex-col justify-between">
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline">
          <Link href="/">
            <CircleGauge className="mr-2" />
            Dashboard
          </Link>
        </Button>
        <Button asChild>
          <Link href="/scheduler">
            <Activity className="mr-2" />
            Scheduler
          </Link>
        </Button>
      </div>
      <div></div>
      {/*<div className="h-2/3 border-2">Projects organization pane</div>*/}
      <div>
        <Button asChild className="w-full">
          <Link href="/project/create">
            <CirclePlus className="mr-2" />
            Add Project
          </Link>
        </Button>
      </div>
    </div>
  );
}
