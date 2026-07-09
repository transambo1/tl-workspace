import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[tlTabContent]',
  standalone: true,
})
export class TlTabContentDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
