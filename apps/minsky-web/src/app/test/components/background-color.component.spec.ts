import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundColorComponent } from '../../components/menu/options/background-color/background-color.component';

describe('BackgroundColorComponent', () => {
  let component: BackgroundColorComponent;
  let fixture: ComponentFixture<BackgroundColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BackgroundColorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
