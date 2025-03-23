"use client"

export default function DemoContract({ onSignatureAreaClick, signatures }) {
  const handleSignatureAreaClick = (e, id) => {
    e.stopPropagation();
    onSignatureAreaClick(id);
  };

  return (
    <div className="bg-white p-8 min-h-[800px] w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">HỢP ĐỒNG DỊCH VỤ</h1>
        <p className="text-sm text-gray-500">Số: 2024/HĐDV-001</p>
      </div>

      {/* Contract content - same as before */}
      <div className="mb-6">
        <p className="mb-2">Hôm nay, ngày 19 tháng 03 năm 2024, tại Hà Nội</p>
        <p className="mb-4">Chúng tôi gồm:</p>

        <div className="mb-4">
          <p className="font-semibold">BÊN A: CÔNG TY TNHH ABC</p>
          <p>Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
          <p>Điện thoại: 028 1234 5678</p>
          <p>Mã số thuế: 0123456789</p>
          <p>Đại diện: Ông Nguyễn Văn A</p>
          <p>Chức vụ: Giám đốc</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold">BÊN B: CÔNG TY CỔ PHẦN XYZ</p>
          <p>Địa chỉ: 456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
          <p>Điện thoại: 028 8765 4321</p>
          <p>Mã số thuế: 9876543210</p>
          <p>Đại diện: Bà Trần Thị B</p>
          <p>Chức vụ: Giám đốc</p>
        </div>
      </div>

      {/* Contract terms - same as before */}
      <div className="mb-6">
        <p className="font-semibold mb-2">ĐIỀU 1: NỘI DUNG HỢP ĐỒNG</p>
        <p>Bên B đồng ý cung cấp cho Bên A dịch vụ phát triển phần mềm với các nội dung sau:</p>
        <ul className="list-disc pl-6 mb-2">
          <li>Xây dựng ứng dụng web theo yêu cầu của Bên A</li>
          <li>Thiết kế giao diện người dùng</li>
          <li>Phát triển các tính năng theo đặc tả kỹ thuật</li>
          <li>Kiểm thử và triển khai ứng dụng</li>
        </ul>
      </div>

      <div className="mb-6">
        <p className="font-semibold mb-2">ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN</p>
        <p>2.1. Tổng giá trị hợp đồng: 500.000.000 VNĐ (Năm trăm triệu đồng)</p>
        <p>2.2. Phương thức thanh toán:</p>
        <ul className="list-disc pl-6 mb-2">
          <li>Đợt 1: 30% giá trị hợp đồng sau khi ký hợp đồng</li>
          <li>Đợt 2: 40% giá trị hợp đồng sau khi hoàn thành giai đoạn phát triển</li>
          <li>Đợt 3: 30% giá trị hợp đồng sau khi nghiệm thu và bàn giao</li>
        </ul>
      </div>

      <div className="mb-6">
        <p className="font-semibold mb-2">ĐIỀU 3: THỜI GIAN THỰC HIỆN</p>
        <p>Thời gian thực hiện: 3 tháng kể từ ngày ký hợp đồng</p>
      </div>

      <div className="mb-8">
        <p className="font-semibold mb-2">ĐIỀU 4: TRÁCH NHIỆM CỦA CÁC BÊN</p>
        <p>4.1. Trách nhiệm của Bên A:</p>
        <ul className="list-disc pl-6 mb-2">
          <li>Cung cấp đầy đủ thông tin, tài liệu cần thiết</li>
          <li>Phối hợp với Bên B trong quá trình thực hiện</li>
          <li>Thanh toán đúng hạn theo thỏa thuận</li>
        </ul>
        <p>4.2. Trách nhiệm của Bên B:</p>
        <ul className="list-disc pl-6 mb-2">
          <li>Thực hiện đúng nội dung và tiến độ đã cam kết</li>
          <li>Bảo mật thông tin của Bên A</li>
          <li>Hỗ trợ kỹ thuật trong thời gian bảo hành</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-12">
        <div className="text-center">
          <p className="font-semibold mb-4">ĐẠI DIỆN BÊN A</p>
          {signatures && signatures.benA ? (
            <div className="mx-auto h-24 w-48 flex items-center justify-center">
              <img 
                src={signatures.benA || "/placeholder.svg"} 
                alt="Chữ ký Bên A" 
                className="max-h-24 max-w-48"
              />
            </div>
          ) : (
            <div 
              className="mx-auto h-24 w-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={(e) => handleSignatureAreaClick(e, "benA")}
            >
              <p className="text-gray-400">Nhấp để ký tại đây</p>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-500">Nguyễn Văn A</p>
        </div>
        <div className="text-center">
          <p className="font-semibold mb-4">ĐẠI DIỆN BÊN B</p>
          {signatures && signatures.benB ? (
            <div className="mx-auto h-24 w-48 flex items-center justify-center">
              <img 
                src={signatures.benB || "/placeholder.svg"} 
                alt="Chữ ký Bên B" 
                className="max-h-24 max-w-48"
              />
            </div>
          ) : (
            <div 
              className="mx-auto h-24 w-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={(e) => handleSignatureAreaClick(e, "benB")}
            >
              <p className="text-gray-400">Nhấp để ký tại đây</p>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-500">Trần Thị B</p>
        </div>
      </div>
    </div>
  )
}