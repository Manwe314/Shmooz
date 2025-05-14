import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditDeckComponent } from './add-edit-deck.component';

describe('AddEditDeckComponent', () => {
  let component: AddEditDeckComponent;
  let fixture: ComponentFixture<AddEditDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditDeckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
