import React, { useState, useRef, useEffect } from 'react'
import { Video, Mic, FileText } from 'lucide-react'
import { Link } from 'react-router'

const CreateMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  const menuItems = [
    {
      id: 'video',
      label: 'Video',
      icon: Video,
      to: '/creator/create-post/video',
      description: 'Create video content',
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: Mic,
      to: '/creator/create-post/audio',
      description: 'Create audio content',
    },
    {
      id: 'text',
      label: 'Text',
      icon: FileText,
      to: '/creator/create-post/text',
      description: 'Create text content',
    },
  ]

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu when item is clicked
  const handleItemClick = () => {
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      {/* Trigger Button - shadcn styled */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
      >
        Create
      </button>

      {/* Dropdown Menu - shadcn styled */}
      {isOpen && (
        <div
          ref={menuRef}
          className="z-50 min-w-[240px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 absolute top-full left-0 right-0 mt-2"
        >
          <div className="p-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={handleItemClick}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-3"
                >
                  <IconComponent className="h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {/* Footer Section */}
          <div className="border-t border-border p-2">
            <p className="text-xs text-muted-foreground px-2 py-1.5">
              Choose a format to get started
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateMenu