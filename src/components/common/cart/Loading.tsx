import React from 'react'
import PencilLoader from '../PencilLoader'

const Loading = () => {
  return (
    <div className='flex justify-center items-center'>
      <div role="status" className="scale-50">
        <PencilLoader />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default Loading
