import React, { useState } from 'react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Key, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const CreatorSettings = () => {
  const navigate = useNavigate()
  const {logout}=useAuthStore();
  
  // Update Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('password')
  
  // Delete Account State
  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmation: ''
  })
  const [deleteErrors, setDeleteErrors] = useState({})
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Handle Password Input Changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle Delete Account Input Changes
  const handleDeleteChange = (e) => {
    const { name, value } = e.target
    setDeleteData(prev => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (deleteErrors[name]) {
      setDeleteErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Update Password Submit Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    // Client-side validation
    const errors = {}
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      errors.confirmNewPassword = 'New passwords do not match'
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsUpdatingPassword(true)
    setPasswordErrors({})

    try {
      const response = await api.put('/auth/update-password', passwordData)
      
      if (response.data.success) {
        toast.success('Password updated successfully!', {
          duration: 3000,
          icon: '🔒',
        })
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        })
      }
    } catch (error) {
      console.error('Password update error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to update password'
      toast.error(errorMessage, {
        duration: 4000,
      })
      
      // Handle specific field errors
      if (error.response?.data?.error === "Current password is incorrect") {
        setPasswordErrors({ currentPassword: error.response.data.error })
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Delete Account Submit Handler
  const handleDeleteAccount = async () => {
    // Validate before making API call
    const errors = {}
    if (!deleteData.password) {
      errors.password = 'Password is required'
    }
    if (deleteData.confirmation !== 'DELETE') {
      errors.confirmation = 'Please type "DELETE" to confirm account deletion'
    }
    
    if (Object.keys(errors).length > 0) {
      setDeleteErrors(errors)
      return
    }

    setIsDeletingAccount(true)
    setDeleteErrors({})

    try {
      const response = await api.delete('/auth/delete-account', {
        data: deleteData
      })
      
      if (response.data.success) {
        toast.success('Account deleted successfully', {
          duration: 3000,
          icon: '🗑️',
        })
        await logout()
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to delete account'
      toast.error(errorMessage, {
        duration: 4000,
      })
      
      // Handle specific field errors
      if (error.response?.data?.error === "Password is incorrect") {
        setDeleteErrors({ password: error.response.data.error })
      }
    } finally {
      setIsDeletingAccount(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="password" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Update Password
          </TabsTrigger>
          <TabsTrigger value="delete" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </TabsTrigger>
        </TabsList>

        {/* Update Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure. Make sure to use a strong password.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.currentPassword ? 'border-destructive' : ''}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password (min. 6 characters)"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.newPassword ? 'border-destructive' : ''}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.confirmNewPassword ? 'border-destructive' : ''}
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword}</p>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password must be at least 6 characters long and different from your current password.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Delete Account Tab */}
        <TabsContent value="delete">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will permanently delete your account, all your content, 
                  and remove your access to all services. All data will be irretrievably lost.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Confirm Your Password</Label>
                  <Input
                    id="deletePassword"
                    name="password"
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deleteData.password}
                    onChange={handleDeleteChange}
                    className={deleteErrors.password ? 'border-destructive' : ''}
                  />
                  {deleteErrors.password && (
                    <p className="text-sm text-destructive">{deleteErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="confirmation"
                    name="confirmation"
                    type="text"
                    placeholder="Type DELETE here"
                    value={deleteData.confirmation}
                    onChange={handleDeleteChange}
                    className={deleteErrors.confirmation ? 'border-destructive' : ''}
                  />
                  {deleteErrors.confirmation && (
                    <p className="text-sm text-destructive">{deleteErrors.confirmation}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto"
                    disabled={!deleteData.password || deleteData.confirmation !== 'DELETE'}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-destructive">Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This will delete all your projects, content, and personal information.
                      </AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">
                      Please confirm that you want to permanently delete your account.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                    >
                      {isDeletingAccount ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Yes, Delete My Account'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CreatorSettings