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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router';

const CollectionCreationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResponse, setSubmitResponse] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Collection title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 30) {
      newErrors.title = 'Title must be less than 30 characters';
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description && formData.description.length > 100) {
      newErrors.description = 'Description must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitResponse(null);

    const submissionData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
    };

    try {
      const response = await api.post('/collections', submissionData);
      console.log("Collection created:", response);

      if (response.data.success) {
        navigate('/creator/collections');
    } else {
        setSubmitResponse({
          type: 'error',
          message: response.data.error || 'Failed to create collection',
        });
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      setSubmitResponse({
        type: 'error',
        message: error.response?.data?.error || 'An error occurred while creating the collection',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Collection</CardTitle>
        <CardDescription>
          Organize your posts into collections for better content management
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          
          {submitResponse && (
            <Alert variant={submitResponse.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>
                {submitResponse.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Collection Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={20}
              placeholder="e.g., Tutorials, Behind the Scenes, Exclusive Content"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Must be between 3 and 20 characters
            </p>
          </div>

          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={100}
              placeholder="Describe what this collection is about..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Between 10-100 characters
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.description.length}/100
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
              });
              setErrors({});
              setSubmitResponse(null);
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Collection'}
          </Button>
        </CardFooter>
      </form>
    </Card>
    </div>
  );
};

export default CollectionCreationForm;