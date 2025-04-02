import Link from "next/link"

export default function Home() {
  // Token mẫu để demo
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Hệ thống ký điện tử</h1>
        <p className="text-center text-gray-600 mb-8">
          Vui lòng sử dụng link được gửi qua email để truy cập và ký tài liệu của bạn.
        </p>
        
      </div>
    </div>
  )
}

