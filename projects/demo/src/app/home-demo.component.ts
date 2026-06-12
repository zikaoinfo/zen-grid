import { Component, signal } from '@angular/core';
import {
  ZenGridComponent,
  textColumn, currencyColumn, dateColumn, booleanColumn, badgeColumn, numberColumn,
} from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent, SelectionChangedEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { CodePanelComponent } from './code-panel.component';
import type { CodeTab } from './code-panel.component';
import { Employee, EMPLOYEES } from './data';

const CODE_TS = `import { Component, signal } from '@angular/core';
import {
  ZenGridComponent,
  textColumn, currencyColumn, dateColumn,
  booleanColumn, badgeColumn, numberColumn,
} from 'zen-grid';
import type {
  ColDefOrGroup, GridOptions,
  GridReadyEvent, SelectionChangedEvent,
} from 'zen-grid';
import type { GridApi } from 'zen-grid';

@Component({
  standalone: true,
  imports: [ZenGridComponent],
  template: \`
    <zen-grid
      [columnDefs]="grouped() ? groupedCols : flatCols"
      [rowData]="rows"
      [options]="options"
      (gridReady)="onGridReady($event)"
      (selectionChanged)="onSelectionChanged($event)"
      (filterChanged)="onFilterChanged()"
    />
  \`,
})
export class ShowcaseComponent {
  private gridApi: GridApi<Employee> | null = null;
  readonly grouped  = signal(false);
  readonly selected = signal(0);
  readonly displayed = signal(rows.length);

  readonly flatCols: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',       { headerName: 'Name',       flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('department', { headerName: 'Department', filter: 'set', width: 160 }),
    textColumn<Employee>('role',       { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary', { headerName: 'Salary' }),
    badgeColumn<Employee>('status',    { headerName: 'Status',     width: 120 }),
    dateColumn<Employee>('startDate',  { headerName: 'Start',      width: 130 }),
    numberColumn<Employee>('performance', { headerName: 'Score',   decimals: 0, width: 80 }),
    booleanColumn<Employee>('remote',  { headerName: 'Remote',     width: 90 }),
  ];

  readonly groupedCols: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',       { headerName: 'Name',       flex: 1.5 }),
    textColumn<Employee>('department', { headerName: 'Department', rowGroup: true, hide: true }),
    textColumn<Employee>('role',       { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary', { headerName: 'Avg Salary', aggFunc: 'avg' }),
    badgeColumn<Employee>('status',    { headerName: 'Status',     width: 120 }),
    numberColumn<Employee>('performance', {
      headerName: 'Avg Score', decimals: 1, aggFunc: 'avg', width: 100,
    }),
  ];

  readonly options: GridOptions<Employee> = {
    selection: { mode: 'multiple', checkboxes: true },
    grouping: {},
    defaultColDef: { sortable: true },
  };

  onGridReady(e: GridReadyEvent<Employee>) { this.gridApi = e.api; }

  onSelectionChanged(e: SelectionChangedEvent<Employee>) {
    this.selected.set(e.selectedRows.length);
  }

  onFilterChanged() {
    this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? rows.length);
  }
}`;

@Component({
  selector: 'app-home-demo',
  standalone: true,
  imports: [ZenGridComponent, CodePanelComponent],
  template: `
    <div class="home">
      <div class="hero">
        <div class="hero-left">
          <h1 class="hero-title">zen-grid</h1>
          <p class="hero-sub">
            Signal-native Angular data grid — blazing fast, zero boilerplate
          </p>
          <div class="hero-badges">
            <span class="hbadge">Signals</span>
            <span class="hbadge">Zoneless</span>
            <span class="hbadge">TypeScript</span>
            <span class="hbadge">Virtual Scroll</span>
            <span class="hbadge">Open Source</span>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-n">500</span><span class="stat-l">rows</span></div>
          <div class="stat"><span class="stat-n">8</span><span class="stat-l">columns</span></div>
          <div class="stat"><span class="stat-n">6</span><span class="stat-l">types</span></div>
        </div>
      </div>

      <div class="demo-body">
        <div class="demo-side">
          <div class="toolbar">
            <input
              class="search"
              type="search"
              placeholder="Search all columns..."
              (input)="onSearch($event)"
            />
            <button
              class="btn-toggle"
              [class.on]="grouped()"
              (click)="toggleGrouped()"
            >{{ grouped() ? 'Ungroup' : 'Group by Dept' }}</button>
            @if (selected() > 0) {
              <span class="sel-pill">{{ selected() }} selected</span>
            }
            <button class="btn-export" (click)="exportCsv()">Export CSV</button>
            <span class="row-count">{{ displayed() }} / {{ EMPLOYEES.length }}</span>
          </div>

          <zen-grid
            class="grid"
            [columnDefs]="grouped() ? groupedCols : flatCols"
            [rowData]="EMPLOYEES"
            [options]="options"
            (gridReady)="onGridReady($event)"
            (filterChanged)="onFilterChanged()"
            (selectionChanged)="onSelectionChanged($event)"
          />
        </div>

        <app-code-panel [tabs]="codeTabs" />
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex: 1; overflow: hidden; min-width: 0; }

    .home { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

    /* Hero */
    .hero {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 28px 18px;
      background: linear-gradient(135deg, #12131f 0%, #1a1b38 100%);
      border-bottom: 1px solid #1e1f38;
      flex-shrink: 0;
    }
    .hero-title { font-size: 28px; font-weight: 800; color: #cdd6f4; letter-spacing: -0.5px; margin: 0 0 4px; }
    .hero-sub { font-size: 13px; color: #6c7086; margin: 0 0 12px; }
    .hero-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .hbadge {
      padding: 3px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600;
      background: rgb(99 102 241 / 0.15);
      border: 1px solid rgb(99 102 241 / 0.35);
      color: #a5b4fc;
    }
    .hero-stats { display: flex; gap: 32px; }
    .stat { text-align: center; }
    .stat-n { display: block; font-size: 30px; font-weight: 700; color: #6366f1; line-height: 1; }
    .stat-l { display: block; font-size: 11px; color: #585b70; margin-top: 3px; }

    /* Demo body */
    .demo-body { display: flex; flex: 1; overflow: hidden; }

    .demo-side {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column;
      padding: 14px 16px 16px;
      gap: 10px;
      background: #0f172a;
    }

    /* Toolbar */
    .toolbar { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .search {
      flex: 1; max-width: 280px;
      padding: 7px 12px;
      background: #1e1f38; border: 1px solid #313244;
      border-radius: 7px; color: #cdd6f4;
      font-size: 13px; font-family: inherit; outline: none;
      &::placeholder { color: #585b70; }
      &:focus { border-color: #6366f1; }
    }
    .btn-toggle {
      padding: 7px 14px;
      background: transparent; border: 1px solid #313244;
      border-radius: 7px; color: #7f849c;
      font-size: 12px; font-family: inherit; cursor: pointer;
      transition: all 0.12s; white-space: nowrap;
      &:hover { border-color: #6366f1; color: #cdd6f4; }
      &.on { background: rgb(99 102 241 / 0.18); border-color: #6366f1; color: #a5b4fc; }
    }
    .sel-pill {
      padding: 4px 10px; border-radius: 20px;
      font-size: 12px; color: #a5b4fc;
      background: rgb(99 102 241 / 0.15);
      border: 1px solid rgb(99 102 241 / 0.3);
      white-space: nowrap;
    }
    .btn-export {
      margin-left: auto;
      padding: 7px 14px;
      background: #6366f1; border: none;
      border-radius: 7px; color: #fff;
      font-size: 12px; font-family: inherit; cursor: pointer;
      transition: background 0.12s; white-space: nowrap;
      &:hover { background: #4f46e5; }
    }
    .row-count { font-size: 12px; color: #585b70; white-space: nowrap; }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class HomeDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;
  private gridApi: GridApi<Employee> | null = null;
  readonly grouped   = signal(false);
  readonly displayed = signal(EMPLOYEES.length);
  readonly selected  = signal(0);

  readonly flatCols: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',        { headerName: 'Name',       flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('department',  { headerName: 'Department', filter: 'set', width: 160 }),
    textColumn<Employee>('role',        { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary',  { headerName: 'Salary' }),
    badgeColumn<Employee>('status',     { headerName: 'Status',     width: 120 }),
    dateColumn<Employee>('startDate',   { headerName: 'Start',      width: 130 }),
    numberColumn<Employee>('performance', { headerName: 'Score',    decimals: 0, width: 80 }),
    booleanColumn<Employee>('remote',   { headerName: 'Remote',     width: 90 }),
  ];

  readonly groupedCols: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',        { headerName: 'Name',       flex: 1.5 }),
    textColumn<Employee>('department',  { headerName: 'Department', rowGroup: true, hide: true }),
    textColumn<Employee>('role',        { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary',  { headerName: 'Avg Salary', aggFunc: 'avg' }),
    badgeColumn<Employee>('status',     { headerName: 'Status',     width: 120 }),
    numberColumn<Employee>('performance', {
      headerName: 'Avg Score', decimals: 1, aggFunc: 'avg', width: 100,
    }),
  ];

  readonly options: GridOptions<Employee> = {
    selection: { mode: 'multiple', checkboxes: true },
    grouping: {},
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'TypeScript', code: CODE_TS },
  ];

  onGridReady(event: GridReadyEvent<Employee>): void {
    this.gridApi = event.api;
  }

  onFilterChanged(): void {
    this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? EMPLOYEES.length);
  }

  onSelectionChanged(event: SelectionChangedEvent<Employee>): void {
    this.selected.set(event.selectedRows.length);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setQuickFilter(value || null);
    this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? EMPLOYEES.length);
  }

  toggleGrouped(): void { this.grouped.update(v => !v); }

  exportCsv(): void {
    this.gridApi?.downloadCsv('employees.csv');
  }
}
