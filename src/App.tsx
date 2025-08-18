import { useMemo, useCallback, useState } from 'react'
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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

// Sample data - 100 users for comprehensive testing
const sampleUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'Developer', status: 'active', joinDate: '2023-01-15', department: 'Engineering' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Designer', status: 'active', joinDate: '2023-02-20', department: 'Design' },
  { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Manager', status: 'inactive', joinDate: '2022-11-10', department: 'Engineering' },
  { id: '4', name: 'Alice Brown', email: 'alice.brown@example.com', role: 'Analyst', status: 'pending', joinDate: '2023-03-05', department: 'Marketing' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie.wilson@example.com', role: 'Developer', status: 'active', joinDate: '2023-01-28', department: 'Engineering' },
  { id: '6', name: 'Diana Davis', email: 'diana.davis@example.com', role: 'Designer', status: 'active', joinDate: '2023-02-14', department: 'Design' },
  { id: '7', name: 'Eva Martinez', email: 'eva.martinez@example.com', role: 'QA Engineer', status: 'active', joinDate: '2023-03-12', department: 'Engineering' },
  { id: '8', name: 'Frank Miller', email: 'frank.miller@example.com', role: 'Product Manager', status: 'active', joinDate: '2022-12-05', department: 'Product' },
  { id: '9', name: 'Grace Lee', email: 'grace.lee@example.com', role: 'UX Designer', status: 'active', joinDate: '2023-01-30', department: 'Design' },
  { id: '10', name: 'Henry Taylor', email: 'henry.taylor@example.com', role: 'Senior Developer', status: 'active', joinDate: '2022-10-15', department: 'Engineering' },
  { id: '11', name: 'Ivy Chen', email: 'ivy.chen@example.com', role: 'Data Scientist', status: 'active', joinDate: '2023-02-28', department: 'Data' },
  { id: '12', name: 'Jack Brown', email: 'jack.brown@example.com', role: 'DevOps Engineer', status: 'inactive', joinDate: '2023-01-08', department: 'Engineering' },
  { id: '13', name: 'Kelly White', email: 'kelly.white@example.com', role: 'Marketing Specialist', status: 'active', joinDate: '2023-03-18', department: 'Marketing' },
  { id: '14', name: 'Leo Garcia', email: 'leo.garcia@example.com', role: 'Business Analyst', status: 'pending', joinDate: '2023-04-02', department: 'Business' },
  { id: '15', name: 'Mia Rodriguez', email: 'mia.rodriguez@example.com', role: 'HR Manager', status: 'active', joinDate: '2022-11-22', department: 'HR' },
  { id: '16', name: 'Noah Anderson', email: 'noah.anderson@example.com', role: 'Frontend Developer', status: 'active', joinDate: '2023-02-10', department: 'Engineering' },
  { id: '17', name: 'Olivia Thompson', email: 'olivia.thompson@example.com', role: 'Content Writer', status: 'active', joinDate: '2023-03-25', department: 'Marketing' },
  { id: '18', name: 'Paul Wilson', email: 'paul.wilson@example.com', role: 'Backend Developer', status: 'active', joinDate: '2023-01-05', department: 'Engineering' },
  { id: '19', name: 'Quinn Davis', email: 'quinn.davis@example.com', role: 'Designer', status: 'inactive', joinDate: '2022-12-18', department: 'Design' },
  { id: '20', name: 'Rachel Green', email: 'rachel.green@example.com', role: 'Project Manager', status: 'active', joinDate: '2023-02-15', department: 'Product' },
  { id: '21', name: 'Sam Johnson', email: 'sam.johnson@example.com', role: 'Security Engineer', status: 'active', joinDate: '2023-03-08', department: 'Security' },
  { id: '22', name: 'Tina Lopez', email: 'tina.lopez@example.com', role: 'Sales Representative', status: 'active', joinDate: '2023-01-20', department: 'Sales' },
  { id: '23', name: 'Uma Patel', email: 'uma.patel@example.com', role: 'Mobile Developer', status: 'pending', joinDate: '2023-04-10', department: 'Engineering' },
  { id: '24', name: 'Victor Kim', email: 'victor.kim@example.com', role: 'Finance Analyst', status: 'active', joinDate: '2022-12-30', department: 'Finance' },
  { id: '25', name: 'Wendy Liu', email: 'wendy.liu@example.com', role: 'Technical Writer', status: 'active', joinDate: '2023-02-22', department: 'Documentation' },
  { id: '26', name: 'Xavier Moore', email: 'xavier.moore@example.com', role: 'Cloud Engineer', status: 'active', joinDate: '2023-03-15', department: 'Engineering' },
  { id: '27', name: 'Yara Hassan', email: 'yara.hassan@example.com', role: 'Product Designer', status: 'active', joinDate: '2023-01-25', department: 'Design' },
  { id: '28', name: 'Zoe Carter', email: 'zoe.carter@example.com', role: 'Operations Manager', status: 'inactive', joinDate: '2022-11-08', department: 'Operations' },
  { id: '29', name: 'Adam Smith', email: 'adam.smith@example.com', role: 'Full Stack Developer', status: 'active', joinDate: '2023-02-05', department: 'Engineering' },
  { id: '30', name: 'Beth Williams', email: 'beth.williams@example.com', role: 'Research Analyst', status: 'active', joinDate: '2023-03-20', department: 'Research' },
  { id: '31', name: 'Carl Jones', email: 'carl.jones@example.com', role: 'System Administrator', status: 'active', joinDate: '2023-01-12', department: 'IT' },
  { id: '32', name: 'Delia Martinez', email: 'delia.martinez@example.com', role: 'Legal Counsel', status: 'pending', joinDate: '2023-04-05', department: 'Legal' },
  { id: '33', name: 'Eric Brown', email: 'eric.brown@example.com', role: 'Database Administrator', status: 'active', joinDate: '2023-02-18', department: 'Engineering' },
  { id: '34', name: 'Fiona Davis', email: 'fiona.davis@example.com', role: 'Brand Manager', status: 'active', joinDate: '2023-03-10', department: 'Marketing' },
  { id: '35', name: 'George Wilson', email: 'george.wilson@example.com', role: 'Software Architect', status: 'active', joinDate: '2022-12-12', department: 'Engineering' },
  { id: '36', name: 'Hannah Miller', email: 'hannah.miller@example.com', role: 'Customer Success Manager', status: 'inactive', joinDate: '2023-01-18', department: 'Customer Success' },
  { id: '37', name: 'Ian Garcia', email: 'ian.garcia@example.com', role: 'Machine Learning Engineer', status: 'active', joinDate: '2023-02-25', department: 'Data' },
  { id: '38', name: 'Julia Thompson', email: 'julia.thompson@example.com', role: 'Compliance Officer', status: 'active', joinDate: '2023-03-22', department: 'Compliance' },
  { id: '39', name: 'Kevin Anderson', email: 'kevin.anderson@example.com', role: 'Site Reliability Engineer', status: 'active', joinDate: '2023-01-22', department: 'Engineering' },
  { id: '40', name: 'Luna Rodriguez', email: 'luna.rodriguez@example.com', role: 'Business Development', status: 'pending', joinDate: '2023-04-08', department: 'Business' },
  { id: '41', name: 'Marcus Lee', email: 'marcus.lee@example.com', role: 'Quality Assurance Lead', status: 'active', joinDate: '2023-02-12', department: 'Engineering' },
  { id: '42', name: 'Nina White', email: 'nina.white@example.com', role: 'Social Media Manager', status: 'active', joinDate: '2023-03-28', department: 'Marketing' },
  { id: '43', name: 'Oscar Chen', email: 'oscar.chen@example.com', role: 'Network Engineer', status: 'active', joinDate: '2023-01-30', department: 'IT' },
  { id: '44', name: 'Penny Taylor', email: 'penny.taylor@example.com', role: 'Graphic Designer', status: 'inactive', joinDate: '2022-12-25', department: 'Design' },
  { id: '45', name: 'Quincy Johnson', email: 'quincy.johnson@example.com', role: 'Performance Engineer', status: 'active', joinDate: '2023-02-08', department: 'Engineering' },
  { id: '46', name: 'Ruby Davis', email: 'ruby.davis@example.com', role: 'Training Coordinator', status: 'active', joinDate: '2023-03-16', department: 'HR' },
  { id: '47', name: 'Steve Wilson', email: 'steve.wilson@example.com', role: 'API Developer', status: 'active', joinDate: '2023-01-26', department: 'Engineering' },
  { id: '48', name: 'Tara Brown', email: 'tara.brown@example.com', role: 'Event Coordinator', status: 'pending', joinDate: '2023-04-12', department: 'Marketing' },
  { id: '49', name: 'Uri Patel', email: 'uri.patel@example.com', role: 'Technical Support', status: 'active', joinDate: '2023-02-28', department: 'Support' },
  { id: '50', name: 'Vera Kim', email: 'vera.kim@example.com', role: 'Scrum Master', status: 'active', joinDate: '2023-03-05', department: 'Product' },
  { id: '51', name: 'Wade Lopez', email: 'wade.lopez@example.com', role: 'Game Developer', status: 'active', joinDate: '2023-01-15', department: 'Engineering' },
  { id: '52', name: 'Xara Green', email: 'xara.green@example.com', role: 'Data Analyst', status: 'inactive', joinDate: '2022-11-30', department: 'Data' },
  { id: '53', name: 'Yuki Martinez', email: 'yuki.martinez@example.com', role: 'Voice UI Designer', status: 'active', joinDate: '2023-02-20', department: 'Design' },
  { id: '54', name: 'Zack Moore', email: 'zack.moore@example.com', role: 'Blockchain Developer', status: 'active', joinDate: '2023-03-12', department: 'Engineering' },
  { id: '55', name: 'Amy Carter', email: 'amy.carter@example.com', role: 'Public Relations', status: 'active', joinDate: '2023-01-10', department: 'Marketing' },
  { id: '56', name: 'Ben Hassan', email: 'ben.hassan@example.com', role: 'Infrastructure Engineer', status: 'pending', joinDate: '2023-04-15', department: 'Engineering' },
  { id: '57', name: 'Cleo Smith', email: 'cleo.smith@example.com', role: 'Talent Acquisition', status: 'active', joinDate: '2023-02-15', department: 'HR' },
  { id: '58', name: 'Dean Williams', email: 'dean.williams@example.com', role: 'Solutions Architect', status: 'active', joinDate: '2023-03-18', department: 'Engineering' },
  { id: '59', name: 'Emma Jones', email: 'emma.jones@example.com', role: 'Product Owner', status: 'active', joinDate: '2023-01-28', department: 'Product' },
  { id: '60', name: 'Felix Brown', email: 'felix.brown@example.com', role: 'Automation Engineer', status: 'inactive', joinDate: '2022-12-08', department: 'Engineering' },
  { id: '61', name: 'Gina Davis', email: 'gina.davis@example.com', role: 'UX Researcher', status: 'active', joinDate: '2023-02-22', department: 'Design' },
  { id: '62', name: 'Hugo Wilson', email: 'hugo.wilson@example.com', role: 'Release Manager', status: 'active', joinDate: '2023-03-25', department: 'Engineering' },
  { id: '63', name: 'Iris Miller', email: 'iris.miller@example.com', role: 'Cybersecurity Analyst', status: 'active', joinDate: '2023-01-20', department: 'Security' },
  { id: '64', name: 'Jake Garcia', email: 'jake.garcia@example.com', role: 'Platform Engineer', status: 'pending', joinDate: '2023-04-18', department: 'Engineering' },
  { id: '65', name: 'Kara Thompson', email: 'kara.thompson@example.com', role: 'Content Strategist', status: 'active', joinDate: '2023-02-10', department: 'Marketing' },
  { id: '66', name: 'Luke Anderson', email: 'luke.anderson@example.com', role: 'Embedded Developer', status: 'active', joinDate: '2023-03-30', department: 'Engineering' },
  { id: '67', name: 'Maya Rodriguez', email: 'maya.rodriguez@example.com', role: 'Benefits Administrator', status: 'active', joinDate: '2023-01-16', department: 'HR' },
  { id: '68', name: 'Nick Lee', email: 'nick.lee@example.com', role: 'Video Producer', status: 'inactive', joinDate: '2022-11-25', department: 'Marketing' },
  { id: '69', name: 'Opal White', email: 'opal.white@example.com', role: 'Financial Controller', status: 'active', joinDate: '2023-02-18', department: 'Finance' },
  { id: '70', name: 'Pete Chen', email: 'pete.chen@example.com', role: 'Test Engineer', status: 'active', joinDate: '2023-03-22', department: 'Engineering' },
  { id: '71', name: 'Quill Taylor', email: 'quill.taylor@example.com', role: 'Technical Recruiter', status: 'active', joinDate: '2023-01-12', department: 'HR' },
  { id: '72', name: 'Rosa Johnson', email: 'rosa.johnson@example.com', role: 'Business Intelligence', status: 'pending', joinDate: '2023-04-20', department: 'Data' },
  { id: '73', name: 'Seth Davis', email: 'seth.davis@example.com', role: 'VR Developer', status: 'active', joinDate: '2023-02-25', department: 'Engineering' },
  { id: '74', name: 'Tess Wilson', email: 'tess.wilson@example.com', role: 'Localization Manager', status: 'active', joinDate: '2023-03-08', department: 'Localization' },
  { id: '75', name: 'Ulrich Brown', email: 'ulrich.brown@example.com', role: 'IoT Engineer', status: 'active', joinDate: '2023-01-24', department: 'Engineering' },
  { id: '76', name: 'Violet Patel', email: 'violet.patel@example.com', role: 'Partnership Manager', status: 'inactive', joinDate: '2022-12-15', department: 'Business' },
  { id: '77', name: 'Will Kim', email: 'will.kim@example.com', role: 'Audio Engineer', status: 'active', joinDate: '2023-02-12', department: 'Engineering' },
  { id: '78', name: 'Xena Lopez', email: 'xena.lopez@example.com', role: 'E-commerce Manager', status: 'active', joinDate: '2023-03-15', department: 'Marketing' },
  { id: '79', name: 'Yolanda Green', email: 'yolanda.green@example.com', role: 'Privacy Officer', status: 'active', joinDate: '2023-01-30', department: 'Legal' },
  { id: '80', name: 'Zane Martinez', email: 'zane.martinez@example.com', role: 'AR Developer', status: 'pending', joinDate: '2023-04-22', department: 'Engineering' },
  { id: '81', name: 'Aria Moore', email: 'aria.moore@example.com', role: 'Growth Hacker', status: 'active', joinDate: '2023-02-08', department: 'Marketing' },
  { id: '82', name: 'Blake Carter', email: 'blake.carter@example.com', role: 'Conversion Optimizer', status: 'active', joinDate: '2023-03-20', department: 'Marketing' },
  { id: '83', name: 'Cara Hassan', email: 'cara.hassan@example.com', role: 'Facilities Manager', status: 'active', joinDate: '2023-01-18', department: 'Operations' },
  { id: '84', name: 'Drew Smith', email: 'drew.smith@example.com', role: 'AI Engineer', status: 'inactive', joinDate: '2022-12-02', department: 'Data' },
  { id: '85', name: 'Erin Williams', email: 'erin.williams@example.com', role: 'Learning & Development', status: 'active', joinDate: '2023-02-28', department: 'HR' },
  { id: '86', name: 'Ford Jones', email: 'ford.jones@example.com', role: 'Site Manager', status: 'active', joinDate: '2023-03-12', department: 'Operations' },
  { id: '87', name: 'Gwen Brown', email: 'gwen.brown@example.com', role: 'Digital Marketing', status: 'active', joinDate: '2023-01-25', department: 'Marketing' },
  { id: '88', name: 'Hayes Davis', email: 'hayes.davis@example.com', role: 'Technical Director', status: 'pending', joinDate: '2023-04-25', department: 'Engineering' },
  { id: '89', name: 'Ida Wilson', email: 'ida.wilson@example.com', role: 'Supply Chain Manager', status: 'active', joinDate: '2023-02-15', department: 'Operations' },
  { id: '90', name: 'Jude Miller', email: 'jude.miller@example.com', role: 'Accessibility Specialist', status: 'active', joinDate: '2023-03-28', department: 'Design' },
  { id: '91', name: 'Kendra Garcia', email: 'kendra.garcia@example.com', role: 'Sales Engineer', status: 'active', joinDate: '2023-01-22', department: 'Sales' },
  { id: '92', name: 'Lars Thompson', email: 'lars.thompson@example.com', role: 'Innovation Lead', status: 'inactive', joinDate: '2022-11-18', department: 'Innovation' },
  { id: '93', name: 'Mila Anderson', email: 'mila.anderson@example.com', role: 'Customer Experience', status: 'active', joinDate: '2023-02-20', department: 'Customer Success' },
  { id: '94', name: 'Nash Rodriguez', email: 'nash.rodriguez@example.com', role: 'Revenue Operations', status: 'active', joinDate: '2023-03-10', department: 'Finance' },
  { id: '95', name: 'Orla Lee', email: 'orla.lee@example.com', role: 'Process Engineer', status: 'active', joinDate: '2023-01-28', department: 'Operations' },
  { id: '96', name: 'Paige White', email: 'paige.white@example.com', role: 'Community Manager', status: 'pending', joinDate: '2023-04-28', department: 'Marketing' },
  { id: '97', name: 'Quest Chen', email: 'quest.chen@example.com', role: 'Risk Analyst', status: 'active', joinDate: '2023-02-22', department: 'Finance' },
  { id: '98', name: 'Remy Taylor', email: 'remy.taylor@example.com', role: 'Sustainability Officer', status: 'active', joinDate: '2023-03-25', department: 'Sustainability' },
  { id: '99', name: 'Sage Johnson', email: 'sage.johnson@example.com', role: 'Change Management', status: 'active', joinDate: '2023-01-15', department: 'HR' },
  { id: '100', name: 'Tate Davis', email: 'tate.davis@example.com', role: 'Strategy Consultant', status: 'inactive', joinDate: '2022-12-20', department: 'Strategy' }
]

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(true)

  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableColumnFilter: true,
      enableResizing: true,
      enablePinning: true,
      size: 200,
      minSize: 100,
      maxSize: 1400,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      enableColumnFilter: true,
      enableResizing: true,
      enablePinning: true,
      size: 250,
      minSize: 150,
      maxSize: 400,
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      enableColumnFilter: true,
      enableResizing: true,
      enablePinning: true,
      size: 180,
      minSize: 120,
      maxSize: 300,
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      enableColumnFilter: true,
      enableResizing: true,
      enablePinning: true,
      size: 150,
      minSize: 100,
      maxSize: 250,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      enableResizing: true,
      enablePinning: true,
      size: 120,
      minSize: 80,
      maxSize: 150,
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
      enableResizing: true,
      enablePinning: true,
      size: 130,
      minSize: 100,
      maxSize: 180,
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
      enableResizing: false,
      enablePinning: true,
      size: 80,
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

  const handleRowClick = useCallback((row: any) => {
    console.log('Row clicked:', row.original)
  }, [])

  const handleFilterApply = useCallback((filters: ColumnFiltersState) => {
    console.log('Filters applied:', filters)
  }, [])

  const handleClear = useCallback(() => {
    console.log('Filters cleared')
  }, [])

  const simulateLoading = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Advanced Data Table</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Manage and analyze your data with powerful filtering and sorting
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Simulate Loading'}
              </Button>
              <div className="flex items-center gap-2">
                <Switch 
                  id="sticky-toggle"
                  checked={stickyHeader}
                  onCheckedChange={setStickyHeader}
                />
                <Label htmlFor="sticky-toggle" className="text-sm">
                  Sticky Header
                </Label>
              </div>
            </div>
            <span className="text-sm text-primary-foreground/80">
              {sampleUsers.length} total users
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - DataTable takes remaining space */}
      <main className="flex-1 p-6 overflow-hidden">
        <DataTable
          data={sampleUsers}
          columns={columns}
          title="User Management"
          searchable={true}
          filterable={true}
          onRowClick={handleRowClick}
          onFilterApply={handleFilterApply}
          onClear={handleClear}
          spin={isLoading}
          sticky={stickyHeader}
        />
      </main>
    </div>
  )
}

export default App