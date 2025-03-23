"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SignatureModal from "@/components/signature-modal"
import PDFViewerSimple from "@/components/pdf-viewer"
import UploadPDF from "@/components/upload-pdf"
import { PenLine, Download, ChevronLeft, ChevronRight } from "lucide-react"

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(7) // Mặc định hiển thị trang 7
  const [totalPages, setTotalPages] = useState(7)
  const [signatures, setSignatures] = useState({})
  const [currentSigningArea, setCurrentSigningArea] = useState(null)
  const [signedPdfUrl, setSignedPdfUrl] = useState(null)
  const pdfContainerRef = useRef(null)

  // Vị trí cố định cho chữ ký trên trang 7
  const signaturePositions = {
    benA: { x: 180, y: 243, page: 7 }, // Vị trí cho Đại diện bên A (Phan Quốc Thái Bảo)
    benB: { x: 440, y: 243, page: 7 }, // Vị trí cho Đại diện bên B (Nguyễn Nhật Anh)
  }

  const handleFileChange = (file) => {
    setPdfFile(file)
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    setSignedPdfUrl(null)
    setSignatures({})
    setCurrentPage(7) // Luôn hiển thị trang 7 khi tải PDF
  }

  const handleSignatureClick = (id) => {
    if (!pdfUrl) return

    setCurrentSigningArea(id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentSigningArea(null)
  }

  const handleSignatureComplete = async (signatureDataUrl) => {
    if (currentSigningArea) {
      const newSignatures = {
        ...signatures,
        [currentSigningArea]: signatureDataUrl,
      }

      setSignatures(newSignatures)

      // Tự động tạo PDF đã ký sau khi thêm chữ ký
      try {
        const { PDFDocument } = await import("pdf-lib")

        // Tải PDF gốc
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer())

        // Tạo một bản sao của PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        // Nhúng tất cả chữ ký vào PDF
        for (const [id, sigUrl] of Object.entries(newSignatures)) {
          const position = signaturePositions[id]
          if (!position) continue

          // Lấy trang cần ký
          const pages = pdfDoc.getPages()
          const pageIndex = position.page - 1
          if (pageIndex < 0 || pageIndex >= pages.length) continue

          const page = pages[pageIndex]

          // Chuyển đổi data URL thành Uint8Array
          const signatureImageBytes = await fetch(sigUrl).then((res) => res.arrayBuffer())
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

          // Tính toán kích thước chữ ký
          const width = 150
          const height = 60

          // Vẽ chữ ký lên trang
          page.drawImage(signatureImage, {
            x: position.x - width / 2,
            y: page.getHeight() - position.y - height / 2, // PDF coordinates start from bottom-left
            width,
            height,
          })
        }

        // Lưu PDF đã ký
        const signedPdfBytes = await pdfDoc.save()

        // Tạo URL cho PDF đã ký
        const blob = new Blob([signedPdfBytes], { type: "application/pdf" })
        const signedUrl = URL.createObjectURL(blob)

        // Cập nhật URL của PDF đã ký
        setSignedPdfUrl(signedUrl)
      } catch (error) {
        console.error("Lỗi khi tạo PDF đã ký:", error)
      }
    }
  }

  const handleDownload = () => {
    if (!signedPdfUrl) return

    // Tạo link tải xuống
    const link = document.createElement("a")
    link.href = signedPdfUrl
    link.download = pdfFile ? `${pdfFile.name.replace(".pdf", "")}-da-ky.pdf` : "hop-dong-bao-hiem-da-ky.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Công cụ ký điện tử PDF</CardTitle>
          <CardDescription>Ký vào vị trí đại diện bên A và đại diện bên B trên hợp đồng bảo hiểm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!pdfUrl ? (
              <UploadPDF onFileChange={handleFileChange} />
            ) : (
              <>
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleSignatureClick("benA")}
                      variant={signatures.benA ? "default" : "outline"}
                      className="flex items-center gap-2"
                    >
                      <PenLine className="h-4 w-4" />
                      {signatures.benA ? "Đã ký" : "Ký vào vị trí"} Đại diện bên A
                    </Button>
                    <Button
                      onClick={() => handleSignatureClick("benB")}
                      variant={signatures.benB ? "default" : "outline"}
                      className="flex items-center gap-2"
                    >
                      <PenLine className="h-4 w-4" />
                      {signatures.benB ? "Đã ký" : "Ký vào vị trí"} Đại diện bên B
                    </Button>
                    {Object.keys(signatures).length > 0 && (
                      <Button onClick={handleDownload} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Tải xuống PDF đã ký
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPdfUrl(null)
                        setPdfFile(null)
                        setSignatures({})
                      }}
                    >
                      Tải PDF khác
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </div>
                </div>

                <div className="relative border rounded-md overflow-hidden" ref={pdfContainerRef}>
                  <PDFViewerSimple
                    pdfUrl={signedPdfUrl || pdfUrl}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    setTotalPages={setTotalPages}
                  />

                 
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1"
                  >
                    Trang sau <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <SignatureModal isOpen={isModalOpen} onClose={handleCloseModal} onComplete={handleSignatureComplete} />
    </main>
  )
}

