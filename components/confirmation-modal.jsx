"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"

export default function ConfirmationModal({ isOpen, onClose, onConfirm }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Xác nhận chữ ký
          </DialogTitle>
          <DialogDescription>
            Bạn đã ký thành công vào hợp đồng. Vui lòng xác nhận để hoàn tất quá trình ký.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Bằng cách xác nhận, bạn đồng ý rằng chữ ký của bạn là hợp lệ và có giá trị pháp lý tương đương với chữ ký
            tay.
          </p>
          <p className="text-sm text-muted-foreground">Bạn có thể tải xuống bản hợp đồng đã ký sau khi xác nhận.</p>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            Xác nhận chữ ký
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

