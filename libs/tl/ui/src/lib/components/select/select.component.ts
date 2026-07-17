import {
  Component,
  Input,
  Output,
  forwardRef,
  ViewEncapsulation,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef,
  Optional,
  HostListener,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TlSelectionOption } from './select.component.types';
import { TlIconComponent } from '../../icons/icon.component';
import { getValidatorMessage } from '../../utils/form-error.util';

let nextId = 0;

@Component({
  selector: 'tl-select',
  standalone: true,
  imports: [CommonModule, TlIconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.tl-select-disabled]': 'disabled',
    '[class.tl-select-invalid]': 'isError',
  },
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: TlSelectionOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() label = '';
  @Input() hint = '';
  @Input() clearable = false;

  @Input() selectedValue: any = null;
  @Output() selectedValueChange = new EventEmitter<any>();

  isOpen = false;
  focusedIndex = -1;
  isFocused = false;

  selectId = `tl-select-${nextId++}`;

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

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // --- GETTER PHÁT HIỆN VALIDATION LỖI (Đồng bộ giống Input Component) ---
  get isError(): boolean {
    if (!this.ngControl) return false;
    const { dirty, touched, invalid } = this.ngControl;
    return !!(invalid && (dirty || touched));
  }

  get errorMessage(): string | null {
    if (!this.isError || !this.ngControl || !this.ngControl.errors) return null;
    const errorKeys = Object.keys(this.ngControl.errors);
    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      const errorValue = this.ngControl.errors[firstErrorKey];
      return getValidatorMessage(firstErrorKey, errorValue);
    }
    return null;
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.focusedIndex = this.options.findIndex((opt) => opt.value === this.selectedValue);
      if (this.focusedIndex === -1) {
        this.focusedIndex = 0;
      }
    } else {
      this.onTouched();
    }
  }

  selectOption(option: TlSelectionOption, index: number): void {
    if (option.disabled || this.disabled) return;
    this.selectedValue = option.value;
    this.focusedIndex = index;
    this.selectedValueChange.emit(option.value);
    this.onChange(option.value);
    this.isOpen = false;
    this.onTouched();
  }

  get selectedLabel(): string {
    const selected = this.options.find((opt) => opt.value === this.selectedValue);
    return selected ? selected.label : this.placeholder;
  }

  // Click ra ngoài thì đóng an toàn, bảo vệ scrollbar click
  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.isOpen = false;
        this.onTouched();
        this.cdr.markForCheck();
      }
      this.isFocused = false;
    }
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.selectedValue = null;
    this.selectedValueChange.emit(null);
    this.onChange(null);
    this.onTouched();
  }

  onFocus(): void {
    if (this.disabled) return;
    this.isFocused = true;
  }

  onBlur(): void {
    this.onTouched();
  }

  // --- HỖ TRỢ ĐIỀU HƯỚNG BÀN PHÍM ---
  handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen) {
          this.toggleDropdown();
        } else if (this.focusedIndex >= 0 && this.focusedIndex < this.options.length) {
          const option = this.options[this.focusedIndex];
          if (!option.disabled) {
            this.selectOption(option, this.focusedIndex);
          }
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.toggleDropdown();
        } else {
          this.moveFocus(1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) {
          this.toggleDropdown();
        } else {
          this.moveFocus(-1);
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (this.isOpen) {
          this.isOpen = false;
          this.onTouched();
        }
        break;

      case 'Tab':
        if (this.isOpen) {
          this.isOpen = false;
          this.onTouched();
        }
        break;
    }
  }

  private moveFocus(direction: number): void {
    const len = this.options.length;
    if (len === 0) return;

    let nextIndex = this.focusedIndex;
    do {
      nextIndex = (nextIndex + direction + len) % len;
    } while (this.options[nextIndex]?.disabled && nextIndex !== this.focusedIndex);

    if (!this.options[nextIndex]?.disabled) {
      this.focusedIndex = nextIndex;
      this.scrollOptionIntoView(nextIndex);
    }
  }

  private scrollOptionIntoView(index: number): void {
    setTimeout(() => {
      const dropdownEl = this.el.nativeElement.querySelector('.tl-select-options');
      const optionEl = this.el.nativeElement.querySelector(
        `.tl-select-option:nth-child(${index + 1})`,
      );
      if (dropdownEl && optionEl) {
        const dropdownRect = dropdownEl.getBoundingClientRect();
        const optionRect = optionEl.getBoundingClientRect();

        if (optionRect.bottom > dropdownRect.bottom) {
          dropdownEl.scrollTop += optionRect.bottom - dropdownRect.bottom;
        } else if (optionRect.top < dropdownRect.top) {
          dropdownEl.scrollTop -= dropdownRect.top - optionRect.top;
        }
      }
    });
  }

  // --- ControlValueAccessor ---
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  writeValue(value: any): void {
    this.selectedValue = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
