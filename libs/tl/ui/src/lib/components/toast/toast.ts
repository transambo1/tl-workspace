import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlToast, ToastType } from './toast.type';

@Component({
  selector: 'tl-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  toasts: TlToast[] = [];
  private toastQueue: TlToast[] = [];
  maxCount = 5;

  constructor(private cdr: ChangeDetectorRef) {}

  setMaxCount(count: number) {
    this.maxCount = count;
  }
  setPosition(pos: any) {
    this.cdr.detectChanges();
  }

  add(type: ToastType, message: string, duration: number = 3000): number {
    const id = Date.now() + Math.random();
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
      this.toastQueue.push(newToast);
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
    if (!toast.visible) return; // Đang chạy animation tắt thì bỏ qua
    toast.isHovered = true;
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
      if (toast.duration && toast.startTime) {
        toast.duration -= Date.now() - toast.startTime;
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
    this.destroyToast(toast);
  }

  /**
   *  THUẬT TOÁN ĐIỀU PHỐI HOÃN BINH BẰNG CSS ANIMATION
   */
  private destroyToast(toast: TlToast) {
    if (toast.isHovered) return;

    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.visible = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== toast.id);
      this.cdr.detectChanges();
      this.processQueue();
    }, 150);
  }

  private processQueue() {
    if (this.toastQueue.length > 0 && this.toasts.length < this.maxCount) {
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
    }, 150);
  }
}
