import { afterNextRender, Component, Input, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable {
  isBrowser = signal(false);

  @Input() headers!: ColDef[];
  @Input() data!: object[];

  constructor() {
    afterNextRender(() => {
      this.isBrowser.set(true);
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}
