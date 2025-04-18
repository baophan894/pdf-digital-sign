"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ZoomIn, ZoomOut, Maximize, Timer } from "lucide-react"

export default function EnhancedPDFViewer({
  pdfUrl,
  currentPage = 1,
  setCurrentPage,
  setTotalPages,
  countdownTime = 0, // Optional countdown time in seconds
}) {
  const [loading, setLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [countdown, setCountdown] = useState(countdownTime)
  const iframeRef = useRef(null)
  const [totalPagesValue, setTotalPagesValue] = useState(1)

  // Set total pages based on the PDF
  useEffect(() => {
    // In a real implementation, you would use pdf.js to get the actual page count
    // For now, we'll set a default value of 8 to match the screenshot
    const pages = 8
    setTotalPagesValue(pages)
    if (setTotalPages) {
      setTotalPages(pages)
    }
    setLoading(false)
  }, [setTotalPages])

  // Handle countdown timer if provided
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Format countdown time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Force reload iframe when pdfUrl changes
  useEffect(() => {
    if (!pdfUrl) {
      setError("Không thể tải tài liệu PDF")
      setLoading(false)
      return
    }

    setIframeKey((prev) => prev + 1)
    setLoading(true)
    setError(null)

    // Add a delay to ensure iframe is reloaded
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [pdfUrl])

  // Navigation functions
  const goToFirstPage = () => {
    if (setCurrentPage) setCurrentPage(1)
  }

  const goToPreviousPage = () => {
    if (setCurrentPage && currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const goToNextPage = () => {
    if (setCurrentPage && currentPage < totalPagesValue) setCurrentPage(currentPage + 1)
  }

  const goToLastPage = () => {
    if (setCurrentPage) setCurrentPage(totalPagesValue)
  }

  // Zoom functions
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  const resetZoom = () => {
    setZoom(100)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] w-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
     
      <div className="relative border border-t-0 rounded-b-md overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          key={iframeKey}
          src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
          width="100%"
          height="800px"
          style={{
            border: "none",
            display: loading ? "none" : "block",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
          title="PDF Viewer"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError("Không thể tải tài liệu PDF")
            setLoading(false)
          }}
        />
      </div>
    </div>
  )
}
