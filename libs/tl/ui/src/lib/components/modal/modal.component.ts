import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlIconComponent } from '../../icons/icon.component';
import { generateUniqueId } from '../../utils'; // ✨ Lôi vũ khí định danh duy nhất vào trận!

@Component({
  selector: 'tl-modal',
  standalone: true,
  imports: [CommonModule, TlIconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title = 'Modal Title';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closeOnBackdrop = true;
  @Output() close = new EventEmitter<void>();

  modalTitleId = generateUniqueId('tl-modal-title');
  modalBodyId = generateUniqueId('tl-modal-body');

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.lockBodyScroll();
      } else {
        this.unlockBodyScroll();
      }
    }
  }

  closeModal() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: any) {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // --- Thuật toán đo và khóa cứng scrollbar của trình duyệt ---
  private lockBodyScroll() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  private unlockBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}
