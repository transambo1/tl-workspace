import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlToast, ToastType } from './toast.component.type';
import { TlIconComponent } from '../../icons/icon.component';
import { generateUniqueId } from '../../utils';

@Component({
  selector: 'tl-toast-container',
  standalone: true,
  imports: [CommonModule, TlIconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnDestroy {
  @ViewChildren('toastItem') toastElements!: QueryList<ElementRef<HTMLDivElement>>;

  toasts: TlToast[] = [];
  private toastQueue: TlToast[] = [];
  maxCount = 5;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnDestroy() {
    this.toasts.forEach((t) => {
      if (t.timeoutId) clearTimeout(t.timeoutId);
    });
    this.toasts = [];
    this.toastQueue = [];
  }

  setMaxCount(count: number) {
    this.maxCount = count;
  }

  add(type: ToastType, message: string, duration: number = 3000): string {
    const id = generateUniqueId('tl-toast');
    const newToast: TlToast = {
      id,
      type,
      message,
      duration,
      timeoutId: null,
      startTime: Date.now(),
      isHovered: false,
      visible: true,
    };

    if (this.toasts.length < this.maxCount) {
      this.toasts.push(newToast);
      this.cdr.detectChanges();
      this.startTimer(newToast);
    } else {
      // 3. PRIORITY QUEUE: Ưu tiên nhét các thông báo khẩn cấp (error, warning) lên đầu hàng đợi
      if (type === 'error' || type === 'warning') {
        const lastUrgentIdx = this.toastQueue.findIndex(
          (t) => t.type !== 'error' && t.type !== 'warning',
        );
        if (lastUrgentIdx !== -1) {
          this.toastQueue.splice(lastUrgentIdx, 0, newToast);
        } else {
          this.toastQueue.push(newToast);
        }
      } else {
        this.toastQueue.push(newToast);
      }
    }

    return id;
  }

  private startTimer(toast: TlToast) {
    toast.startTime = Date.now();
    toast.timeoutId = setTimeout(() => {
      this.destroyToast(toast);
    }, toast.duration);
  }

  pauseToast(toast: TlToast) {
    if (!toast.visible) return;
    if (!toast.isHovered) {
      toast.isHovered = true;
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
        if (toast.duration && toast.startTime) {
          toast.duration -= Date.now() - toast.startTime;
        }
      }
    }
  }

  resumeToast(toast: TlToast) {
    if (!toast.visible) return;
    toast.isHovered = false;
    if (toast.duration && toast.duration > 0) {
      this.startTimer(toast);
    }
  }

  closeManual(toast: TlToast) {
    toast.isHovered = false;

    const toastsArray = this.toasts;
    const deletedIdx = toastsArray.findIndex((t) => t.id === toast.id);

    this.destroyToast(toast, () => {
      setTimeout(() => {
        const elements = this.toastElements.toArray();
        if (elements.length === 0) return;

        const targetIdx = deletedIdx < elements.length ? deletedIdx : elements.length - 1;
        if (elements[targetIdx]) {
          const closeBtn = elements[targetIdx].nativeElement.querySelector(
            '.tl-toast-close',
          ) as HTMLElement;
          closeBtn?.focus();
        }
      }, 0);
    });
  }

  private destroyToast(toast: TlToast, callback?: () => void) {
    if (toast.isHovered) return;

    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.visible = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== toast.id);
      this.cdr.detectChanges();
      this.processQueue();
      if (callback) callback();
    }, 250);
  }

  private processQueue() {
    while (this.toastQueue.length > 0 && this.toasts.length < this.maxCount) {
      const nextToast = this.toastQueue.shift();
      if (nextToast) {
        this.toasts.push(nextToast);
        this.cdr.detectChanges();
        this.startTimer(nextToast);
      }
    }
  }

  clearAll() {
    this.toasts.forEach((t) => {
      if (t.timeoutId) clearTimeout(t.timeoutId);
      t.visible = false;
    });
    this.toastQueue = [];
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toasts = [];
      this.cdr.detectChanges();
    }, 250);
  }
}
