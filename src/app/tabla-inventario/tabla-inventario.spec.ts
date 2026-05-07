import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaInventario } from './tabla-inventario';

describe('TablaInventario', () => {
  let component: TablaInventario;
  let fixture: ComponentFixture<TablaInventario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaInventario],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaInventario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
