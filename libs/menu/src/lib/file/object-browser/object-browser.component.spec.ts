import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectBrowserComponent } from './object-browser.component';

describe('ObjectBrowserComponent', () => {
  let component: ObjectBrowserComponent;
  let fixture: ComponentFixture<ObjectBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectBrowserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
