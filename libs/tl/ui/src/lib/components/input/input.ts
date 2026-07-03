import {
  Component,
  Input,
  HostBinding,
  ViewEncapsulation,
  forwardRef,
  HostListener,
  ElementRef,
  Renderer2,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TLInputType } from './input.types';

@Component({
  selector: 'input[tl-input]',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="tl-input-wrapper">
    <label *ngIf="label" class="tl-input-label">{{ label }}</label>

    <div class="tl-input-field-container">
      <input
        [type]="showPassword ? 'text' : type"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="tl-input-native"
        placeholder=" "
      />

      <button
        *ngIf="type === 'password'"
        type="button"
        class="tl-input-toggle-password"
        (click)="togglePassword()"
      >
        {{ showPassword ? '👁️' : '🔒' }}
      </button>
    </div>

    <span *ngIf="hint" class="tl-input-hint">{{ hint }}</span>
  </div>`,
  styleUrl: './input.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor, OnInit {
  private _value: string = '';

  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() type: TLInputType = 'text';

  showPassword = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.updateNativeType();
  }

  private updateNativeType(): void {
    const inputType = this.showPassword ? 'text' : this.type;
    this.renderer.setProperty(this.el.nativeElement, 'type', inputType);
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.updateNativeType(); // Gọi hàm cập nhật type ngay lập tức
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this._value = value;
    this.onChange(value);
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  writeValue(value: any): void {
    this._value = value || '';
    this.renderer.setProperty(this.el.nativeElement, 'value', this._value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
