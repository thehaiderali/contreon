// CreateTextPost.jsx
import Editor from '@/src/components/creator/posts/Editor'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { PostSettings } from './PostSettings'
import PostCreatedModal from './PostCreated'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const CreateTextPost = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [postSettings, setPostSettings] = useState({
    isPaid: false,
    commentsAllowed: true,
    price: undefined
  })
  const [editorContent, setEditorContent] = useState(null)
  const [title, setTitle] = useState('')
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      isMountedRef.current = false
    }
  }, [])

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (postSettings.isPaid && (!postSettings.price || postSettings.price <= 0)) {
      toast.error('Please enter a valid price for paid content')
      return
    }

    setIsSubmitting(true)

    try {
      const slug = generateSlug(title)
      
      const postData = {
        title: title.trim(),
        type: "text",
        slug: slug,
        content: JSON.stringify(editorContent || []),
        isPaid: postSettings.isPaid,
        price: postSettings.isPaid ? postSettings.price : undefined,
        commentsAllowed: postSettings.commentsAllowed,
        isPublished: true
      }

      console.log("Submitting post data:", postData)
      
      const response = await api.post("/creators/posts", postData)
      if (!response.data.success) {
        console.log("Error : ", response.data)
        throw new Error(response.data.message || 'Failed to create post')
      }
        toast("Post Created Successfully. Navigating to Library")
      await new Promise((resolve,reject)=>setTimeout(resolve,3000))
       navigate("/creator/library") 
        setIsSubmitting(false)
      
    } catch (error) {
      console.error("Error creating post:", error)
      // Only show error if component is still mounted
      if (isMountedRef.current) {
        toast.error(error.message || 'Failed to create post. Please try again.')
        setIsSubmitting(false)
      }
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/creator/library')
  }

  const handleSettingsChange = (settings) => {
    // Only update if component is mounted
    if (isMountedRef.current) {
      setPostSettings(settings)
    }
  }

  const handleEditorChange = (content) => {
    // Only update if component is mounted
    if (isMountedRef.current) {
      setEditorContent(content)
    }
  }

  return (
    <div className='w-full'>
      <div className='container mx-auto px-4 py-6'>
        <h1 className='text-2xl text-center mb-6'>
          Create Text Post
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
              initialContent=""
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
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <PostCreatedModal 
          title={`"${title}" Created Successfully!`}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default CreateTextPost