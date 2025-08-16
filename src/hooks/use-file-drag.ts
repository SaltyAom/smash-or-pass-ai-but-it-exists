import { useEffect, useState } from 'react'

export const useFileDrag = () => {
    const [isDragging, setDragging] = useState(false)

    useEffect(() => {
        const dragOver = () => {
            setDragging(true)
        }
        const dragLeave = () => {
            setDragging(false)
        }

        document.addEventListener('dragover', dragOver)
        document.addEventListener('dragleave', dragLeave)
        document.addEventListener('drop', dragLeave)

        return () => {
            document.removeEventListener('dragenter', dragOver)
            document.removeEventListener('dragleave', dragLeave)
            document.removeEventListener('drop', dragLeave)
        }
    }, [setDragging])

    return isDragging
}
