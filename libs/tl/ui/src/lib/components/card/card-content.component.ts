import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tl-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    class: 'tl-card-content-host',
  },
  encapsulation: ViewEncapsulation.None,
})
export class TlCardContentComponent {}
