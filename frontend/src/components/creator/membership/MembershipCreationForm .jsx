import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const MembershipCreationForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    tierName: '',
    price: '',
    description: '',
    perks: [],
  });

  const [perkInput, setPerkInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tierName.trim()) {
      newErrors.tierName = 'Tier name is required';
    } else if (formData.tierName.length < 3) {
      newErrors.tierName = 'Tier name must be at least 3 characters';
    } else if (formData.tierName.length > 30) {
      newErrors.tierName = 'Tier name must be less than 30 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle perks
  const addPerk = () => {
    if (perkInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        perks: [...prev.perks, perkInput.trim()],
      }));
      setPerkInput('');
    }
  };

  const removePerk = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPerk();
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    // Prepare data for API
    const submissionData = {
      tierName: formData.tierName.trim(),
      price: parseFloat(formData.price),
      description: formData.description.trim() || undefined,
      perks: formData.perks.length > 0 ? formData.perks : undefined,
    };

    try {
      const response = await api.post('/creators/memberships', submissionData);
      console.log("Response : ", response)

      if (response.data.success) {
        toast.success('Membership tier created successfully!');
        
        // Reset form after successful submission
        setFormData({
          tierName: '',
          price: '',
          description: '',
          perks: [],
        });
        setPerkInput('');
        setErrors({});
        
        // Optional: Navigate back after 2 seconds
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to create membership tier');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while submitting the form');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Membership Tier</CardTitle>
          <CardDescription>
            Add a new subscription tier for your members
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Tier Name Field */}
            <div className="space-y-2">
              <Label htmlFor="tierName">
                Tier Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tierName"
                name="tierName"
                value={formData.tierName}
                onChange={handleInputChange}
                placeholder="e.g., Basic, Pro, Enterprise"
                className={errors.tierName ? 'border-red-500' : ''}
              />
              {errors.tierName && (
                <p className="text-sm text-red-500">{errors.tierName}</p>
              )}
              <p className="text-sm text-gray-500">
                Must be between 3 and 30 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">
                Price <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="1.00"
                  className={`pl-7 ${errors.price ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this tier includes..."
                rows={4}
              />
              <p className="text-sm text-gray-500">Optional field</p>
            </div>

            {/* Perks Field */}
            <div className="space-y-2">
              <Label htmlFor="perks">Perks</Label>
              <div className="flex gap-2">
                <Input
                  id="perks"
                  value={perkInput}
                  onChange={(e) => setPerkInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a perk (e.g., 24/7 Support)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addPerk}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Perks List */}
              {formData.perks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.perks.map((perk, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pl-2"
                    >
                      {perk}
                      <button
                        type="button"
                        onClick={() => removePerk(index)}
                        className="ml-1 hover:text-red-500 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500">
                Optional - Add perks included in this membership
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  tierName: '',
                  price: '',
                  description: '',
                  perks: [],
                });
                setPerkInput('');
                setErrors({});
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Membership'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default MembershipCreationForm;