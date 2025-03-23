"use client"

import { useEffect, useState } from "react"

export default function PDFViewerSimple({ pdfUrl, currentPage, setCurrentPage, setTotalPages }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Giả định rằng PDF có 10 trang (không thể xác định chính xác số trang với iframe)
    setTotalPages(10)
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

  return (
    <div className="flex justify-center">
      {loading && (
        <div className="flex items-center justify-center h-[500px] w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      <iframe
        src={`${pdfUrl}#page=${currentPage}`}
        width="100%"
        height="800px"
        style={{ border: "none" }}
        title="PDF Viewer"
      />
    </div>
  )
}

