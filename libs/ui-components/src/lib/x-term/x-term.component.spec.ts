import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XTermComponent } from './x-term.component';

describe('XTermComponent', () => {
  let component: XTermComponent;
  let fixture: ComponentFixture<XTermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XTermComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(XTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
