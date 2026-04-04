// Updated Editor component to support onChange prop
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import { uploadFiles } from '@/lib/uploadthing'
import React, { useState, useEffect } from 'react'
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

const Editor = ({ editable = true, initialContent = "", onChange }) => {
    const [blocks, setBlocks] = useState([]);
    
    const editor = useCreateBlockNote({
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
        uploadFile: async (file) => {
            const response = await uploadFiles("imageUploader", {
                files: [file],
            });
            console.log("Upload thing Response : ", response)
            return response[0].ufsUrl
        }
    })

    useEffect(() => {
        if (onChange) {
            onChange(blocks)
        }
    }, [blocks, onChange])

    return (
        <div className='w-full h-full flex gap-5'>
            <div className='w-full h-full rounded-md'>
                <BlockNoteView  
                    editor={editor}
                    editable={editable}
                    onChange={() => {
                        setBlocks(editor.document)
                    }}
                />
            </div>
        </div>
    )
}

export default Editor