import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { generateUniqueId } from '../../utils';

@Directive({
  selector: '[tlTruncateTooltip]',
  standalone: true,
})
export class TlTruncateTooltipDirective {
  @Input('tlTruncateTooltip') enabled = false;
  @Input() tooltipText = '';

  private tooltipEl: HTMLElement | null = null;
  private tooltipId = generateUniqueId('tl-tooltip');

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    // Đảm bảo phần tử có khả năng nhận focus từ bàn phím khi bị cắt chữ
    if (this.enabled) {
      this.renderer.setAttribute(this.el.nativeElement, 'tabindex', '0');
    }
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltipIfNeeded();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.removeTooltip();
  }

  @HostListener('focusin')
  onFocusIn() {
    this.showTooltipIfNeeded();
  }

  @HostListener('focusout')
  onFocusOut() {
    this.removeTooltip();
  }

  private showTooltipIfNeeded() {
    if (!this.enabled) return;

    const element = this.el.nativeElement;
    const isTruncated = element.scrollWidth > element.clientWidth;

    if (isTruncated) {
      const textToShow = this.tooltipText || element.innerText;
      this.createTooltip(textToShow);
    }
  }

  private createTooltip(text: string) {
    this.removeTooltip();

    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.appendChild(this.tooltipEl, this.renderer.createText(text));
    this.renderer.setAttribute(this.tooltipEl, 'id', this.tooltipId);
    this.renderer.setAttribute(this.tooltipEl, 'role', 'tooltip');
    this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipEl, 'background', '#384458');
    this.renderer.setStyle(this.tooltipEl, 'color', '#ffffff');
    this.renderer.setStyle(this.tooltipEl, 'padding', '6px 12px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '99999');
    this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipEl, 'box-shadow', '0 4px 6px -1px rgba(0,0,0,0.1)');
    this.renderer.setStyle(this.tooltipEl, 'max-width', '300px');
    this.renderer.setStyle(this.tooltipEl, 'white-space', 'normal');
    this.renderer.setStyle(this.tooltipEl, 'word-break', 'break-word');

    // Đưa vào body để không bị cha che khuất[cite: 14]
    this.renderer.appendChild(document.body, this.tooltipEl);

    // Tính toán tọa độ hiển thị[cite: 14]
    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipEl!.getBoundingClientRect();

    const top = rect.top - tooltipRect.height - 8;
    const left = rect.left + (rect.width - tooltipRect.width) / 2;

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${Math.max(10, left)}px`);

    // Gắn aria-describedby vào ô dữ liệu để liên kết với tooltip cho Screen Reader
    this.renderer.setAttribute(this.el.nativeElement, 'aria-describedby', this.tooltipId);
  }

  private removeTooltip() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl); //[cite: 14]
      this.tooltipEl = null;
      this.renderer.removeAttribute(this.el.nativeElement, 'aria-describedby');
    }
  }
}
