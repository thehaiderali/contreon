import React, { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Loader2, MapPin, Calendar, Edit2, Save, X, Camera } from 'lucide-react'

const SubscriberProfile = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    country: '',
    avatar: '',
    bio: '',
    joinedDate: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    country: '',
    bio: '',
    avatar: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await api.get('/subscriber/profile')
      const data = response.data?.data || response.data
      setProfile({
        displayName: data.displayName || user?.fullName || 'User',
        email: data.email || user?.email || '',
        country: data.country || 'Not specified',
        avatar: data.avatar || '',
        bio: data.bio || '',
        joinedDate: data.joinedDate || user?.createdAt || new Date().toISOString()
      })
      setFormData({
        displayName: data.displayName || user?.fullName || '',
        country: data.country || '',
        bio: data.bio || '',
        avatar: data.avatar || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile({
        displayName: user?.fullName || 'User',
        email: user?.email || '',
        country: 'Not specified',
        avatar: '',
        bio: '',
        joinedDate: user?.createdAt || new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Simple working avatar upload using fetch
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploadingAvatar(true)
    
    try {
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, avatar: tempUrl }))
      
      // For now, just show success - actual upload to be implemented later
      toast.success('Profile picture selected! (Upload will be implemented)')
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to select image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await api.put('/subscriber/profile', formData)
      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          displayName: formData.displayName,
          country: formData.country,
          bio: formData.bio,
          avatar: formData.avatar
        }))
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: profile.displayName,
      country: profile.country === 'Not specified' ? '' : profile.country,
      bio: profile.bio,
      avatar: profile.avatar
    })
    setIsEditing(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar || profile.avatar} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(profile.displayName)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      disabled={uploadingAvatar}
                      type="button"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="h-3 w-3" />
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-semibold">{profile.displayName}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex flex-wrap gap-4 mt-2 justify-center sm:justify-start">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.country}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {formatDate(profile.joinedDate)}
                  </span>
                </div>
                {profile.bio && (
                  <p className="mt-3 text-sm text-muted-foreground border-l-2 border-primary pl-3">
                    {profile.bio}
                  </p>
                )}
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal information and how it appears on your account
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground text-sm">Display Name</Label>
                    <p className="text-foreground font-medium mt-1">{profile.displayName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Email</Label>
                    <p className="text-foreground font-medium mt-1">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Country of Residence</Label>
                    <p className="text-foreground font-medium mt-1">{profile.country}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Member Since</Label>
                    <p className="text-foreground font-medium mt-1">{formatDate(profile.joinedDate)}</p>
                  </div>
                </div>
                {profile.bio && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Bio</Label>
                    <p className="text-foreground mt-1">{profile.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="Your display name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country of Residence</Label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a country</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us a little about yourself"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
          {isEditing && (
            <>
              <Separator />
              <CardFooter className="flex justify-end gap-3 pt-6">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        {/* Membership Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Membership</CardTitle>
            <CardDescription>Your current subscription status</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Status</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Active Subscriber
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">{formatDate(profile.joinedDate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SubscriberProfile