import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus } from 'lucide-react';
import { api } from '@/lib/api';

const MembershipCreationForm = () => {
  const [formData, setFormData] = useState({
    tierName: '',
    price: '',
    description: '',
    perks: [],
  });

  const [perkInput, setPerkInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResponse, setSubmitResponse] = useState(null);

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
      return;
    }

    setIsSubmitting(true);
    setSubmitResponse(null);

    // Prepare data for API
    const submissionData = {
      tierName: formData.tierName.trim(),
      price: parseFloat(formData.price),
      description: formData.description.trim() || undefined,
      perks: formData.perks.length > 0 ? formData.perks : undefined,
    };

    try {
      // Replace with your actual API endpoint
      const response = await api.post('/creators/memberships', submissionData);
      console.log("Response : ",response)

      if (response.data.success) {
        setSubmitResponse({
          type: 'success',
          message: 'Membership tier created successfully!',
          data: response.data.data,
        });
        // Reset form on success
        setFormData({
          tierName: '',
          price: '',
          description: '',
          perks: [],
        });
        setPerkInput('');
      } else {
        setSubmitResponse({
          type: 'error',
          message: 'Failed to create membership tier',
          errors: response.data.error || [],
        });
      }
    } catch (error) {
      setSubmitResponse({
        type: 'error',
        message: 'An error occurred while submitting the form',
        errors: [error.message],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Membership Tier</CardTitle>
        <CardDescription>
          Add a new subscription tier for your members
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Success/Error Alert */}
          {submitResponse && (
            <Alert variant={submitResponse.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>
                {submitResponse.message}
                {submitResponse.errors && submitResponse.errors.length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {submitResponse.errors.map((error, idx) => (
                      <li key={idx}>{typeof error === 'string' ? error : error.message}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

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

        <CardFooter className="flex justify-end gap-2">
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
              setSubmitResponse(null);
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
  );
};

export default MembershipCreationForm;