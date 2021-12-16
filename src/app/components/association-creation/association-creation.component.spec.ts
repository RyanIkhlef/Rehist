import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationCreationComponent } from './association-creation.component';

describe('AssociationCreationComponent', () => {
  let component: AssociationCreationComponent;
  let fixture: ComponentFixture<AssociationCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociationCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociationCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
