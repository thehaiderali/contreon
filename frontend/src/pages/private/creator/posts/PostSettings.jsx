import React, { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const PostSettings = ({ 
  onSettingsChange, 
  onSubmit, 
  isSubmitting, 
  isLoadingTiers = false,
  initialSettings = {}, 
  creatorTiers = [] 
}) => {
  // Single source of truth for visibility
  const [visibility, setVisibility] = useState(initialSettings.isPaid ? 'paid' : 'public')
  
  // Single source of truth for comments
  const [commentsAllowed, setCommentsAllowed] = useState(
    initialSettings.commentsAllowed !== false
  )
  
  // Tier selection
  const [selectedTierId, setSelectedTierId] = useState(initialSettings.tierId || "")
  
  // Track if tier selection is required but not done
  const [tierError, setTierError] = useState(false)

  // Determine visibility states from single visibility state
  const isPublic = visibility === 'public'
  const isPaid = visibility === 'paid'

  // Update parent whenever settings change
  useEffect(() => {
    onSettingsChange({
      isPaid: isPaid,
      tierId: isPaid ? selectedTierId : undefined,
      commentsAllowed: commentsAllowed,
    })
  }, [isPaid, selectedTierId, commentsAllowed, onSettingsChange])

  // Handle visibility toggle
  const handleVisibilityChange = (newVisibility) => {
    setVisibility(newVisibility)
    setTierError(false) // Reset error when changing visibility
    
    // Reset tier if switching to public
    if (newVisibility === 'public') {
      setSelectedTierId("")
    }
  }

  // Handle tier selection
  const handleTierChange = (tierId) => {
    setSelectedTierId(tierId)
    setTierError(false) // Clear error when tier is selected
  }

  // Handle comments toggle
  const handleCommentsChange = (checked) => {
    setCommentsAllowed(checked)
  }

  // Validate and submit
  // PostSettings.jsx - Update handleSubmitClick (already correct, but ensure this)
const handleSubmitClick = () => {
  // Validate tier selection if paid
  if (isPaid && !selectedTierId) {
    setTierError(true)
    return
  }
  
  // Pass current settings to parent
  onSubmit({
    isPaid: isPaid,
    tierId: isPaid ? selectedTierId : undefined,
    commentsAllowed: commentsAllowed,
  })
}

  // Filter only active tiers
  const activeTiers = creatorTiers.filter(tier => tier.isActive !== false)

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
            Choose who can access this post
          </p>
          
          {/* Public Option */}
          <div className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
               onClick={() => handleVisibilityChange('public')}>
            <div className="space-y-0.5">
              <Label className="text-[11px] cursor-pointer">
                Public
              </Label>
              <p className="text-[9px] text-muted-foreground">
                Free access for everyone
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={() => handleVisibilityChange('public')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Paid Option */}
          <div className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
               onClick={() => handleVisibilityChange('paid')}>
            <div className="space-y-0.5">
              <Label className="text-[11px] cursor-pointer">
                Paid
              </Label>
              <p className="text-[9px] text-muted-foreground">
                Restricted to subscribers
              </p>
            </div>
            <Switch
              checked={isPaid}
              onCheckedChange={() => handleVisibilityChange('paid')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Tier selector for paid posts */}
          {isPaid && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label htmlFor="tier-select" className="text-[11px] font-medium">
                Select Membership Tier *
              </Label>
              <Select 
                onValueChange={handleTierChange} 
                value={selectedTierId}
                disabled={isLoadingTiers}
              >
                <SelectTrigger className="w-full mt-1 text-[11px]">
                  <SelectValue 
                    placeholder={isLoadingTiers ? "Loading tiers..." : "Choose a membership tier for this post"} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTiers ? (
                    <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                      Loading tiers...
                    </div>
                  ) : activeTiers.length === 0 ? (
                    <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                      No active tiers available. Create a membership tier first.
                    </div>
                  ) : (
                    activeTiers.map((tier) => (
                      <SelectItem key={tier._id} value={tier._id} className="text-[11px]">
                        <div className="flex  justify-center gap-2">
                          <span className="font-bold">{tier.tierName}</span>
                          <span className="text-md text-muted-foreground">
                            ${tier.price}/month
                          </span>
                          {tier.description && (
                            <span className="text-md text-muted-foreground ">
                              {tier.description.length > 50 
                                ? `${tier.description.substring(0, 50)}...` 
                                : tier.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {tierError && (
                <p className="text-[9px] text-red-600 dark:text-red-400 mt-1 font-medium">
                  ⚠️ You must select a membership tier for paid posts
                </p>
              )}
              
              <p className="text-[9px] text-muted-foreground mt-2">
                Only subscribers of this tier can access this post
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Section: Comments Settings */}
        <div className="space-y-2">
          <Label className="text-[11px] font-medium">Comments Settings</Label>
          <p className="text-[10px] text-muted-foreground -mt-1 mb-1">
            Allow users to comment on this post
          </p>
          
          <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-[11px]">
                {commentsAllowed ? 'Comments Enabled' : 'Comments Disabled'}
              </Label>
              <p className="text-[9px] text-muted-foreground">
                {commentsAllowed 
                  ? 'Users can leave comments' 
                  : 'Comments are disabled'}
              </p>
            </div>
            <Switch
              checked={commentsAllowed}
              onCheckedChange={handleCommentsChange}
            />
          </div>
        </div>

        {/* Create Post Button */}
        <Button 
          onClick={handleSubmitClick}
          className="w-full mt-4 text-[11px] bg-blue-600 hover:bg-blue-700"
          size="sm"
          disabled={isSubmitting || isLoadingTiers || (isPaid && !selectedTierId)}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            'Create Post'
          )}
        </Button>

        {/* Helper text */}
        <p className="text-[9px] text-muted-foreground text-center">
          {isSubmitting ? 'Your post is being created...' : 'Review settings and click Create Post'}
        </p>
      </CardContent>
    </Card>
  )
}