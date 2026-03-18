import React from 'react'
import { motion, useScroll, useTransform } from "motion/react"

const Hero = () => {
  const { scrollYProgress } = useScroll()
  const scale = useTransform(scrollYProgress, [0, 1], [1,1.5])

  return (
    <div className='w-full min-h-screen relative '>
      <motion.p
        className='text-7xl font-light text-center text-black fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        style={{ scale }}
      >
        Complete <br />
        creative <br />
        control
      </motion.p>
    </div>
  )
}

export default Hero