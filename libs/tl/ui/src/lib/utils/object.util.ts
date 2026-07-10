/**
 * Sao chép một đối tượng hoặc mảng để tránh chồng chéo tham chiếu dữ liệu (Reference log)
 */
export function deepClone<T>(obj: T): T {
  if (obj == null || typeof obj !== 'object') return obj;

  // Cho mảng []
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  // Cho 1 Object nếu là {}
  const cloned = {} as Record<string, any>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned as T;
}

/**
 * Kiểm tra một giá trị xem có phải là object rỗng hay không
 */
export function isEmptyObject(obj: any): boolean {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
