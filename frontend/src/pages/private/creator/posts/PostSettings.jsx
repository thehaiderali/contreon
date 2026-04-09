import React, { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const PostSettings = ({ onSettingsChange, onSubmit, isSubmitting, initialSettings = {} }) => {
  const [isPublic, setIsPublic] = useState(initialSettings.isPaid ? false : true)
  const [isPaid, setIsPaid] = useState(initialSettings.isPaid || false)
  const [price, setPrice] = useState(initialSettings.price || '')
  const [commentsOn, setCommentsOn] = useState(initialSettings.commentsAllowed !== false)
  const [commentsOff, setCommentsOff] = useState(initialSettings.commentsAllowed === false)

  // Handle Public toggle
  const handlePublicChange = (checked) => {
    setIsPublic(checked)
    if (checked) {
      setIsPaid(false)
      setPrice('')
    }
    // Immediately send updated settings to parent
    onSettingsChange({
      isPaid: isPaid && !checked ? isPaid : false,
      commentsAllowed: commentsOn,
      price: undefined
    })
  }

  // Handle Paid toggle
  const handlePaidChange = (checked) => {
    setIsPaid(checked)
    if (checked) {
      setIsPublic(false)
    } else {
      setPrice('')
    }
    // Immediately send updated settings to parent
    onSettingsChange({
      isPaid: checked,
      commentsAllowed: commentsOn,
      price: checked ? parseFloat(price) || undefined : undefined
    })
  }

  // Handle Price input
  const handlePriceChange = (e) => {
    const newPrice = e.target.value
    setPrice(newPrice)
    // Immediately send updated settings to parent
    onSettingsChange({
      isPaid: isPaid,
      commentsAllowed: commentsOn,
      price: isPaid ? parseFloat(newPrice) || undefined : undefined
    })
  }

  // Handle Comments On toggle
  const handleCommentsOnChange = (checked) => {
    setCommentsOn(checked)
    if (checked) {
      setCommentsOff(false)
    }
    // Immediately send updated settings to parent
    onSettingsChange({
      isPaid: isPaid,
      commentsAllowed: checked,
      price: isPaid ? parseFloat(price) || undefined : undefined
    })
  }

  // Handle Comments Off toggle
  const handleCommentsOffChange = (checked) => {
    setCommentsOff(checked)
    if (checked) {
      setCommentsOn(false)
    }
    // Immediately send updated settings to parent
    onSettingsChange({
      isPaid: isPaid,
      commentsAllowed: !checked,
      price: isPaid ? parseFloat(price) || undefined : undefined
    })
  }

  return (
    <Card className="w-full border-2 border-black dark:border-white">
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
                onChange={handlePriceChange}
                className="w-full mt-1 px-2 py-1 text-[11px] border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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