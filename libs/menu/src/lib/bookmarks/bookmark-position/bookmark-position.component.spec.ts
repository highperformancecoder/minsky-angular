import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkPositionComponent } from './bookmark-position.component';

describe('BookmarkPositionComponent', () => {
  let component: BookmarkPositionComponent;
  let fixture: ComponentFixture<BookmarkPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookmarkPositionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
