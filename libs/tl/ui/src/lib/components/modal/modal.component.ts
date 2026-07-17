import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
  OnDestroy,
  Inject,
  Renderer2,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { generateUniqueId } from '../../utils/string.util';
import { TlIconComponent } from '../../icons/icon.component';
@Component({
  selector: 'tl-modal',
  standalone: true,
  imports: [CommonModule, TlIconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class TlModalComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdrop = true;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() Close = new EventEmitter<void>();

  @ViewChild('modalContainer') modalContainer!: ElementRef<HTMLDivElement>;

  // Tạo ID duy nhất cho Modal bằng hàm của chú
  modalId = generateUniqueId('tl-modal');

  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngAfterViewInit(): void {
    if (this.isOpen) {
      this.handleModalOpen();
    }
  }

  // Lắng nghe thay đổi của thuộc tính isOpen để xử lý side-effects
  ngOnChanges(changes: any): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.handleModalOpen();
      } else {
        this.handleModalClose();
      }
    }
  }

  ngOnDestroy(): void {
    // Đảm bảo dọn dẹp scrollbar của body nếu component bị hủy đột ngột
    this.renderer.removeClass(this.document.body, 'tl-modal-open');
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.Close.emit();
    this.handleModalClose();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close();
    }
  }

  private handleModalOpen(): void {
    // 1. Lưu lại element hiện tại đang active để khôi phục sau này
    if (this.document.activeElement instanceof HTMLElement) {
      this.previouslyFocusedElement = this.document.activeElement;
    }

    // 2. Khóa cuộn trang nền phía sau (Lock Scroll)
    this.renderer.addClass(this.document.body, 'tl-modal-open');

    // 3. Đưa tiêu điểm focus vào bên trong container của Modal
    setTimeout(() => {
      this.focusFirstTabbableElement();
    }, 50); // Delay nhẹ để đợi animation hoàn thành
  }

  private handleModalClose(): void {
    // 1. Mở khóa cuộn trang nền
    this.renderer.removeClass(this.document.body, 'tl-modal-open');

    // 2. Khôi phục lại focus cho trigger element ban đầu
    const previousElement = this.previouslyFocusedElement;
    this.previouslyFocusedElement = null;

    if (previousElement?.isConnected) {
      previousElement.focus();
    }
  }

  // --- HỖ TRỢ PHÍM BẤM & FOCUS TRAP ---
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }

    if (event.key === 'Tab') {
      this.handleFocusTrap(event);
    }
  }

  private handleFocusTrap(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Nhấn Shift + Tab: Nếu đang ở phần tử đầu tiên, vòng lặp đưa tiêu điểm về phần tử cuối cùng
      if (this.document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Nhấn Tab: Nếu đang ở phần tử cuối cùng, vòng lặp đưa tiêu điểm về phần tử đầu tiên
      if (this.document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  private focusFirstTabbableElement(): void {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else if (this.modalContainer) {
      // Fallback: Focus vào chính container của Modal nếu không tìm thấy nút hay ô input nào
      this.modalContainer.nativeElement.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.modalContainer) return [];

    // Tìm tất cả các phần tử có khả năng nhận tương tác focus
    const selector = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
    ].join(',');

    const elements = Array.from(
      this.modalContainer.nativeElement.querySelectorAll(selector),
    ) as HTMLElement[];

    // Loại bỏ các element đang bị ẩn (display: none hoặc visibility: hidden)
    return elements.filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }
}
