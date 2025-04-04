"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import SignatureApp from "@/components/signature-app"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ContractPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [documentData, setDocumentData] = useState(null)

  useEffect(() => {
    async function verifyToken() {
      try {
        setLoading(true)

        // Lấy token từ URL bằng cách sử dụng catch-all route
        const currentUrl = window.location.pathname
        const token = currentUrl.substring(1) // Bỏ dấu / ở đầu

        console.log("Token từ URL:", token)

        if (!token) {
          throw new Error("Token không hợp lệ")
        }

        try {
          // Giải mã token để lấy thông tin
          const decoded = jwtDecode(token)
          console.log("Decoded token:", decoded)

          // Kiểm tra hạn sử dụng của token
          const currentTime = Math.floor(Date.now() / 1000)
          if (decoded.exp && decoded.exp < currentTime) {
            throw new Error("Token đã hết hạn")
          }

          // Lưu thông tin người dùng
          setUserData({
            user_id: decoded.user_id,
            role: decoded.role,
          })

          // Gọi API để lấy thông tin tài liệu
          try {
            const response = await fetch(`/api/contact-collaborators/${decoded.user_id}`)
            if (!response.ok) {
              throw new Error("Không thể lấy thông tin tài liệu")
            }

            const data = await response.json()
            console.log("Document data:", data)
            setDocumentData(data)
            console.log("Document fileUrl:", data.data.fileUrl)
            // Sử dụng fileUrl từ API response
            if (data.data.fileUrl) {
              setPdfUrl(data.data.fileUrl)
            } else {
              throw new Error("Không tìm thấy URL tài liệu")
            }
          } catch (apiError) {
            console.error("Lỗi khi gọi API:", apiError)
            throw new Error("Không thể lấy thông tin tài liệu")
          }
        } catch (decodeError) {
          console.error("Lỗi giải mã token:", decodeError)
          throw new Error("Token không hợp lệ")
        }
      } catch (err) {
        console.error("Lỗi xác thực:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-semibold">Không thể truy cập tài liệu</h2>
              <p className="text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">
                Link đã hết hạn hoặc không hợp lệ. Vui lòng liên hệ với người gửi để nhận link mới.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {userData && documentData && (
        <div className="mb-4">
         
        </div>
      )}

      {pdfUrl && (
        <SignatureApp
          pdfUrl={pdfUrl}
          userData={userData}
          documentData={documentData}
          allowedSignaturePositions={["benB"]} // Chỉ cho phép ký vào vị trí bên B
        />
      )}
    </div>
  )
}

