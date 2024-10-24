
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Droplet, User } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const AppointmentCard = ({ appointment, type }:{appointment:any,type:any}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="w-full"
  >
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Droplet className="h-4 w-4 text-red-500" />
              <span className="font-medium">Blood Type: {appointment.bloodType}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{new Date(appointment.dateTime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{new Date(appointment.dateTime).toLocaleTimeString()}</span>
            </div>
            {type === 'receiving' && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Units: {appointment.units}</span>
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            appointment.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
            appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {appointment.status}
          </span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function RequestPage() {
  
  const [isLoading, setIsLoading] = useState(false);
  const [requestType, setRequestType] = useState('donation');
  const [appointments, setAppointments] = useState({ donation: [], receiving: [] });
  const [activeTab, setActiveTab] = useState('request');
  const [formData, setFormData] = useState({
    bloodType: '',
    dateTime: '',
    units: 1,
  });

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      setAppointments({
        donation: data.donationRequests,
        receiving: data.receivingRequests
      });
    } catch (error) {
      toast.success(
         "Failed to fetch appointments"
      );
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: requestType,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit request');
      }

      toast.success(
        
         `Your ${requestType} request has been submitted successfully.`,
      );

      // Reset form and fetch updated appointments
      setFormData({ bloodType: '', dateTime: '', units: 1 });
      fetchAppointments();
      setActiveTab('appointments');
    } catch (error) {
      toast.error(
        
        "Failed to submit request. Please try again.",
       
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="request">New Request</TabsTrigger>
            <TabsTrigger value="appointments">Your Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="request">
            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Blood Request Form</CardTitle>
                  <CardDescription>
                    Submit a request for blood donation or reception
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div 
                      className="space-y-4"
                      initial={false}
                      animate={{ height: 'auto' }}
                    >
                      <Label>Request Type</Label>
                      <RadioGroup
                        defaultValue="donation"
                        onValueChange={setRequestType}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="donation" id="donation" />
                          <Label htmlFor="donation">Donation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="receiving" id="receiving" />
                          <Label htmlFor="receiving">Receiving</Label>
                        </div>
                      </RadioGroup>
                    </motion.div>

                    <motion.div 
                      className="space-y-4"
                      initial={false}
                      animate={{ height: 'auto' }}
                    >
                      <Label>Blood Type</Label>
                      <Select 
                        onValueChange={(value) => setFormData({...formData, bloodType: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Blood Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {requestType === 'receiving' && (
                        <motion.div 
                          className="space-y-4"
                          {...fadeIn}
                        >
                          <Label>Units Required</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.units}
                            onChange={(e) => setFormData({...formData, units: parseInt(e.target.value)})}
                            required
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div 
                      className="space-y-4"
                      initial={false}
                      animate={{ height: 'auto' }}
                    >
                      <Label>Preferred Date and Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                        required
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Request"}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="appointments">
            <motion.div {...fadeIn} className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Donation Appointments</CardTitle>
                    <CardDescription>Your scheduled blood donations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.donation.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No donation appointments yet</p>
                    ) : (
                      appointments.donation.map((apt:any) => (
                        <AppointmentCard key={apt.id} appointment={apt} type="donation" />
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receiving Appointments</CardTitle>
                    <CardDescription>Your scheduled blood reception requests</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.receiving.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No receiving appointments yet</p>
                    ) : (
                      appointments.receiving.map((apt:any) => (
                        <AppointmentCard key={apt.id} appointment={apt} type="receiving" />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}