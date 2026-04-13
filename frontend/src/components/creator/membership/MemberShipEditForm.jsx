import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
import { X, Plus, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

const MembershipEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    tierName: '',
    price: '',
    description: '',
    perks: [],
    isActive: true,
  });

  const [perkInput, setPerkInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResponse, setSubmitResponse] = useState(null);

  // Fetch membership data on component mount
  useEffect(() => {
    fetchMembershipData();
  }, [id]);

  const fetchMembershipData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/creators/memberships/${id}`);
      console.log("Fetched membership:", response);
      
      if (response.data.success) {
        const membership = response.data.data.memberShip;
        setFormData({
          tierName: membership.tierName || '',
          price: membership.price || '',
          description: membership.description || '',
          perks: membership.perks || [],
          isActive: membership.isActive ?? true,
        });
      } else {
        setSubmitResponse({
          type: 'error',
          message: 'Failed to load membership data',
        });
      }
    } catch (error) {
      console.error("Error fetching membership:", error);
      setSubmitResponse({
        type: 'error',
        message: 'An error occurred while loading the membership',
        errors: [error.message],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validation function
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  // Form submission handler for update
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
      isActive: formData.isActive,
    };

    try {
      const response = await api.put(`/creators/memberships/${id}`, submissionData);
      console.log("Update response:", response);

      if (response.data.success) {
        setSubmitResponse({
          type: 'success',
          message: 'Membership tier updated successfully!',
        });
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate('/creator');
        }, 2000);
      } else {
        setSubmitResponse({
          type: 'error',
          message: 'Failed to update membership tier',
          errors: response.data.error || [],
        });
      }
    } catch (error) {
      setSubmitResponse({
        type: 'error',
        message: 'An error occurred while updating the form',
        errors: [error.message],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this membership tier?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.delete(`/creators/memberships/${id}`);
      
      if (response.data.success) {
        setSubmitResponse({
          type: 'success',
          message: 'Membership tier deleted successfully!',
        });
        
        setTimeout(() => {
          navigate('/creator');
        }, 2000);
      } else {
        setSubmitResponse({
          type: 'error',
          message: 'Failed to delete membership tier',
        });
      }
    } catch (error) {
      setSubmitResponse({
        type: 'error',
        message: 'An error occurred while deleting',
        errors: [error.message],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading membership data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/creator/memberships')}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Memberships
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Membership Tier</CardTitle>
          <CardDescription>
            Update your membership tier details
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

            {/* Active Status Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active Membership</Label>
            </div>

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

            {/* Price Field */}
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
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/creator/memberships')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Membership'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default MembershipEditForm;