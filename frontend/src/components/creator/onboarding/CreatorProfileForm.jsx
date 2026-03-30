import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UploadButton } from '@/lib/uploadthing';
import { api } from '@/lib/api';
import ProfileCreationSuccess from './ProfileCreationSuccess';

const CreatorProfileForm = () => {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    bio: '',
    pageName: '',
    pageUrl: '',
    profileImageUrl: '',
    bannerUrl: '',
    socialLinks: [''],
    aboutPage: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(true);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bio) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    } else if (formData.bio.length > 80) {
      newErrors.bio = 'Bio must not exceed 80 characters';
    }

    if (!formData.pageName) {
      newErrors.pageName = 'Page name is required';
    } else if (formData.pageName.length < 3) {
      newErrors.pageName = 'Page name must be at least 3 characters';
    } else if (formData.pageName.length > 20) {
      newErrors.pageName = 'Page name must not exceed 20 characters';
    }

    if (!formData.pageUrl) {
      newErrors.pageUrl = 'Page URL is required';
    } else if (formData.pageUrl.length < 3) {
      newErrors.pageUrl = 'Page URL must be at least 3 characters';
    } else if (formData.pageUrl.length > 30) {
      newErrors.pageUrl = 'Page URL must not exceed 30 characters';
    }

    if (formData.aboutPage && formData.aboutPage.length > 200) {
      newErrors.aboutPage = 'About page must not exceed 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialLinkChange = (index, value) => {
    const updatedSocialLinks = [...formData.socialLinks];
    updatedSocialLinks[index] = value;
    setFormData(prev => ({ ...prev, socialLinks: updatedSocialLinks }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }));
  };

  const removeSocialLink = (index) => {
    const updatedSocialLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      socialLinks: updatedSocialLinks.length ? updatedSocialLinks : ['']
    }));
  };

  const handleProfileImageUpload = (res) => {
    if (res?.[0]?.ufsUrl) {
      setFormData(prev => ({ ...prev, profileImageUrl: res[0].ufsUrl }));
    }
  };

  const handleBannerImageUpload = (res) => {
    if (res?.[0]?.ufsUrl) {
      setFormData(prev => ({ ...prev, bannerUrl: res[0].ufsUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    const filteredSocialLinks = formData.socialLinks.filter(link => link.trim() !== '');

    const submitData = {
      bio: formData.bio,
      pageName: formData.pageName,
      pageUrl: formData.pageUrl,
      ...(formData.profileImageUrl && { profileImageUrl: formData.profileImageUrl }),
      ...(formData.bannerUrl && { bannerUrl: formData.bannerUrl }),
      ...(filteredSocialLinks.length > 0 && { socialLinks: filteredSocialLinks }),
      ...(formData.aboutPage && { aboutPage: formData.aboutPage })
    };

    try {
      const response = await api.post('/creators/profile', submitData);

      if (response.data.success) {
        setSuccessMessage('Profile created successfully!');
        setShowForm(false);
      } else {
        throw new Error(response.data.message || 'Failed to create profile');
      }

    } catch (error) {
      console.error('Error submitting form:', error);

      let errorMessage = 'Failed to create profile';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.path?.[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
        errorMessage = 'Please fix the validation errors';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs">Creator Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs">
                  Bio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself (10-80 characters)"
                  className={`${errors.bio ? 'border-red-500' : ''} text-xs`}
                  rows={2}
                />
                <div className="flex justify-between">
                  {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
                  <p className="text-xs text-gray-500 ml-auto">{formData.bio.length}/80</p>
                </div>
              </div>

              {/* Page Name */}
              <div className="space-y-2">
                <Label htmlFor="pageName" className="text-xs">
                  Page Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pageName"
                  name="pageName"
                  value={formData.pageName}
                  onChange={handleChange}
                  placeholder="Enter page name (3-20 characters)"
                  className={`${errors.pageName ? 'border-red-500' : ''} text-xs`}
                />
                {errors.pageName && <p className="text-xs text-red-500">{errors.pageName}</p>}
              </div>

              {/* Page URL */}
              <div className="space-y-2">
                <Label htmlFor="pageUrl" className="text-xs">
                  Page URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pageUrl"
                  name="pageUrl"
                  value={formData.pageUrl}
                  onChange={handleChange}
                  placeholder="Enter page URL (3-30 characters)"
                  className={`${errors.pageUrl ? 'border-red-500' : ''} text-xs`}
                />
                {errors.pageUrl && <p className="text-xs text-red-500">{errors.pageUrl}</p>}
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <Label className="text-xs">Profile Image</Label>
                <div className="flex items-center gap-4">
                  {formData.profileImageUrl && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                      <img src={formData.profileImageUrl} alt="Profile preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={handleProfileImageUpload}
                    onUploadError={(error) => console.error('Upload error:', error)}
                  />
                </div>
                {formData.profileImageUrl && (
                  <p className="text-xs text-green-600 mt-1">Image uploaded successfully</p>
                )}
              </div>

              {/* Banner Image */}
              <div className="space-y-2">
                <Label className="text-xs">Banner Image</Label>
                {formData.bannerUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <img src={formData.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={handleBannerImageUpload}
                  onUploadError={(error) => console.error('Upload error:', error)}
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <Label className="text-xs">Social Links</Label>
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={link}
                      onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                      placeholder={`Social link ${index + 1}`}
                      className="flex-1 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocialLink(index)}
                      disabled={formData.socialLinks.length === 1 && !link}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="xs" 
                  onClick={addSocialLink} 
                  className="mt-2 text-xs"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </div>

              {/* About Page */}
              <div className="space-y-2">
                <Label htmlFor="aboutPage" className="text-xs">About Page</Label>
                <Textarea
                  id="aboutPage"
                  name="aboutPage"
                  value={formData.aboutPage}
                  onChange={handleChange}
                  placeholder="Tell more about yourself (max 200 characters)"
                  className={`${errors.aboutPage ? 'border-red-500' : ''} text-xs`}
                  rows={4}
                />
                <div className="flex justify-between">
                  {errors.aboutPage && <p className="text-xs text-red-500">{errors.aboutPage}</p>}
                  <p className="text-xs text-gray-500 ml-auto">{formData.aboutPage.length}/200</p>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" className="w-full text-xs" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Create Profile'}
                </Button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600">{successMessage}</p>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600">{errors.submit}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      )}
      {!showForm && (
        <ProfileCreationSuccess />
      )}
    </>
  );
};

export default CreatorProfileForm;