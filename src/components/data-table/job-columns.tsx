import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

// Define your data type
export type Job = {
  id: number
  companyName: string
  jobRole: string
  description: string
  ctc: string
  stipend?: string
  location: string
  requiredSkills: string[]
}

export const getJobColumns = (userType: "student" | "company" | "admin" | null): ColumnDef<Job>[] => {
  const columns: ColumnDef<Job>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#" />
      ),
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "companyName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company Name" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("companyName")}</div>,
    },
    {
      accessorKey: "jobRole",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Job Role" />
      ),
      cell: ({ row }) => <div>{row.getValue("jobRole")}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "ctc",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CTC" />
      ),
      cell: ({ row }) => <div>{row.getValue("ctc")}</div>,
    },
    {
      accessorKey: "stipend",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stipend" />
      ),
      cell: ({ row }) => <div>{row.getValue("stipend") || "-"}</div>,
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => <div>{row.getValue("location")}</div>,
    },
    {
      accessorKey: "requiredSkills",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Required Skills" />
      ),
      cell: ({ row }) => {
        const skills = row.getValue("requiredSkills") as string[]
        return (
          <div className="flex flex-wrap gap-1">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-muted text-xs px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        )
      },
    },
  ]

  // Conditionally add the Apply column for students
  if (userType === "student") {
    columns.push({
      id: "apply",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Apply" />
      ),
      cell: ({ row }) => (
        <Button size="sm" onClick={() => alert(`Applied for ${row.original.jobRole}`)}>
          Apply
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    })
  }

  // Optionally add row actions for admins
  columns.push({
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  })

  return columns
}

