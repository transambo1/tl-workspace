import {
  Component,
  Input,
  OnInit,
  OnChanges,
  Optional,
  Self,
  ChangeDetectorRef,
  HostBinding,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TlIconComponent } from '../../icons/icon.component';
import { generateUniqueId } from '../../utils/string.util';
import { getValidatorMessage } from '../../utils/form-error.util';
import { TLInputType } from './input.component.types';

@Component({
  selector: 'tl-input',
  standalone: true,
  imports: [CommonModule, TlIconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class TlInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  // --- Các Inputs cấu hình API cực mạnh ---
  @Input() label = '';
  @Input() hint = '';
  @Input() placeholder = '';
  @Input() type: TLInputType = 'text';
  @Input() required = false;
  @Input() disabled = false;
  @Input() id = generateUniqueId('tl-input');

  @HostBinding('class.tl-input-disabled') get hostDisabled() {
    return this.disabled;
  }
  @HostBinding('attr.aria-disabled') get hostAriaDisabled() {
    return this.disabled ? 'true' : null;
  }

  showPassword = false;
  nativeType: TLInputType = 'text';

  // --- Giá trị và hàm Callback của ControlValueAccessor ---
  value: any = '';
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private cdr: ChangeDetectorRef,
  ) {
    if (this.ngControl) {
      // Gán accessor trực tiếp để Angular Forms nhận dạng cây cầu kết nối dữ liệu
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.nativeType = this.type;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type']) {
      this.nativeType = this.type;
    }
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(value: any): void {
    this.value = value === null || value === undefined ? '' : value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // --- Xử lý sự kiện tương tác người dùng ---
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onInputBlur(): void {
    this.onTouched();
  }

  // --- Cơ chế ẩn/hiện password mượt mà ---
  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.nativeType = this.showPassword ? 'text' : 'password';
  }

  // --- Lấy thông điệp lỗi tự động từ Form Control ---
  get errorMessage(): string | null {
    if (this.ngControl && this.ngControl.errors && this.ngControl.touched) {
      const errorKeys = Object.keys(this.ngControl.errors);
      if (errorKeys.length > 0) {
        const firstErrorKey = errorKeys[0];
        const errorValue = this.ngControl.errors[firstErrorKey];
        return getValidatorMessage(firstErrorKey, errorValue);
      }
    }
    return null;
  }

  // --- Computed States để gán class CSS tương ứng ---
  get isError(): boolean {
    return !!this.errorMessage;
  }
}
