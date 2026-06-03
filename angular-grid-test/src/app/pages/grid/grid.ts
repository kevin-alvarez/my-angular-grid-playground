import { Component, inject, signal } from '@angular/core';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { GridApi } from 'ag-grid-community';
import { ProductService } from './services/product.service';
import { Product } from './models/product.model';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './grid.html',
  styleUrl: './grid.css',
})
export class Grid {
  private productService = inject(ProductService);
  private gridApi!: GridApi;
  isLoading = signal(false);
  errorMessage = signal('');
  skuInput = signal('');
  products = signal<Product[]>([]);

  protected readonly columnLabels : ColDef[] = [
    { field: 'sku', headerName:'SKU' },
    { field: 'name', headerName: 'Nombre' },
    { field: 'description', headerName: 'Descripcion' },
    { field: 'style', headerName: 'Estilo', valueGetter: (params) => params.data.style.value },
  ]

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  async loadData(skuInputValue: string) {
    console.log('loading data...');
    this.isLoading.set(true);
    this.errorMessage.set('');
    const skuFilter = skuInputValue.split(',');
    this.productService.getProducts(skuFilter).subscribe({
      next: (data) => {
        this.products.set(data);
        console.log('finished loading data...');
      },
      error: (error) => {
        this.errorMessage.set(`Error obteniendo datos de productos: ${error.error.message}`);
        // console.log('Received Error: ', error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    })
  }
}
