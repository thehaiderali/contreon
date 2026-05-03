import CreateMenu from '@/src/components/creator/dashboard/CreateMenu'
import PostTable from '@/src/components/creator/posts/PostTable'
import React from 'react'

const Library = () => {

  return (
    <div className='w-full min-h-screen flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
        <h1 className='text-xl text-left font-semibold'>Library</h1>
        <div className='mr-30 w-full sm:w-fit'><CreateMenu/></div>
      </div>
      <PostTable/>
    </div>
  )
}

export default Library