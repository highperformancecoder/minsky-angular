import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectBrowserComponent } from '../../components/menu/file/object-browser/object-browser.component';

describe('ObjectBrowserComponent', () => {
  let component: ObjectBrowserComponent;
  let fixture: ComponentFixture<ObjectBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectBrowserComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
