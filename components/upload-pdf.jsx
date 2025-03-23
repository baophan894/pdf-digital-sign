"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileIcon, UploadIcon } from "lucide-react"

export default function UploadPDF({ onFileChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    setError("")

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        onFileChange(file)
      } else {
        setError("Vui lòng tải lên file PDF")
      }
    }
  }

  const handleFileChange = (e) => {
    setError("")
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        onFileChange(file)
      } else {
        setError("Vui lòng tải lên file PDF")
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center ${
        isDragging ? "border-primary bg-primary/5" : error ? "border-red-500" : "border-muted-foreground/25"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`rounded-full p-4 ${error ? "bg-red-100" : "bg-primary/10"}`}>
          <FileIcon className={`h-8 w-8 ${error ? "text-red-500" : "text-primary"}`} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Tải lên tài liệu PDF</h3>
          <p className="text-sm text-muted-foreground">Kéo và thả file PDF vào đây, hoặc nhấp để chọn file</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <Button onClick={handleButtonClick} variant="outline" className="mt-2">
          <UploadIcon className="mr-2 h-4 w-4" />
          Chọn PDF
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
      </div>
    </div>
  )
}

