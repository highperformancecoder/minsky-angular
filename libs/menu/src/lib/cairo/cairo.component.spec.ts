import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CairoComponent } from './cairo.component';

describe('CairoComponent', () => {
  let component: CairoComponent;
  let fixture: ComponentFixture<CairoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CairoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CairoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
