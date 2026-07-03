import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[tlTabLabel]',
  standalone: true,
})
export class TlTabLabelDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
