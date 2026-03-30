import React, { useEffect, useState } from 'react'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { motion } from 'motion/react'
import { Link } from 'react-router'

const ProfileCreationSuccess = () => {
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden '>
      {/* Confetti Effect */}
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={true}
          numberOfPieces={150}
          gravity={0.2}
          colors={['#10b981', '#34d399', '#6ee7b7', '#059669']}
        />
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="text-center z-10"
      >
        {/* Success Message */}
        <motion.h1 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Congratulations! 🎉
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-gray-600 dark:text-gray-300 mb-8"
        >
          Your profile has been successfully created!
        </motion.p>

        {/* Link Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            to="/creator/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            Create your First Post
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ProfileCreationSuccess