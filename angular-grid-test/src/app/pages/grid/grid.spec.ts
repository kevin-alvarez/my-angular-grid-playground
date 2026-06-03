import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Grid } from './grid';
import { ProductService } from './services/product.service';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import { Observable } from 'rxjs';
import type { Product } from './models/product.model';

describe('Grid', () => {
  let component: Grid;
  let fixture: ComponentFixture<Grid>;

  const mockProducts: Product[] = [
    { sku: 'POL-ROJ-001', name: 'Polera Roja', description: 'Polera Roja Desc', style: { code: 'COL-ROJ', value: 'ROJO' } },
    { sku: 'POL-ROJ-002', name: 'Polera Roja 2.0', description: 'Segunda edicion de Polera Roja', style: { code: 'COL-ROJ', value: 'ROJO' } },
    { sku: 'POL-AZU-001', name: 'Polera Azul', description: 'Polera Azul Desc', style: { code: 'COL-AZU', value: 'AZUL' } },
    { sku: 'POL-VER-001', name: 'Polera Verde', description: 'Polera Verde Desc', style: { code: 'COL-VER', value: 'VERDE' } },
  ];

  const createMockService = () => ({
    getProducts: vi.fn((skus: string[]) =>
      new Observable<Product[]>((subscriber) => {
        setTimeout(() => {
          subscriber.next(mockProducts.filter(p => skus.includes(p.sku)));
          subscriber.complete();
        }, 100);
      })
    ),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grid],
      providers: [
        { provide: ProductService, useValue: createMockService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Grid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty products', () => {
      expect(component.products()).toEqual([]);
    });

    it('should have isLoading initially false', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should have empty skuInput', () => {
      expect(component.skuInput()).toBe('');
    });
  });

  describe('column definitions', () => {
    it('should have 4 columns', () => {
      expect((component as any).columnLabels.length).toBe(4);
    });

    it('should have SKU column with correct field and header', () => {
      const cols = (component as any).columnLabels;
      expect(cols[0].field).toBe('sku');
      expect(cols[0].headerName).toBe('SKU');
    });

    it('should have Name column with correct field and header', () => {
      const cols = (component as any).columnLabels;
      expect(cols[1].field).toBe('name');
      expect(cols[1].headerName).toBe('Nombre');
    });

    it('should have Description column with correct field and header', () => {
      const cols = (component as any).columnLabels;
      expect(cols[2].field).toBe('description');
      expect(cols[2].headerName).toBe('Descripcion');
    });

    it('should have Style column with valueGetter returning style value', () => {
      const cols = (component as any).columnLabels;
      expect(cols[3].field).toBe('style');
      expect(cols[3].headerName).toBe('Estilo');
      expect(typeof cols[3].valueGetter).toBe('function');

      const result = cols[3].valueGetter({ data: { style: { value: 'ROJO' } } });
      expect(result).toBe('ROJO');
    });
  });

  describe('loadData', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set isLoading to true when called', () => {
      component.loadData('POL-ROJ-001');
      expect(component.isLoading()).toBe(true);
      vi.advanceTimersByTime(2000);
    });

    it('should set isLoading to false after completion', async () => {
      component.loadData('POL-ROJ-001');
      await vi.advanceTimersByTimeAsync(2000);
      expect(component.isLoading()).toBe(false);
    });

    it('should call productService.getProducts with split SKUs', async () => {
      const service = TestBed.inject(ProductService) as any;
      component.loadData('POL-ROJ-001,POL-AZU-001');
      await vi.advanceTimersByTimeAsync(2000);
      expect(service.getProducts).toHaveBeenCalledWith(['POL-ROJ-001', 'POL-AZU-001']);
    });

    it('should filter products by a single SKU', async () => {
      component.loadData('POL-ROJ-001');
      await vi.advanceTimersByTimeAsync(2000);
      const products = component.products();
      expect(products.length).toBe(1);
      expect(products[0].sku).toBe('POL-ROJ-001');
    });

    it('should filter products by multiple comma-separated SKUs', async () => {
      component.loadData('POL-ROJ-001,POL-AZU-001');
      await vi.advanceTimersByTimeAsync(2000);
      const products = component.products();
      expect(products.length).toBe(2);
      expect(products.map((p: Product) => p.sku)).toEqual(['POL-ROJ-001', 'POL-AZU-001']);
    });

    it('should return empty array for non-matching SKU', async () => {
      component.loadData('NON-EXISTENT');
      await vi.advanceTimersByTimeAsync(2000);
      expect(component.products().length).toBe(0);
    });

    it('should return empty array for empty string input (no SKUs to filter)', async () => {
      component.loadData('');
      await vi.advanceTimersByTimeAsync(2000);
      expect(component.products().length).toBe(0);
    });

    it('should pass whitespace-preserved SKUs to service (split does not trim)', async () => {
      const service = TestBed.inject(ProductService) as any;
      component.loadData('POL-ROJ-001, POL-AZU-001');
      await vi.advanceTimersByTimeAsync(2000);
      expect(service.getProducts).toHaveBeenCalledWith(['POL-ROJ-001', ' POL-AZU-001']);
    });
  });

  describe('template rendering', () => {
    it('should render title', () => {
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('h1');
      expect(title?.textContent).toContain('Grid Page!');
    });

    it('should render input and button', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
    });

    describe('loading state', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should show loading spinner while isLoading is true', () => {
        component.loadData('POL-ROJ-001');
        fixture.detectChanges();
        const spinner = fixture.nativeElement.querySelector('.animate-spin');
        expect(spinner).toBeTruthy();
        vi.advanceTimersByTime(2000);
      });

      it('should hide loading spinner after loadData completes', async () => {
        component.loadData('POL-ROJ-001');
        await vi.advanceTimersByTimeAsync(2000);
        fixture.detectChanges();
        const spinner = fixture.nativeElement.querySelector('.animate-spin');
        expect(spinner).toBeFalsy();
      });

      it('should render ag-grid-angular after loading completes', async () => {
        component.loadData('POL-ROJ-001');
        await vi.advanceTimersByTimeAsync(2000);
        fixture.detectChanges();
        const gridElement = fixture.nativeElement.querySelector('ag-grid-angular');
        expect(gridElement).toBeTruthy();
      });

      it('should disable button while loading', () => {
        component.loadData('POL-ROJ-001');
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        vi.advanceTimersByTime(2000);
      });

      it('should enable button after loading completes', async () => {
        component.loadData('POL-ROJ-001');
        await vi.advanceTimersByTimeAsync(2000);
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        expect(button.disabled).toBe(false);
      });
    });
  });
});
