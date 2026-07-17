import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TlModalComponent } from './modal.component';

describe('Modal', () => {
  let component: TlModalComponent;
  let fixture: ComponentFixture<TlModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TlModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TlModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ignore repeated close requests once the modal has already closed', () => {
    let isOpenEvents = 0;
    let closeEvents = 0;

    component.isOpen = true;
    component.isOpenChange.subscribe(() => {
      isOpenEvents += 1;
    });
    component.Close.subscribe(() => {
      closeEvents += 1;
    });

    component.close();
    component.close();

    expect(isOpenEvents).toBe(1);
    expect(closeEvents).toBe(1);
    expect(component.isOpen).toBe(false);
  });
});
