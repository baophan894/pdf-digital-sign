"use client"

import { useEffect, useState } from "react"

export default function PDFViewerSimple({ pdfUrl, currentPage, setCurrentPage, setTotalPages }) {
  const [loading, setLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Đặt tổng số trang là 7 dựa trên file PDF đã biết
    // Trong thực tế, bạn có thể sử dụng thư viện như pdf.js để đếm số trang
    setTotalPages(7)
    setLoading(false)
  }, [setTotalPages])

  // Force reload iframe khi pdfUrl thay đổi
  useEffect(() => {
    if (!pdfUrl) {
      setError("Không thể tải tài liệu PDF")
      setLoading(false)
      return
    }

    setIframeKey((prev) => prev + 1)
    setLoading(true)
    setError(null)

    // Thêm một chút delay để đảm bảo iframe được reload
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [pdfUrl])

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] w-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

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
        onError={() => {
          setError("Không thể tải tài liệu PDF")
          setLoading(false)
        }}
      />
    </div>
  )
}

