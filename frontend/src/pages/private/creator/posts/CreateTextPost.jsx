// CreateTextPost.jsx
import Editor from '@/src/components/creator/posts/Editor'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { PostSettings } from './PostSettings'
import PostCreatedModal from './PostCreated'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { UploadButton } from '@/lib/uploadthing'

const CreateTextPost = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [creatorTiers, setCreatorTiers] = useState([])
  const [isLoadingTiers, setIsLoadingTiers] = useState(false)
  const [title, setTitle] = useState('')
  const [editorContent, setEditorContent] = useState(null)
  const [isPaid, setIsPaid] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState('')
  const [commentsAllowed, setCommentsAllowed] = useState(true)
  const [thumbnailUrl,setThumbnailUrl]=useState("")
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])


  // Update fetchCreatorTiers function
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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }


  //Update handleSubmit function
  const handleSubmit = async () => {
    
    
    setIsSubmitting(true);
    
    try {
      const formData = {
        title: title.trim(),
        type: "text",
        slug: generateSlug(title),
        content: editorContent,
        isPaid: isPaid,
        tierId: isPaid ? selectedTierId : undefined,
        commentsAllowed: commentsAllowed,
        isPublished: true,
        thumbnailUrl:thumbnailUrl
      }
      
      const response = await api.post('/creators/posts', formData);
      
      if (response.data.success) {
        const newPost = response.data.data;
        
        if (location.state?.collectionId) {
          try {
            await api.post(`/collections/${location.state.collectionId}/posts/${newPost._id}`);
            toast.success('Post created and added to collection');
          } catch (err) {
            toast.success('Post created but collection add failed');
          }
        } else {
          toast.success('Post created successfully');
        }
        
        setShowSuccessModal(true)
        
        setTimeout(() => {
          if (location.state?.returnTo) {
            navigate(location.state.returnTo);
          } else {
            setShowSuccessModal(false)
            navigate('/creator/library');
          }
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/creator/library')
  }

  const handleSettingsChange = (settings) => {
    if (isMountedRef.current) {
      console.log('Received in parent:', settings)
      setIsPaid(settings.isPaid)
      setSelectedTierId(settings.tierId)
      setCommentsAllowed(settings.commentsAllowed)
    }
  }

  const handleEditorChange = (content) => {
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
        <div className='mb-3'>
          <label className='block text-sm font-medium mb-2'>Post Thumbnail</label>
          {thumbnailUrl && (
            <div className='w-full h-full'>
              <img src={thumbnailUrl} alt="" srcset="" className='w-1/2 h-1/2' />
            </div>
          )}
          <UploadButton endpoint={"imageUploader"} onClientUploadComplete={(res)=>setThumbnailUrl(res[0].ufsUrl)}/>
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
              initialSettings={{ isPaid, commentsAllowed, tierId: selectedTierId }}
              creatorTiers={creatorTiers}
              isLoadingTiers={isLoadingTiers}
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