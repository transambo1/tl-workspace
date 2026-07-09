import {
  Injectable,
  ComponentRef,
  ApplicationRef,
  EnvironmentInjector,
  createComponent,
} from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastPosition, ToastType } from './toast.component.type';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private containerMap = new Map<ToastPosition, ComponentRef<ToastComponent>>();
  private defaultPosition: ToastPosition = 'top-right';
  private defaultMaxCount = 5;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  /**
   * Phương thức lấy hoặc khởi tạo Container tại một vị trí chỉ định
   */
  private getOrCreateContainer(position: ToastPosition): ComponentRef<ToastComponent> {
    if (this.containerMap.has(position)) {
      return this.containerMap.get(position)!;
    }

    // Nếu chưa có -> Tiến hành sinh ra một thực thể Container mới hoàn toàn cho góc này
    const containerRef = createComponent(ToastComponent, {
      environmentInjector: this.injector,
    });

    containerRef.instance.setMaxCount(this.defaultMaxCount);

    // Đính view vật lý vào hệ thống quản lý của Angular
    this.appRef.attachView(containerRef.hostView);

    // Bốc phần tử DOM ném thẳng vào Document Body
    const domElem = (containerRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Thêm class định vị css cho góc tương ứng ('top-right', 'top-left', v.v.)
    domElem.classList.add(position);

    // Lưu vào Ma trận Map để tái sử dụng cho các lần bắn sau
    this.containerMap.set(position, containerRef);
    return containerRef;
  }

  /**
   * Cấu hình nóng hệ thống từ App ngoài (Nếu cần)
   */
  setup(options: { maxCount?: number; position?: ToastPosition }) {
    if (options.position) {
      this.defaultPosition = options.position;
    }
    if (options.maxCount !== undefined) {
      this.defaultMaxCount = options.maxCount;
      this.containerMap.forEach((container) => {
        container.instance.setMaxCount(options.maxCount!);
      });
    }
  }

  /**
   * Hàm cốt lõi điều hướng bắn thông báo
   */
  private trigger(type: ToastType, message: string, duration?: number, position?: ToastPosition) {
    const targetPosition = position || this.defaultPosition;
    const container = this.getOrCreateContainer(targetPosition);
    container.instance.add(type, message, duration);
    container.changeDetectorRef.detectChanges();
  }

  success(message: string, duration?: number, position?: ToastPosition) {
    this.trigger('success', message, duration, position);
  }

  error(message: string, duration?: number, position?: ToastPosition) {
    this.trigger('error', message, duration, position);
  }

  info(message: string, duration?: number, position?: ToastPosition) {
    this.trigger('info', message, duration, position);
  }

  warning(message: string, duration?: number, position?: ToastPosition) {
    this.trigger('warning', message, duration, position);
  }
}
