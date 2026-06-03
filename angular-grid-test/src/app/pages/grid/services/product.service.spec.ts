import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import type { Product } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    { sku: 'POL-ROJ-001', name: 'Polera Roja', description: 'Polera Roja Desc', style: { code: 'COL-ROJ', value: 'ROJO' } },
    { sku: 'POL-ROJ-002', name: 'Polera Roja 2.0', description: 'Segunda edicion de Polera Roja', style: { code: 'COL-ROJ', value: 'ROJO' } },
    { sku: 'POL-AZU-001', name: 'Polera Azul', description: 'Polera Azul Desc', style: { code: 'COL-AZU', value: 'AZUL' } },
    { sku: 'POL-VER-001', name: 'Polera Verde', description: 'Polera Verde Desc', style: { code: 'COL-VER', value: 'VERDE' } },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductService,
      ],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products with a single SKU filter', () => {
    service.getProducts(['POL-ROJ-001']).subscribe((products) => {
      expect(products).toEqual([mockProducts[0]]);
    });

    const req = httpMock.expectOne({ method: 'GET' });

    expect(req.request.params.get('sku')).toBe('POL-ROJ-001');

    req.flush([mockProducts[0]]);
  });

  it('should fetch products with multiple SKU filters', () => {
    const skus = ['POL-ROJ-001', 'POL-AZU-001'];

    service.getProducts(skus).subscribe((products) => {
      expect(products).toEqual([mockProducts[0], mockProducts[2]]);
    });

    const req = httpMock.expectOne({ method: 'GET' });

    expect(req.request.params.getAll('sku')).toEqual(skus);

    req.flush([mockProducts[0], mockProducts[2]]);
  });

  it('should return an empty array when no products match', () => {
    service.getProducts(['NON-EXISTENT']).subscribe((products) => {
      expect(products).toEqual([]);
    });

    const req = httpMock.expectOne({ method: 'GET' });

    req.flush([]);
  });

  it('should fetch products with no filter when empty SKU array is provided', () => {
    service.getProducts([]).subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne({ method: 'GET' });

    req.flush(mockProducts);
  });

  it('should return products with correct interface shape', () => {
    service.getProducts(['POL-ROJ-001']).subscribe((products) => {
      const product = products[0];
      expect(product.sku).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.description).toBeDefined();
      expect(product.style).toBeDefined();
      expect(product.style.code).toBeDefined();
      expect(product.style.value).toBeDefined();
    });

    const req = httpMock.expectOne({ method: 'GET' });

    req.flush([mockProducts[0]]);
  });

  it('should handle network errors gracefully', () => {
    let errorResponse: any;

    service.getProducts(['POL-ROJ-001']).subscribe({
      next: () => { throw new Error('expected error'); },
      error: (error) => { errorResponse = error; },
    });

    const req = httpMock.expectOne({ method: 'GET' });

    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(errorResponse.status).toBe(500);
  });
});
