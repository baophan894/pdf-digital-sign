"use client"

import { useEffect, useState } from "react"

export default function PDFViewerSimple({ pdfUrl, currentPage, setCurrentPage, setTotalPages }) {
  const [loading, setLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    // Đặt tổng số trang là 7 dựa trên file PDF đã biết
    setTotalPages(7)
    setLoading(false)

    // Thêm sự kiện lắng nghe thông báo từ iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === "pdf-total-pages") {
        setTotalPages(event.data.totalPages)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [setTotalPages])

  // Force reload iframe khi pdfUrl thay đổi
  useEffect(() => {
    setIframeKey((prev) => prev + 1)
    setLoading(true)

    // Thêm một chút delay để đảm bảo iframe được reload
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pdfUrl])

  return (
    <div className="flex justify-center">
      {loading && (
        <div className="flex items-center justify-center h-[500px] w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      <iframe
        key={iframeKey}
        src={`${pdfUrl}#page=${currentPage}`}
        width="100%"
        height="800px"
        style={{ border: "none", display: loading ? "none" : "block" }}
        title="PDF Viewer"
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}

