import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { navigate } from "wouter/use-browser-location";
import { client } from "@/lib/api/client.ts";
import { useQuery } from "react-query";

async function getProjects() {
  const { data, error } = await client.GET("/projects", {});
  if (error) throw error;
  return data;
}

const projects = [
  {
    id: "0",
    name: "P0",
    lastUpdate: new Date("2024-04-01"),
    jobs: 100,
    success: 20,
    error: 2,
  },
];

export function ProjectTable() {
  const query = useQuery("projects", getProjects);

  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error: {query.error}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Last Update</TableHead>
          <TableHead>Jobs</TableHead>
          <TableHead>Success</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.data?.map((project) => (
          <TableRow
            className="cursor-pointer"
            key={project.id}
            onClick={() => navigate(`/project/${project.id}`)}
          >
            <TableCell className="font-medium">{project.id}</TableCell>
            <TableCell>{project.name}</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
