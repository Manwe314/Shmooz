import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckDisplayWheelComponent } from './deck-display-wheel.component';

describe('DeckDisplayWheelComponent', () => {
  let component: DeckDisplayWheelComponent;
  let fixture: ComponentFixture<DeckDisplayWheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckDisplayWheelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeckDisplayWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
