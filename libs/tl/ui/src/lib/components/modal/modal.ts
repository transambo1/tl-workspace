import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'tl-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class ModalComponent {
  constructor(private el: ElementRef) {}
  @Input() isOpen: boolean = false;
  @Input() title = 'Modal Title';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  @HostListener('document: keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  onBackdropClick(event: MouseEvent) {
    // event.target: là nơi chú thực sự click vào
    // event.currentTarget: là cái lớp backdrop (thẻ div to nhất)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
