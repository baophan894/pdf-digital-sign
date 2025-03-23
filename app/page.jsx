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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [signatures, setSignatures] = useState({})
  const [currentSigningArea, setCurrentSigningArea] = useState(null)
  const [signedPdfUrl, setSignedPdfUrl] = useState(null)
  const pdfContainerRef = useRef(null)

  // Vị trí cố định cho chữ ký
  const signaturePositions = {
    benA: { x: 250, y: 400, page: 6 }, // Vị trí cho Đại diện bên A
    benB: { x: 720, y: 400, page: 6 }, // Vị trí cho Đại diện bên B
  }

  const handleFileChange = (file) => {
    setPdfFile(file)
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    setSignedPdfUrl(null)
    setSignatures({})
    setCurrentPage(6) // Mặc định hiển thị trang 6 (trang có chữ ký)
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

  const handleSignatureComplete = (signatureDataUrl) => {
    if (currentSigningArea) {
      setSignatures({
        ...signatures,
        [currentSigningArea]: signatureDataUrl,
      })
    }
  }

  const handleDownload = async () => {
    try {
      const { PDFDocument } = await import("pdf-lib")

      // Tải PDF gốc
      const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer())

      // Tạo một bản sao của PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes)

      // Nhúng chữ ký vào PDF
      for (const [id, signatureUrl] of Object.entries(signatures)) {
        const position = signaturePositions[id]
        if (!position) continue

        // Lấy trang cần ký
        const pages = pdfDoc.getPages()
        const pageIndex = position.page - 1
        if (pageIndex < 0 || pageIndex >= pages.length) continue

        const page = pages[pageIndex]

        // Chuyển đổi data URL thành Uint8Array
        const signatureImageBytes = await fetch(signatureUrl).then((res) => res.arrayBuffer())
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

      // Tạo link tải xuống
      const link = document.createElement("a")
      link.href = signedUrl
      link.download = pdfFile ? `${pdfFile.name.replace(".pdf", "")}-da-ky.pdf` : "tai-lieu-da-ky.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Lỗi khi tạo PDF đã ký:", error)
      alert("Có lỗi xảy ra khi tạo PDF đã ký: " + error.message)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Công cụ ký điện tử PDF</CardTitle>
          <CardDescription>Tải lên file PDF và ký vào vị trí đại diện bên A và đại diện bên B</CardDescription>
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
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <PenLine className="h-4 w-4" />
                      Ký vào vị trí Đại diện bên A
                    </Button>
                    <Button
                      onClick={() => handleSignatureClick("benB")}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <PenLine className="h-4 w-4" />
                      Ký vào vị trí Đại diện bên B
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

                  {/* Hiển thị vùng ký cho bên A */}
                  {currentPage === signaturePositions.benA.page && (
                    <div
                      className={`absolute border-2 ${signatures.benA ? "border-transparent" : "border-dashed border-primary"} rounded-md flex items-center justify-center`}
                      style={{
                        left: signaturePositions.benA.x - 75,
                        top: signaturePositions.benA.y - 30,
                        width: "150px",
                        height: "60px",
                        zIndex: 10,
                      }}
                    >
                      {signatures.benA ? (
                        <img
                          src={signatures.benA || "/placeholder.svg"}
                          alt="Chữ ký Bên A"
                          style={{ maxWidth: "150px", maxHeight: "60px" }}
                        />
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSignatureClick("benA")}
                          className="bg-white text-primary hover:bg-primary hover:text-white"
                        >
                          Ký tại đây
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Hiển thị vùng ký cho bên B */}
                  {currentPage === signaturePositions.benB.page && (
                    <div
                      className={`absolute border-2 ${signatures.benB ? "border-transparent" : "border-dashed border-primary"} rounded-md flex items-center justify-center`}
                      style={{
                        left: signaturePositions.benB.x - 75,
                        top: signaturePositions.benB.y - 30,
                        width: "150px",
                        height: "60px",
                        zIndex: 10,
                      }}
                    >
                      {signatures.benB ? (
                        <img
                          src={signatures.benB || "/placeholder.svg"}
                          alt="Chữ ký Bên B"
                          style={{ maxWidth: "150px", maxHeight: "60px" }}
                        />
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSignatureClick("benB")}
                          className="bg-white text-primary hover:bg-primary hover:text-white"
                        >
                          Ký tại đây
                        </Button>
                      )}
                    </div>
                  )}
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

