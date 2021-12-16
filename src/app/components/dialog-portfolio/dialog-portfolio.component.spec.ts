import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPortfolioComponent } from './dialog-portfolio.component';

describe('DialogPortfolioComponent', () => {
  let component: DialogPortfolioComponent;
  let fixture: ComponentFixture<DialogPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogPortfolioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
