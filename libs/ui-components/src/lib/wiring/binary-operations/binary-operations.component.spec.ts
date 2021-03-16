import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryOperationsComponent } from './binary-operations.component';

describe('BinaryOperationsComponent', () => {
  let component: BinaryOperationsComponent;
  let fixture: ComponentFixture<BinaryOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BinaryOperationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BinaryOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
