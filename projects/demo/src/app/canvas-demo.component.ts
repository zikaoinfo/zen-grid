import { Component, signal } from '@angular/core';
import { ZenGridComponent, textColumn, numberColumn, booleanColumn } from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { SplitPaneComponent } from './split-pane.component';
import type { CodeTab } from './code-panel.component';

interface CanvasRow {
  id: number;
  name: string;
  department: string;
  salary: number;
  score: number;
  active: boolean;
}

const DEPTS = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Legal', 'Support'];

function generateRows(n: number): CanvasRow[] {
  const rows: CanvasRow[] = [];
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

const CODE_TS = `// Switch to canvas render mode for 100k+ rows.
// The grid paints rows onto an offscreen <canvas> instead of
// creating DOM elements — near-zero layout pressure.

interface Row { id: number; name: string; salary: number; }

const ROWS: Row[] = Array.from({ length: 100_000 }, (_, i) => ({
  id:         i + 1,
  name:       \`Employee \${String(i + 1).padStart(6, '0')}\`,
  department: DEPTS[i % DEPTS.length],
  salary:     40_000 + (i % 80_001),
}));

@Component({
  standalone: true,
  imports: [ZenGridComponent],
  template: \`<zen-grid [columnDefs]="cols" [rowData]="rows" [options]="opts" />\`,
})
export class CanvasDemoComponent {
  readonly rows = ROWS; // generated once on component creation

  readonly opts: GridOptions<Row> = {
    renderMode: 'canvas',   // <-- the only difference from DOM mode
    getRowId: (r) => r.id,  // stable identity avoids full repaints
    defaultColDef: { sortable: true },
  };
}

// When to use canvas vs. DOM:
//
// DOM   (<50k rows)   full Angular templates, custom cell components,
//                     CSS-based styling, accessibility (ARIA)
// Canvas (100k+ rows) maximum throughput, limited custom rendering`;

const CODE_COMPARE = `// DOM mode (default) — up to ~50k rows
const domOptions: GridOptions<Row> = {
  defaultColDef: { sortable: true },
};

// Canvas mode — 100k+ rows, read-only data
const canvasOptions: GridOptions<Row> = {
  renderMode: 'canvas',
  getRowId: (row) => row.id,
  defaultColDef: { sortable: true },
};

// Canvas limitations vs. DOM:
// - Custom cellRenderer components are not supported
// - CSS :hover / :focus rules do not apply to cells
// - Copy-to-clipboard works; editing is not supported
// - Accessibility (ARIA cell roles) falls back to the host element`;

@Component({
  selector: 'app-canvas-demo',
  standalone: true,
  imports: [ZenGridComponent, SplitPaneComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>100 000 Rows — Canvas Mode</h2>
        <p>
          Set <code>renderMode: 'canvas'</code> to paint rows onto an offscreen
          canvas element instead of creating DOM nodes.
          Zero layout thrashing — the grid stays smooth even at 100 k+ rows.
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
              <span class="perf-badge canvas">Canvas — ready in {{ renderMs() }} ms</span>
            }
            <span class="row-count">{{ displayed() }} / {{ rows.length }} rows</span>
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
      code {
        font-family: 'Fira Code', monospace; font-size: 12px;
        background: #1e1f38; padding: 1px 5px; border-radius: 4px; color: #a5b4fc;
      }
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
      &.canvas { background: #ede9fe; color: #5b21b6; }
    }

    .row-count { margin-left: auto; font-size: 13px; color: #64748b; white-space: nowrap; }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class CanvasDemoComponent {
  private readonly initTime = Date.now();
  private gridApi: GridApi<CanvasRow> | null = null;

  readonly rows: CanvasRow[] = generateRows(100_000);
  readonly renderMs  = signal<number | null>(null);
  readonly displayed = signal(this.rows.length);

  readonly columns: ColDefOrGroup<CanvasRow>[] = [
    numberColumn<CanvasRow>('id',         { headerName: 'ID',         decimals: 0, width: 90 }),
    textColumn<CanvasRow>('name',         { headerName: 'Name',       flex: 1.5 }),
    textColumn<CanvasRow>('department',   { headerName: 'Department', filter: 'set', width: 160 }),
    numberColumn<CanvasRow>('salary',     { headerName: 'Salary',     decimals: 0 }),
    numberColumn<CanvasRow>('score',      { headerName: 'Score',      decimals: 0, width: 80 }),
    booleanColumn<CanvasRow>('active',    { headerName: 'Active',     width: 90 }),
  ];

  readonly options: GridOptions<CanvasRow> = {
    renderMode: 'canvas',
    getRowId: (row) => row.id,
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'TypeScript', code: CODE_TS      },
    { label: 'DOM vs Canvas', code: CODE_COMPARE },
  ];

  onGridReady(event: GridReadyEvent<CanvasRow>): void {
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
