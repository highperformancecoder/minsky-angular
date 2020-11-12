import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionalAnalysisComponent } from './dimensional-analysis.component';

describe('DimensionalAnalysisComponent', () => {
  let component: DimensionalAnalysisComponent;
  let fixture: ComponentFixture<DimensionalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DimensionalAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
