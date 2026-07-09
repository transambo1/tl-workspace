import {
  Component,
  Input,
  ViewEncapsulation,
  forwardRef,
  ElementRef,
  Renderer2,
  OnInit,
  AfterViewInit, // ✨ Thay đổi: Sử dụng AfterViewInit thay cho OnInit
  HostListener,
  ViewContainerRef,
  ComponentRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TLInputType } from './input.component.types';
import { TlIconComponent } from '../../icons/icon.component';

@Component({
  selector: 'input[tl-input]',
  standalone: true,
  imports: [CommonModule, TlIconComponent],
  templateUrl: './input.component.html', // Neo vào file HTML giữ chỗ
  styleUrl: './input.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  private _value: string = '';

  @Input() label: string = '';
  @Input() hint: string = '';
  @Input() type: TLInputType = 'text';

  // 🎯 Lấy reference để tránh Tree-shaking của compiler
  @ViewChild('iconContainer', { read: ViewContainerRef, static: false })
  iconContainerRef!: ViewContainerRef;

  private wrapperEl!: HTMLElement;
  private passwordBtn!: HTMLElement;
  private showPassword = false;
  private iconComponentRef!: ComponentRef<TlIconComponent>;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.updateNativeType();
  }

  // 🔥 CHÌA KHÓA HIỂN THỊ UI: Chờ giao diện HTML dựng xong mới bắt đầu nhét Layout động và Icon vào!
  ngAfterViewInit(): void {
    // Dùng setTimeout bọc nhẹ để tránh lỗi "ExpressionChangedAfterItHasBeenCheckedError" của Angular
    setTimeout(() => {
      this.buildDynamicLayout();
    });
  }

  private updateNativeType(): void {
    const inputType = this.showPassword ? 'text' : this.type;
    this.renderer.setProperty(this.el.nativeElement, 'type', inputType);
  }

  private buildDynamicLayout(): void {
    const nativeInput = this.el.nativeElement;
    const parent = nativeInput.parentNode;

    if (!parent || (!this.label && !this.hint && this.type !== 'password')) {
      return;
    }

    // 1. Tạo wrapper bọc ngoài cùng
    this.wrapperEl = this.renderer.createElement('div');
    this.renderer.addClass(this.wrapperEl, 'tl-input-wrapper');
    this.renderer.insertBefore(parent, this.wrapperEl, nativeInput);

    // 2. Tạo Label
    if (this.label) {
      const labelEl = this.renderer.createElement('label');
      this.renderer.addClass(labelEl, 'tl-input-label');
      const labelText = this.renderer.createText(this.label);
      this.renderer.appendChild(labelEl, labelText);
      this.renderer.appendChild(this.wrapperEl, labelEl);
    }

    // 3. Tạo Container chứa input gốc
    const containerEl = this.renderer.createElement('div');
    this.renderer.addClass(containerEl, 'tl-input-field-container');
    this.renderer.appendChild(this.wrapperEl, containerEl);
    this.renderer.appendChild(containerEl, nativeInput);
    this.renderer.addClass(nativeInput, 'tl-input-native');

    // 4. Nếu là password -> Tạo nút bấm và gọi Icon của dự án
    if (this.type === 'password') {
      this.passwordBtn = this.renderer.createElement('button');
      this.renderer.setAttribute(this.passwordBtn, 'type', 'button');
      this.renderer.addClass(this.passwordBtn, 'tl-input-toggle-password');

      // Nhét Icon động từ ViewContainerRef đã sẵn sàng ở HTML
      if (this.iconContainerRef) {
        this.iconComponentRef = this.iconContainerRef.createComponent(TlIconComponent);
        this.iconComponentRef.instance.name = 'eyeOff'; // Ban đầu hiện mắt đóng
        this.iconComponentRef.changeDetectorRef.detectChanges();

        // Bốc cái xác DOM của Icon nhét vào lòng nút bấm
        this.renderer.appendChild(this.passwordBtn, this.iconComponentRef.location.nativeElement);
      }

      this.renderer.listen(this.passwordBtn, 'click', () => this.togglePassword());
      this.renderer.appendChild(containerEl, this.passwordBtn);
    }

    // 5. Tạo Hint
    if (this.hint) {
      const hintEl = this.renderer.createElement('span');
      this.renderer.addClass(hintEl, 'tl-input-hint');
      const hintText = this.renderer.createText(this.hint);
      this.renderer.appendChild(hintEl, hintText);
      this.renderer.appendChild(this.wrapperEl, hintEl);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.updateNativeType();

    // Đổi @Input() name mượt mà và thông báo Angular vẽ lại
    if (this.iconComponentRef) {
      this.iconComponentRef.instance.name = this.showPassword ? 'eye' : 'eyeOff';
      this.iconComponentRef.changeDetectorRef.detectChanges();
    }
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this._value = target.value;
    this.onChange(this._value);
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

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }
}
