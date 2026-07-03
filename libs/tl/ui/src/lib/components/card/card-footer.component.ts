import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tl-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    class: 'tl-card-footer-host',
  },
  encapsulation: ViewEncapsulation.None,
})
export class TlCardFooterComponent {}
