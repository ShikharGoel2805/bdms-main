'use client'

import { useState, useEffect } from 'react'
import { Droplet, Calendar, Users, Activity, Bell, Settings, LogOut } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Appointment = {
  id: string
  userId: string
  dateTime: string
  status: string
  user: {
    firstName: string
    lastName: string
  }
}

type Stats = {
  totalUsers: number
  upcomingAppointments: number
  completedAppointments: number
}

export default function MainPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [appointmentFilter, setAppointmentFilter] = useState('ALL')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const menuItems = [
    { icon: Droplet, label: 'Dashboard', value: 'dashboard' },
    { icon: Calendar, label: 'Appointments', value: 'appointments' },
  ]

  useEffect(() => {
    fetchAppointments()
    fetchStats()
  }, [])

  const fetchAppointments = async (status = '') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments${status ? `?status=${status}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch appointments')
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId, status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update appointment status')
      const updatedAppointment = await response.json()
      setAppointments(appointments.map(appointment => 
        appointment.id === appointmentId ? updatedAppointment : appointment
      ))
      fetchStats() // Refresh stats after updating an appointment
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
  }

  const handleFilterChange = (filter: string) => {
    setAppointmentFilter(filter)
    fetchAppointments(filter === 'ALL' ? '' : filter)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card text-card-foreground p-4 space-y-4 border-r">
          <div className="flex items-center space-x-2 mb-8">
            <Droplet className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">BloodLink</h1>
          </div>
          <nav>
            {menuItems.map((item) => (
              <Button
                key={item.value}
                variant={activeTab === item.value ? 'secondary' : 'ghost'}
                className="w-full justify-start mb-2"
                onClick={() => setActiveTab(item.value)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">{menuItems.find(item => item.value === activeTab)?.label}</h2>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="dashboard">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    ) : (
                      <Skeleton className="h-8 w-20" />
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
                    ) : (
                      <Skeleton className="h-8 w-20" />
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="text-2xl font-bold">{stats.completedAppointments}</div>
                    ) : (
                      <Skeleton className="h-8 w-20" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>Manage and view all blood donation appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Select value={appointmentFilter} onValueChange={handleFilterChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter appointments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Appointments</SelectItem>
                        <SelectItem value="SCHEDULED">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[220px]" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User Name</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">{appointment.id}</TableCell>
                            <TableCell>{`${appointment.user.firstName} ${appointment.user.lastName}`}</TableCell>
                            <TableCell>{new Date(appointment.dateTime).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={appointment.status === 'COMPLETED' ? 'secondary' : 'default'}>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                                defaultValue={appointment.status}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Change status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
          </Tabs>
        </main>
      </div>
    </div>
  )
}