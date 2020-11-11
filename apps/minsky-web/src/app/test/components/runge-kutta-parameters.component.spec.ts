import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RungeKuttaParametersComponent } from '../../components/menu/runge-kutta-parameters/runge-kutta-parameters.component';

describe('RungeKuttaParametersComponent', () => {
  let component: RungeKuttaParametersComponent;
  let fixture: ComponentFixture<RungeKuttaParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RungeKuttaParametersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RungeKuttaParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
