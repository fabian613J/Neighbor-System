import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Formularioprod } from './formularioprod';

describe('Formularioprod', () => {
  let component: Formularioprod;
  let fixture: ComponentFixture<Formularioprod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formularioprod],
    }).compileComponents();

    fixture = TestBed.createComponent(Formularioprod);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
