import { Component, Input, HostBinding, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonShape, ButtonSize, ButtonVariant } from './button.types';

@Component({
  selector: 'button[tl-button]',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading) {
      <svg
        class="tl-btn-spinner"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          class="tl-spinner-track"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="tl-spinner-head"
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
        ></path>
      </svg>
    }
    <ng-content></ng-content>
  `,
  styleUrl: './button.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() loading: boolean = false;
  @Input() shape: ButtonShape = 'rounded';

  @HostBinding('class.tl-btn') readonly tlBtn = true;

  // Button Variants
  @HostBinding('class.tl-btn-primary') get isPrimary() {
    return this.variant === 'primary';
  }
  @HostBinding('class.tl-btn-secondary') get isSecondary() {
    return this.variant === 'secondary';
  }
  @HostBinding('class.tl-btn-outline') get isOutline() {
    return this.variant === 'outline';
  }
  @HostBinding('class.tl-btn-text') get isText() {
    return this.variant === 'text';
  }

  // Button Sizes
  @HostBinding('class.tl-btn-xs') get isExtraSmall() {
    return this.size === 'xs';
  }
  @HostBinding('class.tl-btn-sm') get isSmall() {
    return this.size === 'sm';
  }
  @HostBinding('class.tl-btn-md') get isMedium() {
    return this.size === 'md';
  }
  @HostBinding('class.tl-btn-lg') get isLarge() {
    return this.size === 'lg';
  }
  @HostBinding('class.tl-btn-xl') get isExtraLarge() {
    return this.size === 'xl';
  }

  // Button Shape
  @HostBinding('class.tl-btn-pill') get isPill() {
    return this.shape === 'pill';
  }
  @HostBinding('class.tl-btn-rounded') get isRounded() {
    return this.shape === 'rounded';
  }
  @HostBinding('class.tl-btn-square') get isSquare() {
    return this.shape === 'square';
  }
  @HostBinding('class.tl-btn-circle') get isCircle() {
    return this.shape === 'circle';
  }

  // Button Loading
  @HostBinding('disabled') get isDisabled(): boolean {
    return this.loading;
  }

  // Button ARIA
  @HostBinding('attr.aria-busy') get isAriaBusy(): boolean {
    return this.loading;
  }
}
