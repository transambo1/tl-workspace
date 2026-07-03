import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tl-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tl-card-header-wrapper">
      <ng-content></ng-content>
    </div>
  `,
  host: {
    class: 'tl-card-header-host',
  },
  encapsulation: ViewEncapsulation.None,
})
export class TlCardHeaderComponent {}
