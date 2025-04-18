"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SignatureModal from "@/components/signature-modal"
import ConfirmationModal from "@/components/confirmation-modal"
import EmailVerificationModal from "@/components/email-verification-modal"
import { PenLine, Download, CheckCircle, RefreshCw } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import ReactPDFViewer from "./pdf-viewer"
import EnhancedPDFViewer from "./pdf-viewer"

export default function SignatureApp({ pdfUrl, userData, documentData, allowedSignaturePositions = ["benA", "benB"] }) {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(7) // Default to page 7
  const [totalPages, setTotalPages] = useState(7)
  const [signatures, setSignatures] = useState({})
  const [currentSigningArea, setCurrentSigningArea] = useState(null)
  const [signedPdfUrl, setSignedPdfUrl] = useState(null)
  const [signatureComplete, setSignatureComplete] = useState(false)
  const [tempSignatureData, setTempSignatureData] = useState(null)
  const [pdfReloaded, setPdfReloaded] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [pdfKey, setPdfKey] = useState(0) // Add a key to force re-render
  const pdfContainerRef = useRef(null)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Fixed positions for signatures on page 7
  const signaturePositions = {
    benB: { x: 440, y: 240, page: 7 }, // Position for Representative of Party B
  }

  const handleSignatureClick = (id) => {
    if (!pdfUrl || !allowedSignaturePositions.includes(id)) return

    setCurrentSigningArea(id)
    setIsSignatureModalOpen(true)
  }

  const handleCloseSignatureModal = () => {
    setIsSignatureModalOpen(false)
    setCurrentSigningArea(null)
  }

  const handleSignatureComplete = async (signatureDataUrl) => {
    if (currentSigningArea) {
      // Save temporary signature
      setTempSignatureData({
        area: currentSigningArea,
        dataUrl: signatureDataUrl,
      })

      // Close signature modal
      setIsSignatureModalOpen(false)

      // Create preview of PDF with signature
      setPdfLoading(true)

      try {
        const { PDFDocument } = await import("pdf-lib")

        // Load original PDF
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer())

        // Create a copy of the PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        // Get signature position
        const position = signaturePositions[currentSigningArea]
        if (position) {
          // Get the page to sign
          const pages = pdfDoc.getPages()
          const pageIndex = position.page - 1
          if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex]

            // Convert data URL to Uint8Array
            const signatureImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer())
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

            // Calculate signature size
            const width = 150
            const height = 60

            // Draw signature on the page
            page.drawImage(signatureImage, {
              x: position.x - width / 2,
              y: page.getHeight() - position.y - height / 2, // PDF coordinates start from bottom-left
              width,
              height,
            })
          }
        }

        // Save signed PDF
        const signedPdfBytes = await pdfDoc.save()

        // Create URL for signed PDF
        const blob = new Blob([signedPdfBytes], { type: "application/pdf" })
        const signedUrl = URL.createObjectURL(blob)

        // Update signed PDF URL
        setSignedPdfUrl(signedUrl)

        // Mark PDF as reloaded with signature
        setPdfReloaded(true)

        // Force PDF viewer to re-render
        setPdfKey((prevKey) => prevKey + 1)
      } catch (error) {
        console.error("Error creating PDF preview:", error)
      } finally {
        setPdfLoading(false)
      }
    }
  }

  const handleOpenConfirmationModal = () => {
    if (tempSignatureData) {
      // Open email verification modal first, before confirmation
      setIsEmailVerificationModalOpen(true)
    }
  }

  const handleEmailVerified = () => {
    // Close email verification modal and open confirmation modal
    setIsEmailVerificationModalOpen(false)
    setIsConfirmationModalOpen(true)
  }

  const handleConfirmSignature = async () => {
    if (!tempSignatureData) return

    const { area, dataUrl } = tempSignatureData

    const newSignatures = {
      ...signatures,
      [area]: dataUrl,
    }

    setSignatures(newSignatures)
    setSignatureComplete(true)

    if (userData) {
      try {
        // 🔹 Create signed PDF file
        const { PDFDocument } = await import("pdf-lib")

        // Load original PDF
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer())

        // Create a copy of the PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        // Get signature position
        const position = signaturePositions[area]
        if (position) {
          // Get the page to sign
          const pages = pdfDoc.getPages()
          const pageIndex = position.page - 1
          if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex]

            // Convert data URL to Uint8Array
            const signatureImageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer())
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

            // Calculate signature size
            const width = 150
            const height = 60

            // Draw signature on the page
            page.drawImage(signatureImage, {
              x: position.x - width / 2,
              y: page.getHeight() - position.y - height / 2, // PDF coordinates start from bottom-left
              width,
              height,
            })
          }
        }

        // Save signed PDF
        const signedPdfBytes = await pdfDoc.save()

        // Create Blob file to send to server
        const file = new File([signedPdfBytes], "hop-dong-da-ky.pdf", { type: "application/pdf" })

        console.log("Signed PDF file:", file)

        // Create URL for signed PDF and update state to ensure it's visible
        const blob = new Blob([signedPdfBytes], { type: "application/pdf" })
        const signedUrl = URL.createObjectURL(blob)
        setSignedPdfUrl(signedUrl)

        // Force PDF viewer to re-render
        setPdfKey((prevKey) => prevKey + 1)

        // 🔹 Create FormData to send file to server
        const formData = new FormData()
        formData.append("file", file)

        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value) // Log key and value
        }

        // 🟢 Send file to API
        const uploadResponse = await fetch("api/contact-collaborators/upload-file", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Could not upload signed file.")
        }

        const responseData = await uploadResponse.json()
        console.log("API response:", responseData)

        const contractUrl = responseData?.data.data
        console.log("Uploaded file URL:", contractUrl)

        // 🟢 2. Update contract URL on server
        const updateUrlResponse = await fetch(`api/contact-collaborators/update-contract-url/${userData.user_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractUrl: contractUrl }),
        })
        console.log("updateURL:", updateUrlResponse)

        if (!updateUrlResponse.ok) throw new Error("Could not update contract URL")

        // 🟢 3. Update contract status to "signed"
        const currentUrl = window.location.pathname
        const token = currentUrl.substring(1)
        const decoded = jwtDecode(token)
        const response = await fetch(`/api/contact-collaborators/${decoded.user_id}`)
        if (!response.ok) {
          throw new Error("Could not get document information")
        }
        const data = await response.json()
        console.log("data:", data)
        const updateStatusResponse = await fetch(`api/contact-collaborators/${data.data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "signed" }),
        })

        if (!updateStatusResponse.ok) throw new Error("Could not update contract status")

        console.log("Contract signed successfully!")
      } catch (error) {
        console.error("Error processing signature:", error)
      }
    }

    // Close confirmation modal
    setIsConfirmationModalOpen(false)
  }

  const handleCancelConfirmation = () => {
    setIsConfirmationModalOpen(false)
  }

  const handleCancelSignature = () => {
    // Cancel temporary signature
    setTempSignatureData(null)
    setPdfReloaded(false)
    setSignedPdfUrl(null)
  }

  const handleDownload = () => {
    if (!signedPdfUrl) return
    console.log("url:", signedPdfUrl)
    // Create download link
    const link = document.createElement("a")
    link.href = signedPdfUrl
    link.download = "hop-dong-da-ky.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Handle load complete
  const handleLoadComplete = (numPages) => {
    setTotalPages(numPages)
  }

  // Force reload PDF viewer
  const handleReloadPdf = () => {
    setPdfKey((prevKey) => prevKey + 1)
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">
          {documentData ? "Hợp đồng cộng tác viên" : "Hợp đồng bảo hiểm giáo viên"}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {signatureComplete
            ? "Cảm ơn bạn đã ký hợp đồng. Bạn có thể tải xuống bản hợp đồng đã ký."
            : "Vui lòng ký vào vị trí đại diện bên B của hợp đồng"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          {signatureComplete ? (
            <div className="bg-green-50 p-3 sm:p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-0.5 sm:mt-0" />
              <div className="flex-1">
                <h3 className="font-medium text-green-800">Ký hợp đồng thành công</h3>
                <p className="text-green-700 text-xs sm:text-sm">Hợp đồng đã được ký thành công</p>
              </div>
              {isMobile && (
                <Button variant="outline" size="sm" onClick={handleReloadPdf} className="ml-auto text-xs h-8 px-2">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tải lại PDF
                </Button>
              )}
            </div>
          ) : pdfReloaded && tempSignatureData ? (
            <div className="bg-green-50 p-3 sm:p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <PenLine className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-0.5 sm:mt-0" />
                <div>
                  <h3 className="font-medium text-green-800">Xem trước chữ ký</h3>
                  <p className="text-green-700 text-xs sm:text-sm">Vui lòng kiểm tra chữ ký của bạn trên tài liệu</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={handleCancelSignature} className="flex-1 sm:flex-none text-sm h-9">
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleOpenConfirmationModal}
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none text-sm h-9"
                >
                  Xác nhận chữ ký
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {allowedSignaturePositions.includes("benB") && (
                  <Button
                    onClick={() => handleSignatureClick("benB")}
                    variant={signatures.benB ? "default" : "outline"}
                    className="flex items-center gap-2 text-sm h-9 w-full sm:w-auto"
                    disabled={signatureComplete || pdfLoading}
                  >
                    <PenLine className="h-4 w-4" />
                    <span className="whitespace-nowrap">
                      {signatures.benB ? "Đã ký" : "Ký vào vị trí"} Đại diện bên B
                    </span>
                  </Button>
                )}
              </div>
            </div>
          )}


          <div className="relative border rounded-md overflow-hidden" ref={pdfContainerRef}>
            {pdfLoading ? (
              <div className="flex items-center justify-center h-[500px] w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <EnhancedPDFViewer
                pdfUrl={signedPdfUrl || pdfUrl}
                initialPage={currentPage}
                scale={1.0}
                rotation={0}
                showAll={false}
                enableSearch={false}
              />
            )}
          </div>


          <div className="flex flex-wrap justify-between gap-2">
            {signatureComplete && (
              <>
                <Button onClick={handleDownload} className="flex items-center gap-2 text-sm h-9 w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  <span className="whitespace-nowrap">Tải xuống PDF đã ký</span>
                </Button>

                {isMobile && (
                  <Button
                    variant="outline"
                    onClick={handleReloadPdf}
                    className="flex items-center gap-2 text-sm h-9 w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="whitespace-nowrap">Tải lại PDF</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={handleCloseSignatureModal}
        onComplete={handleSignatureComplete}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isEmailVerificationModalOpen}
        onClose={() => setIsEmailVerificationModalOpen(false)}
        onVerified={handleEmailVerified}
        userEmail={userData?.email || ""}
        userId={userData?.user_id || ""}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmSignature}
      />
    </Card>
  )
}
