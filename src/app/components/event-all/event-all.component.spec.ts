import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAllComponent } from './event-all.component';

describe('EventAllComponent', () => {
  let component: EventAllComponent;
  let fixture: ComponentFixture<EventAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
