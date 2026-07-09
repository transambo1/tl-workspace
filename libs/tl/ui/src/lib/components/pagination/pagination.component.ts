import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ContentChild,
  ElementRef,
  AfterContentInit,
} from '@angular/core';
import { SelectComponent } from '../select/select.component';
import { TlIconComponent } from '../../icons/icon.component';
export type PaginationType = 'circle' | 'square' | 'text-only';
@Component({
  selector: 'tl-pagination',
  standalone: true,
  imports: [SelectComponent, TlIconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnChanges, AfterContentInit {
  // --- Cấu hình giao diện và dữ liệu ---
  @Input() variant: PaginationType = 'square';
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() prevLabel: string = '';
  @Input() nextLabel: string = '';

  // --- Bộ chọn số dòng trên mỗi trang (Size Changer) ---
  @Input() showSizeChanger: boolean = false;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Output() pageSizeChange = new EventEmitter<number>();

  // --- Sự kiện đồng bộ số trang (Two-way Binding) ---
  @Output() currentPageChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();

  // --- Biến nội bộ quản lý luồng hiển thị ---
  totalPages: number = 1;
  pages: (number | string)[] = [];
  selectSizeOptions: { label: string; value: number }[] = [];

  // --- Quản lý nội dung tùy biến (Custom Content) ---
  @ContentChild('prev', { read: ElementRef }) prevContent?: ElementRef;
  @ContentChild('next', { read: ElementRef }) nextContent?: ElementRef;
  hasPrevContent = false;
  hasNextContent = false;

  ngAfterContentInit(): void {
    this.hasPrevContent = !!this.prevContent || !!document.querySelector('[prev]');
    this.hasNextContent = !!this.nextContent || !!document.querySelector('[next]');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems'] || changes['pageSize'] || changes['currentPage']) {
      this.calculatePages();
    }
    if (changes['pageSizeOptions'] || !this.selectSizeOptions.length) {
      this.updateSelectOptions();
      if (this.pageSizeOptions && this.pageSizeOptions.length > 0) {
        this.pageSize = this.pageSizeOptions[0];
        this.calculatePages();
      }
    }
  }

  calculatePages() {
    const total = Number(this.totalItems) || 0;
    const size = Number(this.pageSize) || 10;
    this.totalPages = Math.ceil(total / size) || 1;

    const current = this.currentPage;
    const totalPages = this.totalPages;

    let pagesArray: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pagesArray.push(i);
    } else {
      if (current <= 4) {
        pagesArray = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (current >= totalPages - 3) {
        pagesArray = [
          1,
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pagesArray = [1, '...', current - 1, current, current + 1, '...', totalPages];
      }
    }

    this.pages = pagesArray;
  }
  // --- Quản lí thay đổi page) ---
  selectPage(page: number | string) {
    if (typeof page === 'string') return;
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.pageChange.emit(this.currentPage);
    this.currentPageChange.emit(this.currentPage);
  }

  // --- Dùng để thay đổi page/total ---
  onPageSizeSelect(newSize: string | number | null) {
    if (!newSize) return;
    this.pageSize = Number(newSize);
    this.pageSizeChange.emit(this.pageSize);

    this.currentPage = 1;
    this.currentPageChange.emit(this.currentPage);
    this.calculatePages();
  }
  // --- Định dạng dữ liệu truyền cho tl-select ---
  updateSelectOptions() {
    this.selectSizeOptions = this.pageSizeOptions.map((size) => ({
      label: `${size} / ${this.totalItems}`,
      value: size,
    }));
  }
}
