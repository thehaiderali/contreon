// PostCreated.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom' // Change from 'react-router' to 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from 'lucide-react'

export const PostCreatedModal = ({ 
  title = "Post Created Successfully!",
  onClose 
}) => {
  const navigate = useNavigate()

  const handleNavigate = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/creator/library')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="w-full max-w-md border-2 border-green-500 dark:border-green-400">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-400" />
          </div>
          <CardTitle className="text-center text-lg font-bold">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Your post has been created and published successfully. View it in your library to see how it looks.
          </p>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            onClick={handleNavigate}
          >
            Go to Library
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default PostCreatedModal