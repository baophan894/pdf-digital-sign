"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle, Mail, AlertCircle } from "lucide-react"
import React from "react"

export default function EmailVerificationModal({ isOpen, onClose, onVerified, userEmail = "", userId = "" }) {
  const [email, setEmail] = useState(userEmail)
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)

  // Generate a random 4-digit code
  const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  // Handle sending verification code
  const handleSendCode = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ")
      return
    }

    setError("")
    const code = generateCode()
    setGeneratedCode(code)
    setIsCodeSent(true)
    setCountdown(60)
    const sendEmail = await fetch(`api/collaborator-request/send-otp/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: code, email: email }),
    })
    console.log("sendEmail:", sendEmail)
  }

  // Handle verification
  const handleVerify = () => {
    setIsVerifying(true)

    if (verificationCode === generatedCode) {
      setIsVerified(true)
      setTimeout(() => {
        onVerified()
      }, 1500)
    } else {
      setError("Mã xác thực không chính xác")
      setIsVerifying(false)
    }
  }

  // Countdown timer for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader className={undefined}>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Thiết lập ký kết
          </DialogTitle>
          <DialogDescription className={undefined}>Xác thực email để hoàn tất quá trình ký kết hợp đồng</DialogDescription>
        </DialogHeader>

        {isVerified ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-green-700">Xác thực thành công!</h3>
            <p className="text-center text-muted-foreground mt-2">
              Email của bạn đã được xác thực. Đang chuyển hướng...
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={undefined}>Địa chỉ email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isCodeSent} className={undefined}                />
              </div>

              {isCodeSent && (
                <div className="space-y-2">
                  <Label htmlFor="code" className={undefined}>Mã xác thực (4 chữ số)</Label>
                  <Input
                      id="code"
                      type="text"
                      placeholder="Nhập mã 4 chữ số"
                      maxLength={4}
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setVerificationCode(value)
                        if (error) setError("")
                      } } className={undefined}                  />
                  <p className="text-xs text-muted-foreground">
                    Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {!isCodeSent ? (
                <Button className="w-full sm:w-auto" onClick={handleSendCode} variant={undefined} size={undefined}>
                  Xác nhận gửi mã
                </Button>
              ) : (
                <>
                  <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          if (countdown === 0) {
                            handleSendCode()
                          }
                        } }
                        disabled={countdown > 0} size={undefined}                  >
                    {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi lại mã"}
                  </Button>
                  <Button
                        className="w-full sm:w-auto"
                        onClick={handleVerify}
                        disabled={verificationCode.length !== 4 || isVerifying} variant={undefined} size={undefined}                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang xác thực...
                      </span>
                    ) : (
                      "Xác thực"
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
