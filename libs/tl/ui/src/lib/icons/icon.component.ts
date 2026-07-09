import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TL_ICONS, TlIconName } from './icons.component';

@Component({
  selector: 'tl-icon',
  standalone: true,
  template: '<span style="tl-icon-embed"[innerHTML]="safeSvg"></span>',
  styleUrl: './icon.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TlIconComponent implements OnChanges {
  @Input() name!: TlIconName;
  safeSvg?: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name'] && this.name) {
      const rawSvg = TL_ICONS[this.name];
      this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(rawSvg);
    }
  }
}
