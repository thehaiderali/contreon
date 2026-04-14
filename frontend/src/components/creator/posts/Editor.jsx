import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import { uploadFiles } from '@/lib/uploadthing'
import React, { useEffect, useRef } from 'react'
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

const Editor = ({ editable = true, initialContent = [], onChange }) => {
    // Clean initial content: remove empty paragraph blocks at the end
    const cleanInitialContent = (content) => {
        if (!Array.isArray(content) || content.length === 0) {
            return undefined; // Let BlockNote use default
        }
        
        // Filter out trailing empty paragraphs
        let cleaned = [...content];
        while (cleaned.length > 0) {
            const lastBlock = cleaned[cleaned.length - 1];
            // Check if it's an empty paragraph
            if (lastBlock.type === 'paragraph' && 
                (!lastBlock.content || lastBlock.content.length === 0)) {
                cleaned.pop();
            } else {
                break;
            }
        }
        
        // If nothing left, return undefined to use BlockNote default
        return cleaned.length > 0 ? cleaned : undefined;
    };

    const editor = useCreateBlockNote({
        initialContent: cleanInitialContent(initialContent),
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
        if (onChange && currentContent) {
            onChange(currentContent);
        }
    }

    // Handle initial content if needed
    useEffect(() => {
        if (isInitialMount.current && initialContent && editor) {
            isInitialMount.current = false;
        }
    }, [initialContent, editor]);

    return (
        <div className='w-full h-full flex gap-5'>
            <div className='w-full h-full rounded-md'>
                <BlockNoteView  
                    editor={editor}
                    editable={editable}
                    onChange={handleChange}
                />
            </div>
        </div>
    )
}

export default Editor