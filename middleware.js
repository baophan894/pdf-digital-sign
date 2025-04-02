import { NextResponse } from "next/server"

export function middleware(request) {
  // Chỉ xử lý các request đến các route động
  if (request.nextUrl.pathname.startsWith("/ey")) {
    // Lấy token từ URL
    const token = request.nextUrl.pathname.substring(1)

    try {
      // Giải mã URL nếu cần
      const decodedToken = decodeURIComponent(token)

      // Tạo URL mới với token đã được mã hóa đúng cách
      const url = new URL(`/${encodeURIComponent(decodedToken)}`, request.url)

      // Chuyển hướng đến URL mới
      return NextResponse.redirect(url)
    } catch (error) {
      console.error("Middleware error:", error)
      // Nếu có lỗi, tiếp tục xử lý request
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Chỉ áp dụng middleware cho các path bắt đầu bằng /ey
    "/ey:path*",
  ],
}

