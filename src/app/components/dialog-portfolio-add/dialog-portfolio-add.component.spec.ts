import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPortfolioAddComponent } from './dialog-portfolio-add.component';

describe('DialogPortfolioAddComponent', () => {
  let component: DialogPortfolioAddComponent;
  let fixture: ComponentFixture<DialogPortfolioAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogPortfolioAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPortfolioAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
