// CreateTextPost.jsx
import Editor from '@/src/components/creator/posts/Editor'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom' // Change this line
import { PostSettings } from './PostSettings'
import PostCreatedModal from './PostCreated'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const CreateTextPost = () => {
  const navigate = useNavigate() // Add this
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [postSettings, setPostSettings] = useState({
    isPaid: false,
    commentsAllowed: true,
    price: undefined
  })
  const [editorContent, setEditorContent] = useState(null)
  const [title, setTitle] = useState('')

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
        console.log("Error : ",response.data)
      }
      toast("Redirecting to Library")
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      window.location.href = 'http://localhost:5173/creator/library';
      
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error(error.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/creator/library') // This will now work
  }

  const handleSettingsChange = (settings) => {
    setPostSettings(settings)
  }

  const handleEditorChange = (content) => {
    setEditorContent(content)
  }

  return (
    <div className='w-full h-screen overflow-scroll'>
      <div className='container mx-auto px-4 py-6'>
        <h1 className='text-2xl text-center mb-6'>
          Create Text Post
        </h1>
        
        {/* Title Input */}
        <div className='mb-4'>
          <input
            type="text"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        <div className='flex flex-col lg:flex-row gap-5'>
          <div className='flex-3/4'>
            <Editor 
              editable={true} 
              initialContent=""
              onChange={handleEditorChange}
            />
          </div>
          <div className='flex-1/4'>
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