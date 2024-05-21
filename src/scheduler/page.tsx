import { useQuery } from "react-query";
import { createPromiseClient } from "@connectrpc/connect";
import { CampaignManagerService } from "@/lib/proto/cm/v1/cm_connect.ts";
import { transport } from "@/lib/utils.ts";
import { GetLsfJobsResponse } from "@/lib/proto/cm/v1/cm_pb.ts";

const client = createPromiseClient(CampaignManagerService, transport);

export function SchedulerPage() {
  const query = useQuery<GetLsfJobsResponse, Error>({
    queryKey: "jobs",
    queryFn: async () => {
      const data = await client.getLsfJobs({});
      console.log(`Fetching: ${JSON.stringify(data)}`);
      return data;
    },
  });

  if (query.isFetching) {
    return "Loading";
  }

  if (query.error) {
    return `Error: ${query.error.message}`;
  }

  const json = JSON.stringify(query.data, null, 2);

  return (
    <div>
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Scheduler
      </h1>
      <>{json}</>
    </div>
  );
}
