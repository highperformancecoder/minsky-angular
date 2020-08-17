import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WiringComponent } from './wiring.component';

describe('WiringComponent', () => {
  let component: WiringComponent;
  let fixture: ComponentFixture<WiringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WiringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WiringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
