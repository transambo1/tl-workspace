/**
 * Tự động toán thuật để sinh ra dải trang hiển thị có dấu ba chấm thông minh.
 * Ví dụ trả về: [1, 2, '...', 5, 6, 7, '...', 10]
 * * @param currentPage Trang hiện tại người dùng đang đứng (1-indexed)
 * @param totalPages Tổng số lượng trang khả dụng
 * @param siblings Số lượng nút trang hiển thị bên cạnh trang hiện tại (Mặc định là 1)
 */
export function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblings: number = 1,
): (number | string)[] {
  // Tổng số nút hiển thị tối đa cố định: Đầu + Cuối + Hiện tại + 2 dấu ... + 2 nút bên cạnh hiện tại
  const totalPageNumbers = siblings * 2 + 5;

  // Trường hợp 1: Tổng số trang ít hơn số nút tối đa -> Hiện tuồn tuột từ 1 đến hết
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblings, 1);
  const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Trường hợp 2: Chỉ ẩn bên phải (Không có dấu ... bên trái, chỉ có ... bên phải)
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblings;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', lastPageIndex];
  }

  // Trường hợp 3: Chỉ ẩn bên trái (Có dấu ... bên trái, không có ... bên phải)
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblings;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1,
    );
    return [firstPageIndex, '...', ...rightRange];
  }

  // Trường hợp 4: Ẩn cả 2 bên (Hiển thị ... ở cả trái lẫn phải)
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
  }

  return [];
}
