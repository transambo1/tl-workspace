import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tl-card',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrl: './card.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TlCardComponent {}
