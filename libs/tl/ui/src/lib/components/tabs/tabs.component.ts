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
  HostListener,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlTabItemComponent } from './tab-item.component';
import { generateUniqueId } from '../../utils';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

export type TlTabsPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'tl-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TlTabsComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  @ContentChildren(TlTabItemComponent) tabItems!: QueryList<TlTabItemComponent>;
  @ViewChildren('tabHeader') tabHeaders!: QueryList<ElementRef>;

  @Input() position: TlTabsPosition = 'top';

  // Nhận index từ bên ngoài nếu cần, hoặc tự quản lý nội bộ
  private _activeTabIndex = 0;
  @Input()
  set activeTabIndex(val: number) {
    this._activeTabIndex = val;
    this.updateInkBarPosition();
  }
  get activeTabIndex(): number {
    return this._activeTabIndex;
  }

  inkBarWidth = 0;
  inkBarHeight = 2;
  inkBarLeft = 0;
  inkBarTop = 0;

  tabIds: { buttonId: string; panelId: string }[] = [];
  private tabItemsSubscription?: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    // 3. ỔN ĐỊNH CONTENT SWITCHING DYNAMIC:
    // Theo dõi liên tục sự thay đổi của danh sách tab (thêm/bớt tab động)
    this.tabItemsSubscription = this.tabItems.changes
      .pipe(startWith(this.tabItems))
      .subscribe((items: QueryList<TlTabItemComponent>) => {
        this.generateTabAccessibilityIds(items);
        this.adjustActiveTabOnDynamicChange(items);

        // Đợi DOM cập nhật rồi căn chỉnh lại vị trí thanh Ink Bar
        setTimeout(() => {
          this.updateInkBarPosition();
        }, 0);
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateInkBarPosition();
    }, 0);
  }

  ngOnDestroy(): void {
    this.tabItemsSubscription?.unsubscribe();
  }

  selectTab(index: number, disabled: boolean): void {
    if (disabled) return;

    this.activeTabIndex = index;
    this.updateInkBarPosition();
    this.cdr.detectChanges();
  }

  // 1. HỖ TRỢ PHÍM MŨI TÊN (KEYBOARD SUPPORT):
  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isAllTabsDisabled) return;
    const isVertical = this.position === 'left' || this.position === 'right';
    const items = this.tabItems.toArray();
    let nextIndex = this.activeTabIndex;

    switch (event.key) {
      case 'ArrowRight':
        if (!isVertical) {
          event.preventDefault();
          nextIndex = this.findNextEnabledTabIndex(this.activeTabIndex, 1);
        }
        break;
      case 'ArrowLeft':
        if (!isVertical) {
          event.preventDefault();
          nextIndex = this.findNextEnabledTabIndex(this.activeTabIndex, -1);
        }
        break;
      case 'ArrowDown':
        if (isVertical) {
          event.preventDefault();
          nextIndex = this.findNextEnabledTabIndex(this.activeTabIndex, 1);
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          event.preventDefault();
          nextIndex = this.findNextEnabledTabIndex(this.activeTabIndex, -1);
        }
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = this.findNextEnabledTabIndex(-1, 1);
        break;
      case 'End':
        event.preventDefault();
        nextIndex = this.findNextEnabledTabIndex(items.length, -1);
        break;
      default:
        return; // Không xử lý các phím khác
    }

    if (nextIndex !== this.activeTabIndex) {
      this.selectTab(nextIndex, false);
      this.focusTabHeader(nextIndex);
    }
  }

  get isAllTabsDisabled(): boolean {
    return this.tabItems ? this.tabItems.toArray().every((item) => item.disabled) : true;
  }

  // Tìm kiếm tab khả dụng kế tiếp (bỏ qua tab disabled)
  private findNextEnabledTabIndex(currentIndex: number, step: number): number {
    const items = this.tabItems.toArray();
    const len = items.length;

    if (len === 0) return 0;
    const hasEnabledTab = items.some((item) => !item.disabled);
    if (!hasEnabledTab) {
      return this.activeTabIndex < len ? this.activeTabIndex : 0;
    }

    let startIdx = currentIndex;
    if (currentIndex === -1) {
      startIdx = len - 1;
    } else if (currentIndex === len) {
      startIdx = 0;
    }

    let i = (startIdx + step + len) % len;

    // Chạy vòng lặp tối đa 1 vòng để tìm tab không bị disabled
    while (i !== startIdx) {
      if (!items[i].disabled) {
        return i;
      }
      i = (i + step + len) % len;
    }
    return items[startIdx].disabled ? this.activeTabIndex : startIdx;
  }

  private focusTabHeader(index: number): void {
    setTimeout(() => {
      const headersArray = this.tabHeaders.toArray();
      if (headersArray[index]) {
        (headersArray[index].nativeElement as HTMLElement).focus();
      }
    }, 0);
  }

  // Sinh ID mượt mà dựa trên số lượng tab thực tế tại thời điểm chạy
  private generateTabAccessibilityIds(items: QueryList<TlTabItemComponent>): void {
    this.tabIds = items.toArray().map((_, idx) => ({
      buttonId: generateUniqueId(`tl-tab-btn-${idx}`),
      panelId: generateUniqueId(`tl-tab-panel-${idx}`),
    }));
  }

  // 2. CẢI THIỆN ĐIỀU PHỐI TAB KHI DANH SÁCH THAY ĐỔI ĐỘNG:
  private adjustActiveTabOnDynamicChange(items: QueryList<TlTabItemComponent>): void {
    const itemsArray = items.toArray();
    if (itemsArray.length === 0) return;

    // Nếu tab hiện tại vượt quá số lượng tab hiện có (do bị xóa bớt)
    if (this.activeTabIndex >= itemsArray.length) {
      this.activeTabIndex = this.findNextEnabledTabIndex(itemsArray.length, -1);
    }
    // Nếu tab hiện tại đang bị chuyển sang trạng thái disabled
    else if (itemsArray[this.activeTabIndex].disabled) {
      this.activeTabIndex = this.findNextEnabledTabIndex(this.activeTabIndex, 1);
    }
  }

  private updateInkBarPosition(): void {
    if (!this.tabHeaders) return;
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
