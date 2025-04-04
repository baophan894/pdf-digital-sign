"use client"

import { useEffect } from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SignatureModal from "@/components/signature-modal"
import ConfirmationModal from "@/components/confirmation-modal"
import PDFViewerSimple from "@/components/pdf-viewer"
import { PenLine, Download, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { jwtDecode } from "jwt-decode"

export default function SignatureApp({ pdfUrl, userData, documentData, allowedSignaturePositions = ["benA", "benB"] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(7) // Mặc định hiển thị trang 7
  const [totalPages, setTotalPages] = useState(7)
  const [signatures, setSignatures] = useState({})
  const [currentSigningArea, setCurrentSigningArea] = useState(null)
  const [signedPdfUrl, setSignedPdfUrl] = useState(null)
  const [signatureComplete, setSignatureComplete] = useState(false)
  const [tempSignatureData, setTempSignatureData] = useState(null)
  const [pdfReloaded, setPdfReloaded] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const pdfContainerRef = useRef(null)

  // Vị trí cố định cho chữ ký trên trang 7
  const signaturePositions = {
    benB: { x: 440, y: 240, page: 7 }, // Vị trí cho Đại diện bên B
  }

  const handleSignatureClick = (id) => {
    if (!pdfUrl || !allowedSignaturePositions.includes(id)) return

    setCurrentSigningArea(id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentSigningArea(null)
  }

  const handleSignatureComplete = async (signatureDataUrl) => {
    if (currentSigningArea) {
      // Lưu chữ ký tạm thời
      setTempSignatureData({
        area: currentSigningArea,
        dataUrl: signatureDataUrl,
      })

      // Đóng modal ký
      setIsModalOpen(false)

      // Tạo bản xem trước của PDF với chữ ký
      setPdfLoading(true)

      try {
        const { PDFDocument } = await import("pdf-lib")

        // Tải PDF gốc
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer())

        // Tạo một bản sao của PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        // Lấy vị trí ký
        const position = signaturePositions[currentSigningArea]
        if (position) {
          // Lấy trang cần ký
          const pages = pdfDoc.getPages()
          const pageIndex = position.page - 1
          if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex]

            // Chuyển đổi data URL thành Uint8Array
            const signatureImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer())
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
        }

        // Lưu PDF đã ký
        const signedPdfBytes = await pdfDoc.save()

        // Tạo URL cho PDF đã ký
        const blob = new Blob([signedPdfBytes], { type: "application/pdf" })
        const signedUrl = URL.createObjectURL(blob)

        // Cập nhật URL của PDF đã ký
        setSignedPdfUrl(signedUrl)

        // Đánh dấu PDF đã được tải lại với chữ ký
        setPdfReloaded(true)
      } catch (error) {
        console.error("Lỗi khi tạo bản xem trước PDF:", error)
      } finally {
        setPdfLoading(false)
      }
    }
  }

  const handleOpenConfirmationModal = () => {
    if (tempSignatureData) {
      setIsConfirmationModalOpen(true)
    }
  }

  const handleConfirmSignature = async () => {
  if (!tempSignatureData) return;

  const { area, dataUrl } = tempSignatureData;

  const newSignatures = {
    ...signatures,
    [area]: dataUrl,
  };

  setSignatures(newSignatures);
  setSignatureComplete(true);

  if (userData) {
    try {
      // 🔹 Tạo file PDF đã ký
      const { PDFDocument } = await import("pdf-lib");

      // Tải PDF gốc
      const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

      // Tạo một bản sao của PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Lấy vị trí ký
      const position = signaturePositions[area];
      if (position) {
        // Lấy trang cần ký
        const pages = pdfDoc.getPages();
        const pageIndex = position.page - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];

          // Chuyển đổi data URL thành Uint8Array
          const signatureImageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
          const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

          // Tính toán kích thước chữ ký
          const width = 150;
          const height = 60;

          // Vẽ chữ ký lên trang
          page.drawImage(signatureImage, {
            x: position.x - width / 2,
            y: page.getHeight() - position.y - height / 2, // PDF coordinates start from bottom-left
            width,
            height,
          });
        }
      }

      // Lưu PDF đã ký
      const signedPdfBytes = await pdfDoc.save();

      // Tạo file Blob để gửi lên server
      const file = new File([signedPdfBytes], "hop-dong-da-ky.pdf", { type: "application/pdf" });

      console.log("File PDF đã ký:", file);

      // 🔹 Tạo FormData để gửi file lên server
      const formData = new FormData();
      formData.append("file", file);

      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value); // Ghi log key và giá trị
      }

      // 🟢 Gửi file lên API
      const uploadResponse = await fetch("api/contact-collaborators/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Không thể tải lên file ký.");
      }

      const responseData = await uploadResponse.json();
      console.log("Phản hồi từ API:", responseData);

      const contractUrl = responseData?.data.data;
      console.log("URL file đã tải lên:", contractUrl);

      // 🟢 2. Cập nhật contract URL trên server
      const updateUrlResponse = await fetch(
        `api/contact-collaborators/update-contract-url/${userData.user_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractUrl: contractUrl }),
        }
      );
      console.log('updateURL:',updateUrlResponse)

      if (!updateUrlResponse.ok) throw new Error("Không thể cập nhật contract URL");

      // 🟢 3. Cập nhật trạng thái hợp đồng thành "signed"
      const currentUrl = window.location.pathname
        const token = currentUrl.substring(1)
      const decoded = jwtDecode(token)
      const response = await fetch(`/api/contact-collaborators/${decoded.user_id}`) 
      if (!response.ok) {
         throw new Error("Không thể lấy thông tin tài liệu") }
      const data = await response.json()
      console.log('data:',data)
      const updateStatusResponse = await fetch(
        `api/contact-collaborators/${data.data.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "signed" }),
        }
      );

     if (!updateStatusResponse.ok) throw new Error("Không thể cập nhật trạng thái hợp đồng");

      console.log("Hợp đồng đã ký thành công!");
    } catch (error) {
      console.error("Lỗi khi xử lý chữ ký:", error);
    }
  }

  // Đóng modal xác nhận
  setIsConfirmationModalOpen(false);
};





  const handleCancelConfirmation = () => {
    setIsConfirmationModalOpen(false)
  }

  const handleCancelSignature = () => {
    // Hủy bỏ chữ ký tạm thời
    setTempSignatureData(null)
    setPdfReloaded(false)
    setSignedPdfUrl(null)
  }

  const handleDownload = () => {
    if (!signedPdfUrl) return
    console.log('url:', signedPdfUrl);
    // Tạo link tải xuống
    const link = document.createElement("a")
    link.href = signedPdfUrl
    link.download = "hop-dong-da-ky.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Kiểm tra xem đã có chữ ký trong localStorage chưa
  useEffect(() => {
    if (userData) {
      try {
        // Kiểm tra trạng thái đã ký
        const isComplete = localStorage.getItem(`signature_complete_${userData.user_id}`)

        if (isComplete === "true") {
          setSignatureComplete(true)

          // Lấy chữ ký từ localStorage
          const savedSignature = localStorage.getItem(`signature_${userData.user_id}_benB`)

          if (savedSignature) {
            // Khôi phục chữ ký
            setSignatures({
              benB: savedSignature,
            })

            // Tự động tạo lại PDF đã ký
            setPdfLoading(true)

            const createSignedPdf = async () => {
              try {
                const { PDFDocument } = await import("pdf-lib")

                // Tải PDF gốc
                const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer())

                // Tạo một bản sao của PDF
                const pdfDoc = await PDFDocument.load(existingPdfBytes)

                // Lấy vị trí ký
                const position = signaturePositions.benB
                if (position) {
                  // Lấy trang cần ký
                  const pages = pdfDoc.getPages()
                  const pageIndex = position.page - 1
                  if (pageIndex >= 0 && pageIndex < pages.length) {
                    const page = pages[pageIndex]

                    // Chuyển đổi data URL thành Uint8Array
                    const signatureImageBytes = await fetch(savedSignature).then((res) => res.arrayBuffer())
                    const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

                    // Tính toán kích thước chữ ký
                    const width = 150
                    const height = 60

                    // Vẽ chữ ký lên trang
                    page.drawImage(signatureImage, {
                      x: position.x - width / 2,
                      y: page.getHeight() - position.y - height / 2,
                      width,
                      height,
                    })
                  }
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
              } finally {
                setPdfLoading(false)
              }
            }

            createSignedPdf()
          }
        }
      } catch (e) {
        console.error("Không thể đọc từ localStorage:", e)
      }
    }
  }, [userData, pdfUrl])

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {documentData ? "Hợp đồng cộng tác viên" : "Hợp đồng bảo hiểm giáo viên"}
        </CardTitle>
        <CardDescription>
          {signatureComplete
            ? "Cảm ơn bạn đã ký hợp đồng. Bạn có thể tải xuống bản hợp đồng đã ký."
            : "Vui lòng ký vào vị trí đại diện bên B của hợp đồng"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signatureComplete ? (
            <div className="bg-green-50 p-4 rounded-md flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-medium text-green-800">Ký hợp đồng thành công</h3>
                <p className="text-green-700 text-sm">Hợp đồng đã được ký thành công</p>
              </div>
            </div>
          ) : pdfReloaded && tempSignatureData ? (
            <div className="bg-green-50 p-4 rounded-md flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <PenLine className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-medium text-green-800">Xem trước chữ ký</h3>
                  <p className="text-green-700 text-sm">Vui lòng kiểm tra chữ ký của bạn trên tài liệu</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancelSignature}>
                  Hủy bỏ
                </Button>
                <Button onClick={handleOpenConfirmationModal} className="bg-green-600 hover:bg-green-700">
                  Xác nhận chữ ký
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {allowedSignaturePositions.includes("benB") && (
                  <Button
                    onClick={() => handleSignatureClick("benB")}
                    variant={signatures.benB ? "default" : "outline"}
                    className="flex items-center gap-2"
                    disabled={signatureComplete || pdfLoading}
                  >
                    <PenLine className="h-4 w-4" />
                    {signatures.benB ? "Đã ký" : "Ký vào vị trí"} Đại diện bên B
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
              <PDFViewerSimple
                pdfUrl={signedPdfUrl || pdfUrl}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setTotalPages={setTotalPages}
              />
            )}


          </div>

          <div className="flex justify-between space-x-2">
           

            {signatureComplete && (
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Tải xuống PDF đã ký
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <SignatureModal isOpen={isModalOpen} onClose={handleCloseModal} onComplete={handleSignatureComplete} />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmSignature}
      />
    </Card>
  )
}

