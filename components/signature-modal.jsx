"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SignatureModal({ isOpen, onClose, onComplete }) {
  const sigCanvas = useRef(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const clear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const save = () => {
    if (sigCanvas.current && !isEmpty) {
      const dataURL = sigCanvas.current.toDataURL("image/png")
      onComplete(dataURL)
      onClose()
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  const handleOpenChange = (open) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm chữ ký của bạn</DialogTitle>
          <DialogDescription>Vẽ chữ ký của bạn trong khung bên dưới</DialogDescription>
        </DialogHeader>
        <div className="border rounded-md bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 400,
              height: 200,
              className: "signature-canvas",
            }}
            onBegin={handleBegin}
          />
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={clear}>
            Xóa
          </Button>
          <Button onClick={save} disabled={isEmpty}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

