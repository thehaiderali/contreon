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
import MinimalLoader from '@/src/components/creator/dashboard/MinimalLoader';
import { motion } from 'motion/react';
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from 'react-router';


const EditCreatorProfile = () => {
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
  const [loading, setLoading] = useState(true);
  const [redirect,setRedirect]=useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/creators/profile/me");
      
      if (response.data.success && response.data.data) {
        const profile = response.data.data.profile;
        // Populate form with existing profile data
        setFormData({
          bio: profile.bio || '',
          pageName: profile.pageName || '',
          pageUrl: profile.pageUrl || '',
          profileImageUrl: profile.profileImageUrl || '',
          bannerUrl: profile.bannerUrl || '',
          socialLinks: profile.socialLinks?.length ? profile.socialLinks : [''],
          aboutPage: profile.aboutPage || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Handle error - maybe redirect to create profile page
      setErrors({ submit: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bio) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    } else if (formData.bio.length > 80) {
      newErrors.bio = 'Bio must not exceed 80 characters';
    }

    // Page name validation
    if (!formData.pageName) {
      newErrors.pageName = 'Page name is required';
    } else if (formData.pageName.length < 3) {
      newErrors.pageName = 'Page name must be at least 3 characters';
    } else if (formData.pageName.length > 20) {
      newErrors.pageName = 'Page name must not exceed 20 characters';
    }

    // Page URL validation
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
      // Clear any previous errors for this field
      if (errors.profileImageUrl) {
        setErrors(prev => ({ ...prev, profileImageUrl: '' }));
      }
    }
  };

  const handleBannerImageUpload = (res) => {
    if (res?.[0]?.ufsUrl) {
      setFormData(prev => ({ ...prev, bannerUrl: res[0].ufsUrl }));
      // Clear any previous errors for this field
      if (errors.bannerUrl) {
        setErrors(prev => ({ ...prev, bannerUrl: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Filter out empty social links
    const filteredSocialLinks = formData.socialLinks.filter(link => link.trim() !== '');

    // Prepare update data - only include fields that have been modified
    const submitData = {};
    
    // Include fields that have values (all fields are optional for update)
    if (formData.bio) submitData.bio = formData.bio;
    if (formData.pageName) submitData.pageName = formData.pageName;
    if (formData.pageUrl) submitData.pageUrl = formData.pageUrl;
    if (formData.profileImageUrl) submitData.profileImageUrl = formData.profileImageUrl;
    if (formData.bannerUrl) submitData.bannerUrl = formData.bannerUrl;
    if (filteredSocialLinks.length > 0) submitData.socialLinks = filteredSocialLinks;
    if (formData.aboutPage) submitData.aboutPage = formData.aboutPage;

    try {
      // Update existing profile using PUT
      const response = await api.put('/creators/profile/edit', submitData);

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setRedirect(true)
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }

    } catch (error) {
      console.error('Error updating profile:', error);

      let errorMessage = 'Failed to update profile';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const fieldErrors = {};
        if (Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => {
            if (err.path?.[0]) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
        }
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

  if (loading) {
    return <MinimalLoader />;
  }

  return (
    <>
 {!redirect &&(
       <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Edit Creator Profile</CardTitle>
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

          {/* Page Name - Disabled for editing */}
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
              className={`${errors.pageName ? 'border-red-500' : ''} text-xs bg-gray-50`}
              disabled
            />
            {errors.pageName && <p className="text-xs text-red-500">{errors.pageName}</p>}
            <p className="text-xs text-gray-500">Page name cannot be changed after creation</p>
          </div>

          {/* Page URL - Disabled for editing */}
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
              className={`${errors.pageUrl ? 'border-red-500' : ''} text-xs bg-gray-50`}
              disabled
            />
            {errors.pageUrl && <p className="text-xs text-red-500">{errors.pageUrl}</p>}
            <p className="text-xs text-gray-500">Page URL cannot be changed after creation</p>
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label className="text-xs">Profile Image</Label>
            <div className="flex items-center gap-4">
              {formData.profileImageUrl && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                  <img 
                    src={formData.profileImageUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={handleProfileImageUpload}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                  setErrors(prev => ({ ...prev, profileImageUrl: 'Failed to upload image' }));
                }}
              />
            </div>
            {formData.profileImageUrl && (
              <p className="text-xs text-green-600 mt-1">Image uploaded successfully</p>
            )}
            {errors.profileImageUrl && (
              <p className="text-xs text-red-500">{errors.profileImageUrl}</p>
            )}
          </div>

          {/* Banner Image */}
          <div className="space-y-2">
            <Label className="text-xs">Banner Image</Label>
            {formData.bannerUrl && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                <img 
                  src={formData.bannerUrl} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={handleBannerImageUpload}
              onUploadError={(error) => {
                console.error('Upload error:', error);
                setErrors(prev => ({ ...prev, bannerUrl: 'Failed to upload banner' }));
              }}
            />
            {errors.bannerUrl && (
              <p className="text-xs text-red-500">{errors.bannerUrl}</p>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            <Label className="text-xs">Social Links</Label>
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={link}
                  onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                  placeholder={`Social link ${index + 1} (e.g., https://twitter.com/username)`}
                  className="flex-1 text-xs"
                  type="url"
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
              size="sm" 
              onClick={addSocialLink} 
              className="mt-2 text-xs"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Social Link
            </Button>
            <p className="text-xs text-gray-500">Add links to your social media profiles</p>
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
            <Button 
              type="submit" 
              className="w-full text-xs" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
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
   {redirect && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
    className="w-full h-screen flex flex-col justify-center items-center bg-background"
  >
    {/* Success Icon */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      className="mb-8"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </motion.div>

    {/* Success Message */}
    <div className="text-center space-y-2 mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
        Profile Updated Successfully!
      </h1>
      <p className="text-sm text-muted-foreground">
        Your changes have been saved
      </p>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        asChild
        variant="default"
        size="lg"
        className="group relative overflow-hidden"
      >
        <Link to="/creator/">
          <span className="relative z-10 flex items-center gap-2">
            Return to Dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </Button>
      
      <Button
        asChild
        variant="outline"
        size="lg"
      >
        <Link to={`/c/${formData.pageUrl}`}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View Your Page
        </Link>
      </Button>
    </div>
  </motion.div>
)}
    </>
  );
};

export default EditCreatorProfile;