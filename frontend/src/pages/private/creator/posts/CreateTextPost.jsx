// import Editor from '@/src/components/creator/posts/Editor'
// import React, { useEffect, useState, useRef } from 'react'
// import { useNavigate } from 'react-router'
// import { PostSettings } from './PostSettings'
// import PostCreatedModal from './PostCreated'
// import { toast } from 'sonner'
// import { api } from '@/lib/api'

// const CreateTextPost = () => {
//   const navigate = useNavigate()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [showSuccessModal, setShowSuccessModal] = useState(false)
//   const [postSettings, setPostSettings] = useState({
//     isPaid: false,
//     commentsAllowed: true,
//     tierId: undefined
//   })
//   const [editorContent, setEditorContent] = useState(null)
//   const [title, setTitle] = useState('')
//   const [creatorTiers,setCreatorTiers]=useState([])
  
//   // Use ref to track if component is mounted
//   const isMountedRef = useRef(true)

//   useEffect(() => {
//     return () => {
//       // Cleanup on unmount
//       isMountedRef.current = false
//     }
//   }, [])
// // CreateTextPost.jsx - Add loading state
// const [isLoadingTiers, setIsLoadingTiers] = useState(false)

// // Update fetchCreatorTiers function
// useEffect(() => {
//   const fetchCreatorTiers = async () => {
//     setIsLoadingTiers(true)
//     try {
//       const response = await api.get("/creators/memberships/me")
//       console.log("Response:", response)
      
//       if (response.data.success) {
//         const tiers = response.data.data.memberShips.map(membership => ({
//           _id: membership._id,
//           tierName: membership.tierName,
//           price: membership.price,
//           perks: membership.perks,
//           description: membership.description,
//           isActive: membership.isActive
//         }))
//         setCreatorTiers(tiers)
//       }
//     } catch (error) {
//       console.error("Error fetching tiers:", error)
//       toast.error("Failed to load membership tiers")
//     } finally {
//       setIsLoadingTiers(false)
//     }
//   }

//   fetchCreatorTiers()
// }, [])

//   const generateSlug = (title) => {
//     return title
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-+|-+$/g, '')
//   }

// // CreateTextPost.jsx - Update handleSubmit function
// const handleSubmit = async (settingsFromChild = null) => {
//   // Use settings from child if provided, otherwise use state
//   const currentSettings = settingsFromChild || postSettings;
  
//   if (!title.trim()) {
//     toast.error('Please enter a title')
//     return
//   }

//   // REMOVE THIS - You don't have a price field in your settings
//   // if (currentSettings.isPaid && (!currentSettings.price || currentSettings.price <= 0)) {
//   //   toast.error('Please enter a valid price for paid content')
//   //   return
//   // }

//   // Validate tier selection for paid posts
//   if (currentSettings.isPaid && !currentSettings.tierId) {
//     toast.error('Please select a membership tier for paid content')
//     return
//   }

//   setIsSubmitting(true)

//   try {
//     const slug = generateSlug(title)
    
//     const postData = {
//       title: title.trim(),
//       type: "text",
//       slug: slug,
//       content: JSON.stringify(editorContent),
//       isPaid: currentSettings.isPaid,
//       tierId: currentSettings.isPaid ? currentSettings.tierId : undefined,
//       commentsAllowed: currentSettings.commentsAllowed,
//       isPublished: true
//     }
    
//     console.log("Submitting post data:", postData)
    
//     const response = await api.post("/creators/posts", postData)
    
//     if (!response.data.success) {
//       throw new Error(response.data.message || 'Failed to create post')
//     }
    
//     toast.success("Post Created Successfully! Navigate to Library to Check")
//     setShowSuccessModal(true) // You had this commented, uncomment it
    
//   } catch (error) {
//     console.error("Error creating post:", error)
//     if (isMountedRef.current) {
//       toast.error(error.message || 'Failed to create post. Please try again.')
//     }
//   } finally {
//     if (isMountedRef.current) {
//       setIsSubmitting(false)
//     }
//   }
// }
//   const handleCloseModal = () => {
//     setShowSuccessModal(false)
//     navigate('/creator/library')
//   }

//   const handleSettingsChange = (settings) => {
//     // Only update if component is mounted
//      console.log('Received in parent:', settings) // Debug
//     if (isMountedRef.current) {
//       setPostSettings(settings)
//     }
//   }

//   const handleEditorChange = (content) => {
//       console.log("Editor Change :",content)
//       setEditorContent(content)
//   }

//   return (
//     <div className='w-full'>
//       <div className='container mx-auto px-4 py-6'>
//         <h1 className='text-2xl text-center mb-6'>
//           Create Text Post
//         </h1>
        
//         {/* Title Input */}
//         <div className='mb-6'>
//           <label className='block text-sm font-medium mb-2'>Post Title</label>
//           <input
//             type="text"
//             placeholder="Enter post title..."
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-4 py-2 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
//             required
//           />
//         </div>

//         {/* Main Content Layout */}
//         <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
//           {/* Editor - Takes 2/3 on desktop, full width on mobile */}
//           <div className='lg:col-span-2'>
//             <Editor 
//               editable={true} 
//               initialContent=""
//               onChange={handleEditorChange}
//             />
//           </div>
          
//           {/* Settings - Takes 1/3 on desktop, full width on mobile */}
//           <div className='lg:col-span-1'>
//             <PostSettings 
//               onSettingsChange={handleSettingsChange}
//               onSubmit={handleSubmit}
//               isSubmitting={isSubmitting}
//               initialSettings={postSettings}
//               creatorTiers={creatorTiers}
//               isLoadingTiers={isLoadingTiers}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <PostCreatedModal 
//           title={`"${title}" Created Successfully!`}
//           onClose={handleCloseModal}
//         />
//       )}
//     </div>
//   )
// }

// export default CreateTextPost

// CreateTextPost.jsx - Fix the initialContent prop
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
    tierId: undefined
  })
  const [editorContent, setEditorContent] = useState(null)
  const [title, setTitle] = useState('')
  const [creatorTiers,setCreatorTiers]=useState([])
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      isMountedRef.current = false
    }
  }, [])
  
// CreateTextPost.jsx - Add loading state
const [isLoadingTiers, setIsLoadingTiers] = useState(false)

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

// CreateTextPost.jsx - Update handleSubmit function
const handleSubmit = async (settingsFromChild = null) => {
  // Use settings from child if provided, otherwise use state
  const currentSettings = settingsFromChild || postSettings;
  
  if (!title.trim()) {
    toast.error('Please enter a title')
    return
  }

  // Validate editor content
  if (!editorContent || !Array.isArray(editorContent) || editorContent.length === 0) {
    toast.error('Please add content to your post')
    return
  }

  // Validate tier selection for paid posts
  if (currentSettings.isPaid && !currentSettings.tierId) {
    toast.error('Please select a membership tier for paid content')
    return
  }

  setIsSubmitting(true)

  try {
    const slug = generateSlug(title)
    
    const postData = {
      title: title.trim(),
      type: "text",
      slug: slug,
      content: JSON.stringify(editorContent),
      isPaid: currentSettings.isPaid,
      tierId: currentSettings.isPaid ? currentSettings.tierId : undefined,
      commentsAllowed: currentSettings.commentsAllowed,
      isPublished: true
    }
    
    console.log("Submitting post data:", postData)
    
    const response = await api.post("/creators/posts", postData)
    
    if (!response.data.success) {
      console.log("Error in Create Post  : ",response.data.error)
      throw new Error(response.data.message || 'Failed to create post')
    }
    
    toast.success("Post Created Successfully! Navigate to Library to Check")
    setShowSuccessModal(true)
    
  } catch (error) {
    console.error("Error creating post:", error)
    if (isMountedRef.current) {
      toast.error(error.message || 'Failed to create post. Please try again.')
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
    // Only update if component is mounted
     console.log('Received in parent:', settings) // Debug
    if (isMountedRef.current) {
      setPostSettings(settings)
    }
  }

  const handleEditorChange = (content) => {
      console.log("Editor Change :", content)
        setEditorContent(content)
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
              initialContent={[]}  // ✅ FIX: Pass empty array instead of empty string
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