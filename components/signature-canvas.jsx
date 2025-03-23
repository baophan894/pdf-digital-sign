"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignaturePad({ onComplete }) {
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
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <Card className="w-[350px] bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Thêm chữ ký của bạn</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="border rounded-md">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 330,
              height: 150,
              className: "signature-canvas"
            }}
            onBegin={handleBegin}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={clear}>
          Xóa
        </Button>
        <Button size="sm" onClick={save} disabled={isEmpty}>
          Áp dụng
        </Button>
      </CardFooter>
    </Card>
  )
}