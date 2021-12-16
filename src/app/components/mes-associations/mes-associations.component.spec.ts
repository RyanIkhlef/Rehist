import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesAssociationsComponent } from './mes-associations.component';

describe('MesAssociationsComponent', () => {
  let component: MesAssociationsComponent;
  let fixture: ComponentFixture<MesAssociationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesAssociationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MesAssociationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
