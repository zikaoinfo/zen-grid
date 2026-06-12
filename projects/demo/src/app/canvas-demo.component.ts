import { Component, signal } from '@angular/core';
import { ZenGridComponent, textColumn, numberColumn, booleanColumn, currencyColumn } from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { SplitPaneComponent } from './split-pane.component';
import type { CodeTab } from './code-panel.component';

interface Row {
  id: number;
  name: string;
  department: string;
  salary: number;
  score: number;
  active: boolean;
}

const DEPTS = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Legal', 'Support'];

function generateRows(n: number): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < n; i++) {
    rows.push({
      id:         i + 1,
      name:       `Employee ${String(i + 1).padStart(6, '0')}`,
      department: DEPTS[i % DEPTS.length],
      salary:     40_000 + (i % 80_001),
      score:      (i % 100) + 1,
      active:     i % 5 !== 4,
    });
  }
  return rows;
}

const CODE_HOW = `/**
 * zen-grid ships its own virtual scroll engine — no CDK Virtual Scroll,
 * no ag-Grid, no other third-party dependency required.
 *
 * VirtualScrollEngine maintains:
 *  - rowRange()   : { start, end }  — only visible rows
 *  - offsetOf(i)  : px top of row i
 *  - totalHeight(): total scroll height (drives the spacer div)
 *
 * The component template renders ONLY the rows in that window:
 *
 *   @for (slot of slots(); track slot.poolKey) {
 *     <div class="zen-row" [style.top.px]="slot.top"> ... </div>
 *   }
 *
 * Slot poolKey recycles DOM nodes across scroll frames, keeping
 * layout / style recalculations minimal even at 100k rows.
 */

// Usage — no extra config needed, works for any row count:
const options: GridOptions<Row> = {
  getRowId: (row) => row.id,   // stable identity — avoids full re-renders
  defaultColDef: { sortable: true },
};`;

const CODE_CANVAS = `// For 100k+ read-only rows, switch to canvas mode for maximum throughput.
// zen-grid paints rows onto an offscreen <canvas> — zero DOM layout pressure.

const options: GridOptions<Row> = {
  renderMode: 'canvas',        // <-- paint to canvas instead of DOM
  getRowId: (row) => row.id,
  defaultColDef: { sortable: true },
};

// Canvas mode trade-offs vs. DOM:
// PRO  zero DOM nodes for rows → fastest possible scroll at any row count
// CON  no Angular cell renderer components
// CON  no CSS :hover / :focus on cells
// CON  editing is not supported in canvas mode`;

@Component({
  selector: 'app-canvas-demo',
  standalone: true,
  imports: [ZenGridComponent, SplitPaneComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>100 000 Rows — Virtual Scroll</h2>
        <p>
          zen-grid's virtual scroll engine is built-in — no CDK, no external
          library. Only the ~20 visible rows exist in the DOM at any time.
          Slot pooling recycles those DOM nodes across scroll frames.
        </p>
      </div>
      <app-split-pane [codeTabs]="codeTabs">
        <div class="demo">
          <div class="toolbar">
            <input
              class="search"
              type="search"
              placeholder="Filter rows..."
              (input)="onSearch($event)"
            />
            @if (renderMs() !== null) {
              <span class="perf-badge">Ready in {{ renderMs() }} ms &middot; {{ rows.length.toLocaleString() }} rows</span>
            }
            <span class="row-count">{{ displayed().toLocaleString() }} / {{ rows.length.toLocaleString() }} visible</span>
          </div>
          <zen-grid
            class="grid"
            [columnDefs]="columns"
            [rowData]="rows"
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
      h2   { font-size: 16px; font-weight: 600; color: #cdd6f4; margin: 0 0 4px; }
      p    { font-size: 13px; color: #6c7086; margin: 0; line-height: 1.5; }
    }

    .demo {
      flex: 1; min-width: 0; display: flex; flex-direction: column;
      padding: 16px 20px; gap: 10px; background: #f8fafc;
    }

    .toolbar { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

    .search {
      flex: 1; max-width: 280px; padding: 8px 14px;
      border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 13px; font-family: inherit; outline: none; background: #fff;
      &:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgb(99 102 241 / 0.12); }
    }

    .perf-badge {
      padding: 5px 12px; border-radius: 20px;
      font-size: 12px; font-weight: 600; white-space: nowrap;
      background: #d1fae5; color: #065f46;
    }

    .row-count { margin-left: auto; font-size: 13px; color: #64748b; white-space: nowrap; }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class CanvasDemoComponent {
  private readonly initTime = Date.now();
  private gridApi: GridApi<Row> | null = null;

  readonly rows: Row[]    = generateRows(100_000);
  readonly renderMs       = signal<number | null>(null);
  readonly displayed      = signal(this.rows.length);

  readonly columns: ColDefOrGroup<Row>[] = [
    numberColumn<Row>('id',         { headerName: 'ID',         decimals: 0, width: 90 }),
    textColumn<Row>('name',         { headerName: 'Name',       flex: 1.5 }),
    textColumn<Row>('department',   { headerName: 'Department', filter: 'set', width: 160 }),
    currencyColumn<Row>('salary',   { headerName: 'Salary' }),
    numberColumn<Row>('score',      { headerName: 'Score',      decimals: 0, width: 80 }),
    booleanColumn<Row>('active',    { headerName: 'Active',     width: 90 }),
  ];

  readonly options: GridOptions<Row> = {
    getRowId: (row) => row.id,
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'How it works', code: CODE_HOW    },
    { label: 'Canvas mode',  code: CODE_CANVAS },
  ];

  onGridReady(event: GridReadyEvent<Row>): void {
    this.gridApi = event.api;
    this.renderMs.set(Date.now() - this.initTime);
  }

  onFilterChanged(): void {
    this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? this.rows.length);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setQuickFilter(value || null);
    this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? this.rows.length);
  }
}
