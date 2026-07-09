import {
  Component,
  Input,
  ContentChild,
  TemplateRef,
  ViewChild,
  ContentChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlTabLabelDirective } from './tab-label.directive.component';
import { TlTabContentDirective } from './tab-content.directive.component';

@Component({
  selector: 'tl-tab-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #contentTemplate>
      <ng-content *ngIf="!lazyContent"></ng-content>
    </ng-template>
  `,
})
export class TlTabItemComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  @ContentChild(TlTabLabelDirective) customLabel?: TlTabLabelDirective;
  @ContentChild(TlTabContentDirective) lazyContent?: TlTabContentDirective;

  @ViewChild('contentTemplate', { static: true }) contentTemplate!: TemplateRef<any>;
}
