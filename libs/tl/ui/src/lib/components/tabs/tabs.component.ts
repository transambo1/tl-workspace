import {
  Component,
  ContentChildren,
  QueryList,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlTabItemComponent } from './tab-item.component';
import { generateUniqueId } from '../../utils';

export type TlTabsPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'tl-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TlTabsComponent implements AfterContentInit, AfterViewInit {
  @ContentChildren(TlTabItemComponent) tabItems!: QueryList<TlTabItemComponent>;
  @ViewChildren('tabHeader') tabHeaders!: QueryList<ElementRef>;

  @Input() position: TlTabsPosition = 'top';
  activeTabIndex = 0;
  inkBarWidth = 0;
  inkBarHeight = 2;
  inkBarLeft = 0;
  inkBarTop = 0;

  tabIds: { buttonId: string; panelId: string }[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    if (this.tabItems.length > 0) {
      this.activeTabIndex = 0;
    }
    this.generateTabAccessibilityIds();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateInkBarPosition();
    }, 0);
  }

  selectTab(index: number, disabled: boolean): void {
    if (disabled) return;

    this.activeTabIndex = index;
    this.updateInkBarPosition();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  private generateTabAccessibilityIds(): void {
    this.tabIds = this.tabItems.toArray().map((_, idx) => ({
      buttonId: generateUniqueId(`tl-tab-btn-${idx}`),
      panelId: generateUniqueId(`tl-tab-panel-${idx}`),
    }));
  }

  private updateInkBarPosition(): void {
    const headersArray = this.tabHeaders.toArray();
    if (headersArray.length === 0 || !headersArray[this.activeTabIndex]) return;

    const activeHeaderElem = headersArray[this.activeTabIndex].nativeElement as HTMLElement;

    if (this.position === 'top' || this.position === 'bottom') {
      this.inkBarWidth = activeHeaderElem.offsetWidth;
      this.inkBarLeft = activeHeaderElem.offsetLeft;
      this.inkBarHeight = 2;
      this.inkBarTop = 0;
    } else {
      this.inkBarHeight = activeHeaderElem.offsetHeight;
      this.inkBarTop = activeHeaderElem.offsetTop;
      this.inkBarWidth = 2;
      this.inkBarLeft = 0;
    }
    this.cdr.detectChanges();
  }
}
