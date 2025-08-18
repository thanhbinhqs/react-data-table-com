import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from '@phosphor-icons/react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  department: string
}

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    status: 'active',
    joinDate: '2023-01-15',
    department: 'Engineering'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Designer',
    status: 'active',
    joinDate: '2023-02-20',
    department: 'Design'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Manager',
    status: 'inactive',
    joinDate: '2022-11-10',
    department: 'Engineering'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'Analyst',
    status: 'pending',
    joinDate: '2023-03-05',
    department: 'Marketing'
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'Developer',
    status: 'active',
    joinDate: '2023-01-28',
    department: 'Engineering'
  },
  {
    id: '6',
    name: 'Diana Davis',
    email: 'diana.davis@example.com',
    role: 'Designer',
    status: 'active',
    joinDate: '2023-02-14',
    department: 'Design'
  }
]

function App() {
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const status = getValue() as string
        return (
          <Badge 
            variant={
              status === 'active' ? 'default' : 
              status === 'inactive' ? 'destructive' : 
              'secondary'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'joinDate',
      accessorKey: 'joinDate',
      header: 'Join Date',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const date = getValue() as string
        return new Date(date).toLocaleDateString()
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            alert(`View details for ${row.original.name}`)
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ], [])

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row.original)
  }

  return (
    <div className="container mx-auto py-8">
      <DataTable
        data={sampleUsers}
        columns={columns}
        title="User Management"
        searchable={true}
        filterable={true}
        onRowClick={handleRowClick}
      />
    </div>
  )
}

export default App