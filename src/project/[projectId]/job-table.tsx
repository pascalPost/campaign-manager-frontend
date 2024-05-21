import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge.tsx";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"; // TODO: click on job to see job infos, like state history change, detailed parameters, etc.

// TODO: click on job to see job infos, like state history change, detailed parameters, etc.

export type Job = {
  id: string;
  param: Record<string, string>;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  scheduler_id?: string;
};

export function GetColumnDef(data: Job[]): ColumnDef<Job>[] {
  const allKeysSet: Set<string> = new Set(
    data.flatMap((job) => Object.keys(job.param)),
  );

  const columnHelper = createColumnHelper<Job>();

  const columns: ColumnDef<Job>[] = [
    columnHelper.group({
      id: "info",
      header: "Info",
      columns: [
        {
          accessorKey: "id",
          header: "Job",
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => {
            return statusBadge(row.getValue("status"));
          },
        },
        {
          accessorKey: "scheduler_id",
          header: "Scheduler ID",
        },
      ],
    }),
    columnHelper.group({
      id: "param",
      header: "Parameter",
      columns: Array.from(allKeysSet).map((key) => ({
        accessorKey: key,
        header: key,
        cell: ({ row }) => {
          const job = row.original;
          return job.param[key];
        },
      })),
    }),
  ];

  return columns;
}

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">PENDING</Badge>;
    case "RUNNING":
      return <Badge>RUNNING</Badge>;
    case "COMPLETED":
      return <Badge variant="success">COMPLETED</Badge>;
    case "FAILED":
      return <Badge variant="destructive">FAILED</Badge>;
    case "CANCELLED":
      return <Badge variant="secondary">CANCELLED</Badge>;
    default:
      return <Badge variant="outline">UNKNOWN</Badge>;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function JobTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
