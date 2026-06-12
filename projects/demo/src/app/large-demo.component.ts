import { Component, signal } from '@angular/core';
import { ZenGridComponent, textColumn, numberColumn, booleanColumn } from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { CodePanelComponent } from './code-panel.component';
import type { CodeTab } from './code-panel.component';

interface PerfRow {
  id: number;
  name: string;
  department: string;
  salary: number;
  score: number;
  active: boolean;
}

const DEPTS = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Legal', 'Support'];

function generateRows(n: number): PerfRow[] {
  const rows: PerfRow[] = [];
  for (let i = 0; i < n; i++) {
    rows.push({
      id:         i + 1,
      name:       `Employee ${String(i + 1).padStart(5, '0')}`,
      department: DEPTS[i % DEPTS.length],
      salary:     40_000 + (i % 80_001),
      score:      (i % 100) + 1,
      active:     i % 5 !== 4,
    });
  }
  return rows;
}

const CODE_TS = `// Virtual scrolling is automatic — no extra configuration needed.
// zen-grid only renders rows visible in the viewport.

interface PerfRow {
  id: number; name: string;
  department: string; salary: number;
}

// Generate 25 000 rows
const ROWS: PerfRow[] = Array.from({ length: 25_000 }, (_, i) => ({
  id:         i + 1,
  name:       \`Employee \${String(i + 1).padStart(5, '0')}\`,
  department: DEPTS[i % DEPTS.length],
  salary:     40_000 + (i % 80_001),
}));

@Component({
  standalone: true,
  imports: [ZenGridComponent],
  template: \`<zen-grid [columnDefs]="columns" [rowData]="rows" [options]="options" />\`,
})
export class LargeDemoComponent {
  readonly rows = ROWS; // generated once on component creation

  readonly options: GridOptions<PerfRow> = {
    getRowId: (row) => row.id, // stable identity — avoids full re-renders
    defaultColDef: { sortable: true },
  };
}

// For 100k+ rows, switch to canvas render mode:
// options = { renderMode: 'canvas', getRowId: (r) => r.id }`;

@Component({
  selector: 'app-large-demo',
  standalone: true,
  imports: [ZenGridComponent, CodePanelComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>25 000 Rows</h2>
        <p>
          Virtual scrolling is built-in — only the visible rows are rendered.
          No configuration required. For 100 k+ rows, enable
          <code>renderMode: 'canvas'</code> to shift rendering to an offscreen
          canvas and avoid DOM overhead entirely.
        </p>
      </div>
      <div class="body">
        <div class="demo">
          <div class="toolbar">
            <input
              class="search"
              type="search"
              placeholder="Filter rows..."
              (input)="onSearch($event)"
            />
            @if (renderMs() !== null) {
              <span class="perf-badge">Grid ready in {{ renderMs() }} ms</span>
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
        <app-code-panel [tabs]="codeTabs" />
      </div>
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

    .body { display: flex; flex: 1; overflow: hidden; }

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
      font-size: 12px; font-weight: 600;
      background: #d1fae5; color: #065f46;
      white-space: nowrap;
    }

    .row-count { margin-left: auto; font-size: 13px; color: #64748b; white-space: nowrap; }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class LargeDemoComponent {
  private readonly initTime = Date.now();
  private gridApi: GridApi<PerfRow> | null = null;

  readonly rows: PerfRow[] = generateRows(25_000);
  readonly renderMs  = signal<number | null>(null);
  readonly displayed = signal(this.rows.length);

  readonly columns: ColDefOrGroup<PerfRow>[] = [
    numberColumn<PerfRow>('id',         { headerName: 'ID',         decimals: 0, width: 80 }),
    textColumn<PerfRow>('name',         { headerName: 'Name',       flex: 1.5 }),
    textColumn<PerfRow>('department',   { headerName: 'Department', filter: 'set', width: 160 }),
    numberColumn<PerfRow>('salary',     { headerName: 'Salary',     decimals: 0 }),
    numberColumn<PerfRow>('score',      { headerName: 'Score',      decimals: 0, width: 80 }),
    booleanColumn<PerfRow>('active',    { headerName: 'Active',     width: 90 }),
  ];

  readonly options: GridOptions<PerfRow> = {
    getRowId: (row) => row.id,
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'TypeScript', code: CODE_TS },
  ];

  onGridReady(event: GridReadyEvent<PerfRow>): void {
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
