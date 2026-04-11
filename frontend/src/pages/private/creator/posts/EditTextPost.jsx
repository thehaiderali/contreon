// EditTextPost.jsx
import Editor from '@/src/components/creator/posts/Editor'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PostSettings } from './PostSettings'
import PostCreatedModal from './PostCreated'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const EditTextPost = () => {
  const navigate = useNavigate()
  const { postId } = useParams() // Get post ID from URL
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [postSettings, setPostSettings] = useState({
    isPaid: false,
    commentsAllowed: true,
    tierId: undefined
  })
  const [editorContent, setEditorContent] = useState(null)
  const [title, setTitle] = useState('')
  const [creatorTiers, setCreatorTiers] = useState([])
  const [originalSlug, setOriginalSlug] = useState('')
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true)
  const [isLoadingTiers, setIsLoadingTiers] = useState(false)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      isMountedRef.current = false
    }
  }, [])

  // Fetch creator tiers
  useEffect(() => {
    const fetchCreatorTiers = async () => {
      setIsLoadingTiers(true)
      try {
        const response = await api.get("/creators/memberships/me")
        console.log("Response:", response)
        
        if (response.data.success) {
          const tiers = response.data.data.memberShips.map(membership => ({
            _id: membership._id,
            tierName: membership.tierName,
            price: membership.price,
            perks: membership.perks,
            description: membership.description,
            isActive: membership.isActive
          }))
          setCreatorTiers(tiers)
        }
      } catch (error) {
        console.error("Error fetching tiers:", error)
        toast.error("Failed to load membership tiers")
      } finally {
        setIsLoadingTiers(false)
      }
    }

    fetchCreatorTiers()
  }, [])

  // Fetch post data for editing
  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return
      
      setIsLoading(true)
      try {
        const response = await api.get(`/creators/posts/${postId}`)
        
        if (response.data.success) {
          const post = response.data.data
          console.log("Post Data : ",post)
          setIsLoading(false)
          // Populate form with existing post data
          setTitle(post.title)
          setOriginalSlug(post.slug)
          
          // Parse content if it's a string
          if (post.content) {
            try {
              const parsedContent = typeof post.content === 'string' 
                ? JSON.parse(post.content) 
                : post.content
              setEditorContent(parsedContent)
            } catch (e) {
              console.error("Error parsing content:", e)
              setEditorContent(post.content)
            }
          }
          
          // Set post settings
          setPostSettings({
            isPaid: post.isPaid || false,
            commentsAllowed: post.commentsAllowed !== false,
            tierId: post.tierId || undefined
          })
        } else {
          toast.error("Failed to load post data")
          navigate('/creator/library')
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        toast.error(error.message || "Failed to load post")
        navigate('/creator/library')
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    fetchPostData()
  }, [postId, navigate])

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (settingsFromChild = null) => {
    // Use settings from child if provided, otherwise use state
    const currentSettings = settingsFromChild || postSettings;
    
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    // Validate tier selection for paid posts
    if (currentSettings.isPaid && !currentSettings.tierId) {
      toast.error('Please select a membership tier for paid content')
      return
    }

    setIsSubmitting(true)

    try {
      const newSlug = generateSlug(title)
      
      const postData = {
        title: title.trim(),
        type: "text",
        slug: newSlug,
        content: JSON.stringify(editorContent),
        isPaid: currentSettings.isPaid,
        tierId: currentSettings.isPaid ? currentSettings.tierId : undefined,
        commentsAllowed: currentSettings.commentsAllowed,
        isPublished: true
      }
      
      console.log("Updating post data:", postData)
      
      const response = await api.put(`/creators/posts/${postId}`, postData)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update post')
      }
      
      toast.success("Post Updated Successfully!")
      setShowSuccessModal(true)
      
    } catch (error) {
      console.error("Error updating post:", error)
      if (isMountedRef.current) {
        toast.error(error.message || 'Failed to update post. Please try again.')
      }
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/creator/library')
  }

  const handleSettingsChange = (settings) => {
    if (isMountedRef.current) {
      setPostSettings(settings)
    }
  }

  const handleEditorChange = (content) => {
    if (isMountedRef.current) {
      setEditorContent(content)
    }
  }

  if (isLoading) {
    return (
      <div className='w-full'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='text-center'>
              <div className='inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4'></div>
              <p className='text-gray-600 dark:text-gray-400'>Loading post data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <div className='container mx-auto px-4 py-6'>
        <h1 className='text-2xl text-center mb-6'>
          Edit Text Post
        </h1>
        
        {/* Title Input */}
        <div className='mb-6'>
          <label className='block text-sm font-medium mb-2'>Post Title</label>
          <input
            type="text"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        {/* Main Content Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Editor - Takes 2/3 on desktop, full width on mobile */}
          <div className='lg:col-span-2'>
            <Editor 
              editable={true} 
              initialContent={editorContent}
              onChange={handleEditorChange}
            />
          </div>
          
          {/* Settings - Takes 1/3 on desktop, full width on mobile */}
          <div className='lg:col-span-1'>
            <PostSettings 
              onSettingsChange={handleSettingsChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialSettings={postSettings}
              creatorTiers={creatorTiers}
              isLoadingTiers={isLoadingTiers}
              isEditMode={true}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <PostCreatedModal 
          title={`"${title}" Updated Successfully!`}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default EditTextPost