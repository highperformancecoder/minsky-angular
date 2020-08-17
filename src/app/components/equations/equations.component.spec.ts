import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquationsComponent } from './equations.component';

describe('EquationsComponent', () => {
  let component: EquationsComponent;
  let fixture: ComponentFixture<EquationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
