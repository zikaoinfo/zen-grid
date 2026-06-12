import { Component, signal } from '@angular/core';
import {
  ZenGridComponent,
  textColumn, currencyColumn, dateColumn, booleanColumn, badgeColumn, numberColumn,
} from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { Employee, EMPLOYEES } from './data';

@Component({
  selector: 'app-basic-demo',
  standalone: true,
  imports: [ZenGridComponent],
  template: `
    <div class="toolbar">
      <input
        class="search"
        type="search"
        placeholder="Quick filter across all columns…"
        (input)="onSearch($event)"
      />
      <button class="btn" (click)="exportCsv()">⬇ Export CSV</button>
      <span class="row-count">{{ displayedCount() }} / {{ EMPLOYEES.length }} rows</span>
    </div>
    <zen-grid
      class="grid"
      [columnDefs]="columns"
      [rowData]="EMPLOYEES"
      [options]="options"
      (gridReady)="onGridReady($event)"
      (filterChanged)="onFilterChanged()"
    />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; gap: 12px; }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .search {
      flex: 1;
      max-width: 380px;
      padding: 8px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      background: #fff;

      &:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgb(99 102 241 / 0.12);
      }
    }

    .btn {
      padding: 8px 16px;
      background: #6366f1;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      transition: background 0.15s;

      &:hover { background: #4f46e5; }
    }

    .row-count {
      margin-left: auto;
      color: #64748b;
      font-size: 13px;
    }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class BasicDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;
  private gridApi: GridApi<Employee> | null = null;
  readonly displayedCount = signal(EMPLOYEES.length);

  readonly columns: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',        { headerName: 'Full Name',   flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('department',  { headerName: 'Department',  filter: 'set', width: 160 }),
    textColumn<Employee>('role',        { headerName: 'Role',        flex: 1 }),
    currencyColumn<Employee>('salary',  { headerName: 'Salary' }),
    badgeColumn<Employee>('status',     { headerName: 'Status',      width: 120 }),
    dateColumn<Employee>('startDate',   { headerName: 'Start Date',  width: 130 }),
    numberColumn<Employee>('performance', { headerName: 'Score',     decimals: 0, width: 80 }),
    booleanColumn<Employee>('remote',   { headerName: 'Remote',      width: 90 }),
  ];

  readonly options: GridOptions<Employee> = {
    selection: { mode: 'multiple', checkboxes: true },
    defaultColDef: { sortable: true },
  };

  onGridReady(event: GridReadyEvent<Employee>): void {
    this.gridApi = event.api;
  }

  onFilterChanged(): void {
    this.displayedCount.set(this.gridApi?.getDisplayedRowCount() ?? EMPLOYEES.length);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setQuickFilter(value || null);
    this.displayedCount.set(this.gridApi?.getDisplayedRowCount() ?? EMPLOYEES.length);
  }

  exportCsv(): void {
    this.gridApi?.downloadCsv('employees.csv');
  }
}
