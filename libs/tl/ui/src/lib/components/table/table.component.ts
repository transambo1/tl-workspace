import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import {
  TlColumnDefDirective,
  TlCellDefDirective,
  TlHeaderCellDefDirective,
} from './table-directives.component';
import { TlTruncateTooltipDirective } from './truncate-tooltip.directive';
import { TlIconComponent } from '../../icons/icon.component';
import { deepClone } from '../../utils';

export type TlTableRow = Record<string, unknown>;
export type TlSortOrder = 'asc' | 'desc' | '';

@Component({
  selector: 'tl-table',
  standalone: true,
  imports: [
    CommonModule,
    TlColumnDefDirective,
    TlCellDefDirective,
    TlHeaderCellDefDirective,
    TlTruncateTooltipDirective,
    TlIconComponent,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TlTableComponent<T extends TlTableRow> implements OnChanges, OnInit {
  private destroyRef = inject(DestroyRef);

  private filterSubject = new Subject<string>();
  private currentFilterNormalized = '';

  // ================= INPUTS =================
  @Input() loading = false;
  @Input() dataSource: T[] = [];

  @Input()
  set filterValue(value: string) {
    this.filterSubject.next(value);
  }

  @Input() width = '100%';
  @Input() emptyMessage = 'Không tìm thấy dữ liệu phù hợp!';

  @Input()
  trackBy: (index: number, row: T) => unknown = (_, row) => row['id'] ?? _;

  @Input() pagination = false;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  @Input() serverSide = false;
  @Input() totalRecords = 0;

  @Input() filterPredicate?: (data: T, filter: string) => boolean;

  // ================= OUTPUTS =================
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<{ key: string; order: TlSortOrder }>();

  // ================= STATE =================
  currentPage = 1;
  pagedData: T[] = [];
  processedData: T[] = [];

  sortState: {
    key: string;
    order: TlSortOrder;
  } = {
    key: '',
    order: '',
  };

  // ================= GETTERS =================
  get totalPages(): number {
    const total = this.serverSide ? this.totalRecords : this.processedData.length;
    return Math.ceil(total / this.pageSize) || 1;
  }

  // ================= COLUMN DEFS =================
  @ContentChildren(TlColumnDefDirective)
  columnDefs!: QueryList<TlColumnDefDirective>;

  // ================= LIFECYCLE =================
  ngOnInit(): void {
    this.filterSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.currentFilterNormalized = value.toLowerCase().trim();
        this.currentPage = 1;

        if (this.serverSide) {
          this.pageChange.emit({ pageIndex: this.currentPage, pageSize: this.pageSize });
        } else {
          this.applyFilterAndSort();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] || changes['filterValue']) {
      if (changes['dataSource']) {
        this.currentPage = 1;
      }
      this.applyFilterAndSort();
    }
  }

  // ================= PUBLIC METHODS =================
  sort(key: string, sortable: boolean): void {
    if (!sortable) return;
    this.toggleSort(key);

    if (this.serverSide) {
      this.sortChange.emit({ key: this.sortState.key, order: this.sortState.order });
    } else {
      this.applyFilterAndSort();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;

      if (this.serverSide) {
        this.pageChange.emit({ pageIndex: this.currentPage, pageSize: this.pageSize });
      } else {
        this.applyFilterAndSort();
      }
    }
  }

  onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.pageSize = Number(selectElement.value);
    this.currentPage = 1;

    if (this.serverSide) {
      this.pageChange.emit({ pageIndex: this.currentPage, pageSize: this.pageSize });
    } else {
      this.applyFilterAndSort();
    }
  }

  // ================= PRIVATE METHODS =================
  private toggleSort(key: string): void {
    if (this.sortState.key === key) {
      switch (this.sortState.order) {
        case 'asc':
          this.sortState.order = 'desc';
          break;
        case 'desc':
          this.sortState = { key: '', order: '' };
          break;
        default:
          this.sortState.order = 'asc';
      }
      return;
    }
    this.sortState = { key, order: 'asc' };
  }

  private applyFilterAndSort(): void {
    if (this.serverSide) {
      this.pagedData = this.dataSource;
      return;
    }

    // ✨ HOÀN HẢO: Gọi deepClone bảo hiểm ô nhớ cho dataSource trước khi xử lý lọc/sắp xếp
    let result = deepClone(this.dataSource);
    result = this.applyFilter(result);
    result = this.applySort(result);
    this.processedData = result;

    if (this.pagination) {
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.pagedData = this.processedData.slice(startIndex, endIndex);
    } else {
      this.pagedData = this.processedData;
    }
  }

  private applyFilter(data: T[]): T[] {
    if (!this.currentFilterNormalized) {
      return data;
    }

    if (this.filterPredicate) {
      return data.filter((row) => this.filterPredicate!(row, this.currentFilterNormalized));
    }

    return data.filter((row) =>
      Object.values(row).some((value) => {
        if (value == null) return false;
        if (typeof value === 'object') return false;
        return String(value).toLowerCase().includes(this.currentFilterNormalized);
      }),
    );
  }

  private applySort(data: T[]): T[] {
    const { key, order } = this.sortState;
    if (!key || !order) {
      return data;
    }

    const multiplier = order === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1 * multiplier;
      if (valueB == null) return -1 * multiplier;
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * multiplier;
      }

      return (
        String(valueA).localeCompare(String(valueB), 'vi', {
          numeric: true,
          sensitivity: 'accent',
        }) * multiplier
      );
    });
  }
}
