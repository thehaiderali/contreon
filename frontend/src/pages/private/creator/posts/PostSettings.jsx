import React, { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const PostSettings = ({ onSettingsChange, onSubmit, isSubmitting, initialSettings = {} }) => {
  // Public or Paid - mutually exclusive (not both)
  const [isPublic, setIsPublic] = useState(initialSettings.isPaid ? false : true)
  const [isPaid, setIsPaid] = useState(initialSettings.isPaid || false)
  const [price, setPrice] = useState(initialSettings.price || '')

  // Comments On or Off - mutually exclusive (not both)
  const [commentsOn, setCommentsOn] = useState(initialSettings.commentsAllowed !== false)
  const [commentsOff, setCommentsOff] = useState(initialSettings.commentsAllowed === false)

  // Handle Public toggle
  const handlePublicChange = (checked) => {
    if (checked) {
      setIsPublic(true)
      setIsPaid(false)
      setPrice('')
    } else {
      setIsPublic(false)
    }
  }

  // Handle Paid toggle
  const handlePaidChange = (checked) => {
    if (checked) {
      setIsPaid(true)
      setIsPublic(false)
    } else {
      setIsPaid(false)
      setPrice('')
    }
  }

  // Handle Comments On toggle
  const handleCommentsOnChange = (checked) => {
    if (checked) {
      setCommentsOn(true)
      setCommentsOff(false)
    } else {
      setCommentsOn(false)
    }
  }

  // Handle Comments Off toggle
  const handleCommentsOffChange = (checked) => {
    if (checked) {
      setCommentsOff(true)
      setCommentsOn(false)
    } else {
      setCommentsOff(false)
    }
  }

  // Send settings to parent
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        isPaid,
        commentsAllowed: commentsOn,
        price: isPaid ? parseFloat(price) : undefined
      })
    }
  }, [isPaid, commentsOn, price, onSettingsChange])

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-black dark:border-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-center">
          Post Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Section: Public or Paid (Mutually Exclusive) */}
        <div className="space-y-2">
          <Label className="text-[11px] font-medium">Post Visibility</Label>
          <p className="text-[10px] text-muted-foreground -mt-1 mb-1">
            Select either Public or Paid (not both)
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-mode" className="text-[11px]">
                Public
              </Label>
              <p className="text-[9px] text-muted-foreground">
                Free access for everyone
              </p>
            </div>
            <Switch
              id="public-mode"
              checked={isPublic}
              onCheckedChange={handlePublicChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="paid-content" className="text-[11px]">
                Paid
              </Label>
              <p className="text-[9px] text-muted-foreground">
                Pay to access this post
              </p>
            </div>
            <Switch
              id="paid-content"
              checked={isPaid}
              onCheckedChange={handlePaidChange}
            />
          </div>

          {/* Price input for paid posts */}
          {isPaid && (
            <div className="mt-2">
              <Label htmlFor="price" className="text-[11px]">Price ($)</Label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 px-2 py-1 text-[11px] border rounded-md dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter price"
                required
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Section: Comments On or Off (Mutually Exclusive) */}
        <div className="space-y-2">
          <Label className="text-[11px] font-medium">Comments Settings</Label>
          <p className="text-[10px] text-muted-foreground -mt-1 mb-1">
            Select either On or Off (not both)
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments-on" className="text-[11px]">
                Comments On
              </Label>
              <p className="text-[9px] text-muted-foreground">
                Allow users to comment
              </p>
            </div>
            <Switch
              id="comments-on"
              checked={commentsOn}
              onCheckedChange={handleCommentsOnChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments-off" className="text-[11px]">
                Comments Off
              </Label>
              <p className="text-[9px] text-muted-foreground">
                Disable all comments
              </p>
            </div>
            <Switch
              id="comments-off"
              checked={commentsOff}
              onCheckedChange={handleCommentsOffChange}
            />
          </div>
        </div>

        {/* Create Post Button */}
        <Button 
          onClick={onSubmit} 
          className="w-full mt-4 text-[11px] bg-blue-600 hover:bg-blue-700"
          size="sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </Button>
      </CardContent>
    </Card>
  )
}