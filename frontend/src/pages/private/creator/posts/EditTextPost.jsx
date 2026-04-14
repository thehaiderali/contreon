import Editor from '@/src/components/creator/posts/Editor'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PostSettings } from './PostSettings'
import PostCreatedModal from './PostCreated'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const EditTextPost = () => {
  const navigate = useNavigate()
  const { postId } = useParams()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [postSettings, setPostSettings] = useState({
    isPaid: false,
    commentsAllowed: true,
    tierId: undefined
  })

  const [editorContent, setEditorContent] = useState([])
  const [title, setTitle] = useState('')
  const [creatorTiers, setCreatorTiers] = useState([])
  const [isLoadingTiers, setIsLoadingTiers] = useState(false)

  // ✅ Safe parser (FIXED)
  const parsePostContent = (content) => {
    if (!content) return []

    if (typeof content === "object") return content

    try {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.error("Parse error:", e)
      return []
    }
  }

  // ✅ Fetch tiers
  useEffect(() => {
    const fetchCreatorTiers = async () => {
      setIsLoadingTiers(true)
      try {
        const res = await api.get("/creators/memberships/me")

        if (res?.data?.data?.memberShips) {
          const tiers = res.data.data.memberShips.map(m => ({
            _id: m._id,
            tierName: m.tierName,
            price: m.price,
            perks: m.perks,
            description: m.description,
            isActive: m.isActive
          }))
          setCreatorTiers(tiers)
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load membership tiers")
      } finally {
        setIsLoadingTiers(false)
      }
    }

    fetchCreatorTiers()
  }, [])

  // ✅ Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return

      setIsLoading(true)

      try {
        const res = await api.get(`/creators/posts/${postId}`)
        console.log("API RESPONSE:", res)

        const post = res?.data?.data

        if (!post) {
          throw new Error("Invalid post data")
        }

        setTitle(post.title || "")
        setEditorContent(parsePostContent(post.content))

        setPostSettings({
          isPaid: post.isPaid || false,
          commentsAllowed: post.commentsAllowed !== false,
          tierId: post.tierId || undefined
        })

      } catch (err) {
        console.error(err)
        toast.error("Failed to load post")
        navigate('/creator/library')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId, navigate])

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleSubmit = async (settingsFromChild = null) => {
    const settings = settingsFromChild || postSettings

    if (!title.trim()) {
      return toast.error('Enter title')
    }

    if (!editorContent.length) {
      return toast.error('Add content')
    }

    if (settings.isPaid && !settings.tierId) {
      return toast.error('Select tier')
    }

    setIsSubmitting(true)

    try {
      const res = await api.put(`/creators/posts/${postId}`, {
        title: title.trim(),
        type: "text",
        slug: generateSlug(title),
        content: JSON.stringify(editorContent),
        isPaid: settings.isPaid,
        tierId: settings.isPaid ? settings.tierId : undefined,
        commentsAllowed: settings.commentsAllowed,
        isPublished: true
      })

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Update failed")
      }

      toast.success("Post updated!")
      setShowSuccessModal(true)

    } catch (err) {
      console.error(err)
      toast.error(err.message || "Update failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/creator/library')
  }

  // ✅ Loading UI
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div className='text-center'>
          <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3'></div>
          <p>Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <h1 className='text-2xl text-center mb-6'>Edit Text Post</h1>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        className="w-full mb-6 px-4 py-2 border rounded-lg"
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        
        {/* ✅ FIX: force editor refresh */}
        <div className='lg:col-span-2'>
          <Editor
            key={postId} 
            editable
            initialContent={editorContent}
            onChange={setEditorContent}
          />
        </div>

        <div>
          <PostSettings
            onSettingsChange={setPostSettings}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialSettings={postSettings}
            creatorTiers={creatorTiers}
            isLoadingTiers={isLoadingTiers}
            isEditMode
          />
        </div>
      </div>

      {showSuccessModal && (
        <PostCreatedModal
          title={`"${title}" Updated`}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default EditTextPost