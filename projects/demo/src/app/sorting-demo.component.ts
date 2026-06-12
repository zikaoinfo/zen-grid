import { Component, linkedSignal, signal } from '@angular/core';
import { ZenGridComponent, textColumn, currencyColumn, badgeColumn, numberColumn } from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { SplitPaneComponent } from './split-pane.component';
import type { CodeTab } from './code-panel.component';
import { Employee, EMPLOYEES } from './data';

const CODE_SORT = `import { GridOptions } from 'zen-grid';

// Enable sorting on all columns via defaultColDef
const options: GridOptions<Employee> = {
  defaultColDef: { sortable: true },
};

// Or control per-column
textColumn<Employee>('name',   { sortable: true  })
textColumn<Employee>('id',     { sortable: false })

// Custom comparator
textColumn<Employee>('name', {
  comparator: (a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
})

// Multi-sort: hold Shift and click additional headers.
// Listen to sort changes:
// (sortChanged)="onSortChanged($event)"
// event.sortModel = [
//   { colId: 'department', direction: 'asc',  priority: 0 },
//   { colId: 'salary',     direction: 'desc', priority: 1 },
// ]`;

const CODE_FILTER = `// Text filter (default — contains / equals / starts-with...)
textColumn<Employee>('role', { filter: 'text' })

// Set filter — dropdown with unique values
textColumn<Employee>('department', { filter: 'set' })

// Number range filter
currencyColumn<Employee>('salary', { filter: 'number' })

// Date range filter
dateColumn<Employee>('startDate', { filter: 'date' })

// Quick filter across all columns (programmatic)
gridApi.setQuickFilter('engineering');
gridApi.setQuickFilter(null); // clear`;

@Component({
  selector: 'app-sorting-demo',
  standalone: true,
  imports: [ZenGridComponent, SplitPaneComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>Sort &amp; Filter</h2>
        <p>
          Click any column header to sort. Hold <kbd>Shift</kbd> and click
          another header for multi-sort. Use the funnel icon on a header to open
          the column filter; the search box applies a quick filter across all
          visible columns.
        </p>
      </div>
      <app-split-pane [codeTabs]="codeTabs">
        <div class="demo">
          <div class="toolbar">
            <input
              class="search"
              type="search"
              placeholder="Quick filter across all columns..."
              (input)="onSearch($event)"
            />
            <span class="hint">Shift-click headers to multi-sort</span>
            <span class="row-count">{{ displayed() }} / {{ EMPLOYEES.length }} rows</span>
          </div>
          <zen-grid
            class="grid"
            [columnDefs]="columns"
            [rowData]="EMPLOYEES"
            [options]="options"
            (gridReady)="onGridReady($event)"
            (filterChanged)="onFilterChanged()"
          />
        </div>
      </app-split-pane>
    </div>
  `,
  styles: [`
    :host { display: flex; flex: 1; overflow: hidden; min-width: 0; }

    .page { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

    .intro {
      padding: 16px 24px; background: #12131f;
      border-bottom: 1px solid #1a1b2e; flex-shrink: 0;
      h2  { font-size: 16px; font-weight: 600; color: #cdd6f4; margin: 0 0 4px; }
      p   { font-size: 13px; color: #6c7086; margin: 0; line-height: 1.5; }
      kbd {
        display: inline-block; padding: 1px 5px; border-radius: 4px;
        background: #1e1f38; border: 1px solid #313244;
        color: #cdd6f4; font-size: 11px; font-family: inherit;
      }
    }

    .demo {
      flex: 1; min-width: 0; display: flex; flex-direction: column;
      padding: 16px 20px; gap: 10px; background: #f8fafc;
    }

    .toolbar { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

    .search {
      flex: 1; max-width: 320px; padding: 8px 14px;
      border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 13px; font-family: inherit; outline: none; background: #fff;
      &:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgb(99 102 241 / 0.12); }
    }

    .hint { font-size: 12px; color: #94a3b8; }

    .row-count { margin-left: auto; font-size: 13px; color: #64748b; white-space: nowrap; }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class SortingDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;
  private gridApi: GridApi<Employee> | null = null;
  readonly displayed = linkedSignal(() => EMPLOYEES.length);

  readonly columns: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',        { headerName: 'Name',       flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('department',  { headerName: 'Department', filter: 'set', width: 160 }),
    textColumn<Employee>('role',        { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary',  { headerName: 'Salary',     filter: 'number' }),
    badgeColumn<Employee>('status',     { headerName: 'Status',     width: 120 }),
    numberColumn<Employee>('performance', { headerName: 'Score',    decimals: 0, filter: 'number', width: 80 }),
  ];

  readonly options: GridOptions<Employee> = {
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'Sorting',   code: CODE_SORT   },
    { label: 'Filtering', code: CODE_FILTER },
  ];

  onGridReady(event: GridReadyEvent<Employee>): void { this.gridApi = event.api; }
  onFilterChanged(): void { this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? EMPLOYEES.length); }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setQuickFilter(value || null);
    this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? EMPLOYEES.length);
  }
}
