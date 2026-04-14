// Updated Editor component to support onChange prop
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import { uploadFiles } from '@/lib/uploadthing'
import React, { useEffect, useRef } from 'react'
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

const Editor = ({ editable = true, initialContent = "", onChange }) => {
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

    // Use ref to track if it's the initial load
    const isInitialMount = useRef(true);

    // Only notify parent of changes, don't store blocks in state
    const handleChange = () => {
        const currentContent = editor.document;
        if (onChange) {
            onChange(currentContent);
        }
    }

    // Handle initial content if needed
    useEffect(() => {
        if (isInitialMount.current && initialContent && editor) {
            try {
                const parsed = JSON.parse(initialContent);
                if (parsed && parsed.length > 0) {
                    // Optional: replace content if needed
                    // editor.replaceBlocks(editor.document, parsed);
                }
            } catch (e) {
                console.error("Error parsing initial content", e);
            }
            isInitialMount.current = false;
        }
    }, [initialContent, editor]);

    return (
        <div className='w-full h-full flex gap-5'>
            <div className='w-full h-full rounded-md'>
                <BlockNoteView  
                    editor={editor}
                    editable={editable}
                    onChange={handleChange}  // ✅ Direct callback, no state
                />
            </div>
        </div>
    )
}

export default Editor