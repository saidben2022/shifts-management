import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../components/ui/use-toast";

export default function AddWorker() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workerId: '',
    contractStartDate: '',
    contractDuration: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          contractDuration: parseInt(formData.contractDuration)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add worker');
      }

      toast({
        title: "Success",
        description: "Worker has been added successfully",
        variant: "success",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add worker. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-primary">Add New Worker</CardTitle>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workerId">Worker ID</Label>
                <Input
                  id="workerId"
                  name="workerId"
                  value={formData.workerId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractStartDate">Contract Start Date</Label>
                  <Input
                    id="contractStartDate"
                    name="contractStartDate"
                    type="date"
                    value={formData.contractStartDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractDuration">Contract Duration (months)</Label>
                  <Input
                    id="contractDuration"
                    name="contractDuration"
                    type="number"
                    min="1"
                    value={formData.contractDuration}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Adding Worker..." : "Add Worker"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
