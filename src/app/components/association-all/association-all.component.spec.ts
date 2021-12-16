import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationAllComponent } from './association-all.component';

describe('AssociationDetailsComponent', () => {
  let component: AssociationAllComponent;
  let fixture: ComponentFixture<AssociationAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociationAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociationAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
