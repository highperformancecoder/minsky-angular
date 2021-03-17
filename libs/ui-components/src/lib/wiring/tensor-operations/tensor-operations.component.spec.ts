import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TensorOperationsComponent } from './tensor-operations.component';

describe('TensorOperationsComponent', () => {
  let component: TensorOperationsComponent;
  let fixture: ComponentFixture<TensorOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TensorOperationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TensorOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
