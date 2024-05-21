import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { navigate } from "wouter/use-browser-location";

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
        {projects.map((project) => (
          <TableRow
            className="cursor-pointer"
            key={project.id}
            onClick={() => navigate(`/project/${project.id}`)}
          >
            <TableCell className="font-medium">{project.id}</TableCell>
            <TableCell>{project.name}</TableCell>
            <TableCell>{project.lastUpdate.getDate().toString()}</TableCell>
            <TableCell>{project.jobs}</TableCell>
            <TableCell>{project.success}</TableCell>
            <TableCell>{project.error}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
