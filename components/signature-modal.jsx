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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobileDetect } from "./responsive-utils"
import { getResponsiveDimensions } from "./responsive-utils"

export default function SignatureModal({ isOpen, onClose, onComplete }) {
  const sigCanvas = useRef(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [activeTab, setActiveTab] = useState("draw")
  const isMobile = useMobileDetect()
  const dimensions = getResponsiveDimensions()

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
      <DialogContent className="sm:max-w-md max-w-[95vw] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Thiết lập chữ ký</DialogTitle>
          <DialogDescription>Vẽ chữ ký của bạn trong khung bên dưới</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="draw" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="draw">Vẽ tay</TabsTrigger>
            <TabsTrigger value="upload">Từ tập tin</TabsTrigger>
            <TabsTrigger value="type">Nhập tay</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-0">
            <div className="border rounded-md bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: dimensions.width,
                  height: dimensions.height,
                  className: "signature-canvas",
                }}
                onBegin={handleBegin}
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={clear}>
                Xóa
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <div className="border rounded-md bg-white p-8 flex flex-col items-center justify-center h-[200px]">
              <p className="text-sm text-muted-foreground mb-4">Tải lên hình ảnh chữ ký của bạn</p>
              <Button variant="outline">Chọn tập tin</Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="mt-0">
            <div className="border rounded-md bg-white p-8 flex flex-col items-center justify-center h-[200px]">
              <p className="text-sm text-muted-foreground mb-4">Tính năng đang phát triển</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="agreement" className="rounded" />
          <label htmlFor="agreement" className="text-xs text-muted-foreground">
            Tôi đồng ý rằng chữ ký sẽ là dạng thể hiện điện tử của chữ ký của tôi cho mọi mục đích khi tôi (hoặc người
            đại diện của tôi) sử dụng chúng trên các tài liệu, bao gồm cả các hợp đồng ràng buộc về mặt pháp lý.
          </label>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Đóng
          </Button>
          <Button onClick={save} disabled={isEmpty || activeTab !== "draw"} className="w-full sm:w-auto">
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
