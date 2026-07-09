import { Directive, Input, TemplateRef, ContentChild } from '@angular/core';

@Directive({
  selector: '[tlCellDef]',
  standalone: true,
})
export class TlCellDefDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  selector: '[tlHeaderCellDef]',
  standalone: true,
})
export class TlHeaderCellDefDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  selector: 'ng-container[tlColumnDef]',
  standalone: true,
})
export class TlColumnDefDirective {
  @Input('tlColumnDef')
  name!: string;

  @Input()
  width?: string;

  @Input()
  align: 'left' | 'center' | 'right' = 'left';

  @Input()
  sortable = false;

  @Input() truncate: boolean = false;

  @ContentChild(TlHeaderCellDefDirective)
  headerCell?: TlHeaderCellDefDirective;

  @ContentChild(TlCellDefDirective)
  cell?: TlCellDefDirective;
}
