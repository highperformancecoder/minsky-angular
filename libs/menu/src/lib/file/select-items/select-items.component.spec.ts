import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectItemsComponent } from './select-items.component';

describe('SelectItemsComponent', () => {
  let component: SelectItemsComponent;
  let fixture: ComponentFixture<SelectItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
