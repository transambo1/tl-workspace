import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { TlTabsComponent } from './tabs.component';
import { TlTabItemComponent } from './tab-item.component';
import { By } from '@angular/platform-browser';

// Mock component to simulate real-world usage of the library
@Component({
  standalone: true,
  imports: [TlTabsComponent, TlTabItemComponent],
  template: `
    <tl-tabs>
      <tl-tab-item label="Tab 1">Content 1</tl-tab-item>
      <tl-tab-item label="Tab 2" [disabled]="true">Content 2</tl-tab-item>
      <tl-tab-item label="Tab 3">Content 3</tl-tab-item>
    </tl-tabs>
  `,
})
class TestHostComponent {
  @ViewChild(TlTabsComponent) tabsComponent!: TlTabsComponent;
}

describe('TlTabsComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let tabsComponent: TlTabsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TlTabsComponent, TlTabItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    tabsComponent = hostComponent.tabsComponent;
  });

  it('should initialize with the first tab active by default', () => {
    expect(tabsComponent.activeTabIndex).toBe(0);
    const activePanel = fixture.debugElement.query(By.css('[role="tabpanel"]'));
    expect(activePanel.nativeElement.textContent).toContain('Content 1');
  });

  it('should ignore click events on disabled tabs', () => {
    const tabHeaders = fixture.debugElement.queryAll(By.css('[role="tab"]'));

    // Attempt to click Tab 2 (which is disabled)
    tabHeaders[1].nativeElement.click();
    fixture.detectChanges();

    // The active tab index should remain at 0 (Tab 1)
    expect(tabsComponent.activeTabIndex).toBe(0);
  });

  it('should navigate correctly using arrow keys and skip disabled tabs', fakeAsync(() => {
    const tabContainer = fixture.debugElement.query(By.css('.tl-tabs-container'));

    // Currently on Tab 1 (Index 0). Press ArrowRight -> Should skip Tab 2 (disabled) and activate Tab 3 (Index 2)
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    tabContainer.nativeElement.dispatchEvent(eventRight);
    tick();
    fixture.detectChanges();

    expect(tabsComponent.activeTabIndex).toBe(2);

    // Press ArrowLeft from Tab 3 -> Should skip Tab 2 (disabled) and go back to Tab 1 (Index 0)
    const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    tabContainer.nativeElement.dispatchEvent(eventLeft);
    tick();
    fixture.detectChanges();

    expect(tabsComponent.activeTabIndex).toBe(0);
  }));

  it('should jump to the first and last enabled tabs on Home and End key press', fakeAsync(() => {
    const tabContainer = fixture.debugElement.query(By.css('.tl-tabs-container'));

    // Press End -> Should jump to the last enabled tab (Tab 3 - Index 2)
    const eventEnd = new KeyboardEvent('keydown', { key: 'End' });
    tabContainer.nativeElement.dispatchEvent(eventEnd);
    tick();
    fixture.detectChanges();
    expect(tabsComponent.activeTabIndex).toBe(2);

    // Press Home -> Should jump back to the first enabled tab (Tab 1 - Index 0)
    const eventHome = new KeyboardEvent('keydown', { key: 'Home' });
    tabContainer.nativeElement.dispatchEvent(eventHome);
    tick();
    fixture.detectChanges();
    expect(tabsComponent.activeTabIndex).toBe(0);
  }));
});
