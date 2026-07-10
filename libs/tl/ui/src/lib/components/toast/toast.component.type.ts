export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export interface TlToast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  timeoutId?: any;
  startTime?: number;
  isHovered?: boolean;
  visible?: boolean;
}
