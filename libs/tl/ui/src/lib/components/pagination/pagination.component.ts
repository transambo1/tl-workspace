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
import { CommonModule } from '@angular/common';
import { SelectComponent } from '../select/select.component';
import { TlIconComponent } from '../../icons/icon.component';
import { generatePageRange } from '../../utils';

export type PaginationType = 'circle' | 'square' | 'text-only';

@Component({
  selector: 'tl-pagination',
  standalone: true,
  imports: [CommonModule, SelectComponent, TlIconComponent],
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

    // Chỉ cập nhật tùy chọn select-box khi mảng cấu hình cấu tùy chọn thay đổi, TRÁNH gán đè cứng reset pageSize
    if (changes['pageSizeOptions'] || !this.selectSizeOptions.length) {
      this.updateSelectOptions();
      if (this.pageSizeOptions && this.pageSizeOptions.length > 0) {
        if (!changes['pageSize'] && this.pageSizeOptions && this.pageSizeOptions.length > 0) {
          this.pageSize = this.pageSizeOptions[0];
          this.calculatePages();
        }
      }
    }
  }

  // Logic tính Pagination
  calculatePages() {
    const total = Number(this.totalItems) || 0;
    const size = Number(this.pageSize) || 10;
    this.totalPages = Math.ceil(total / size) || 1;
    this.pages = generatePageRange(this.currentPage, this.totalPages);
  }

  // --- Quản lí thay đổi page ---
  selectPage(page: number | string) {
    if (typeof page === 'string') return;
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.pageChange.emit(this.currentPage);
    this.currentPageChange.emit(this.currentPage);
    this.calculatePages();
  }

  // --- Thay đổi kích thước trang hiển thị (Dùng cho size changer) ---
  onPageSizeSelect(newSize: string | number | null) {
    if (!newSize) return;
    this.pageSize = Number(newSize);
    this.pageSizeChange.emit(this.pageSize);

    // Khi đổi số dòng hiển thị, lập tức đá người dùng quay về trang 1 để tránh lỗi crash out-of-bound dữ liệu
    this.currentPage = 1;
    this.currentPageChange.emit(this.currentPage);
    this.calculatePages();
  }

  // --- Định dạng dữ liệu truyền cho tl-select ---
  updateSelectOptions() {
    if (!this.pageSizeOptions || this.pageSizeOptions.length === 0) return;

    this.selectSizeOptions = this.pageSizeOptions.map((size) => ({
      label: `${size} / page`,
      value: size,
    }));
  }
}
