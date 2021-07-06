import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleKeyOperationComponent } from './multiple-key-operation.component';

describe('MultipleKeyOperationComponent', () => {
  let component: MultipleKeyOperationComponent;
  let fixture: ComponentFixture<MultipleKeyOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleKeyOperationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleKeyOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
