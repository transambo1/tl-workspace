import {
  Component,
  Input,
  Output,
  forwardRef,
  ViewEncapsulation,
  HostListener,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TlSelectionOption } from './select.types';

@Component({
  selector: 'tl-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  constructor(private el: ElementRef) {}

  @Input() options: TlSelectionOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() label: string = '';
  @Input() clearable: boolean = false;

  //--- Cach dung binh thuong khong qua form ---//
  @Input() selectedValue: any = null;
  @Output() selectedValueChange = new EventEmitter<any>();

  // Dùng duy nhất thuộc tính này để quản lý trạng thái khóa cho cả Form và HTML thuần
  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: any) {
    this._disabled = value != null && `${value}` !== 'false';
    if (this._disabled) {
      this.isOpen = false;
    }
  }
  //---------------------------------//

  isOpen = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  toggleDropdown() {
    if (this.disabled) return;

    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  selectOption(option: TlSelectionOption) {
    if (option.disabled || this.disabled) return;
    this.selectedValue = option.value;
    // Thong thuong
    this.selectedValueChange.emit(option.value);
    this.onChange(option.value);
    this.isOpen = false;
  }

  get selectedLabel(): string {
    const selected = this.options.find((opt) => opt.value === this.selectedValue);
    return selected ? selected.label : this.placeholder;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  clearSelection(event: MouseEvent) {
    event.stopPropagation();
    if (this.disabled) return;

    this.selectedValue = null;
    this.selectedValueChange.emit(null);
    this.onChange(null);
    this.onTouched();
  }

  // --- CONTROL VALUE ACCESSOR INTERFACE ---

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
