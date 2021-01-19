import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GodleyTableComponent } from './godley-table.component';

describe('GodleyTableComponent', () => {
  let component: GodleyTableComponent;
  let fixture: ComponentFixture<GodleyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GodleyTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GodleyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
