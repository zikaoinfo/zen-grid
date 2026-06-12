import { Component } from '@angular/core';
import { ZenGridComponent, textColumn, currencyColumn, badgeColumn, numberColumn } from 'zen-grid';
import type { ColDefOrGroup, GridOptions } from 'zen-grid';
import { SplitPaneComponent } from './split-pane.component';
import type { CodeTab } from './code-panel.component';
import { Employee, EMPLOYEES } from './data';

const CODE_TS = `import {
  ZenGridComponent,
  textColumn, currencyColumn, numberColumn,
} from 'zen-grid';
import type { ColDefOrGroup, GridOptions } from 'zen-grid';

// Step 1: mark the group column
const columns: ColDefOrGroup<Employee>[] = [
  textColumn<Employee>('department', {
    headerName: 'Department',
    rowGroup: true,  // group by this column
    hide: true,      // hide from leaf-row cells
  }),
  textColumn<Employee>('name', { headerName: 'Name', flex: 1.5 }),
  textColumn<Employee>('role', { headerName: 'Role', flex: 1 }),
  currencyColumn<Employee>('salary', {
    headerName: 'Avg Salary',
    aggFunc: 'avg',  // aggregates shown on group rows
  }),
  numberColumn<Employee>('performance', {
    headerName: 'Avg Score',
    decimals: 1,
    aggFunc: 'avg',
  }),
];

// Step 2: enable grouping mode in options
const options: GridOptions<Employee> = {
  grouping: {
    defaultExpanded: true,   // expand all groups initially
  },
  defaultColDef: { sortable: true },
};`;

const CODE_MULTI = `// Multi-level grouping: add a second rowGroup column
const columns: ColDefOrGroup<Employee>[] = [
  textColumn<Employee>('department', { rowGroup: true, hide: true }),
  textColumn<Employee>('role',       { rowGroup: true, hide: true }),
  textColumn<Employee>('name',       { flex: 1.5 }),
  currencyColumn<Employee>('salary', { aggFunc: 'avg' }),
];

// Groups will be:
// Engineering
//   Software Engineer
//     Alice Smith
//     Bob Johnson
//   Senior Engineer
//     ...
// Sales
//   ...`;

@Component({
  selector: 'app-grouping-demo',
  standalone: true,
  imports: [ZenGridComponent, SplitPaneComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>Row Grouping</h2>
        <p>
          Add <code>rowGroup: true</code> to any column and set
          <code>options.grouping</code> to enable grouping mode.
          Aggregate functions (avg, sum, min, max, count) run automatically
          on group rows. Click group rows to expand / collapse.
        </p>
      </div>
      <app-split-pane [codeTabs]="codeTabs">
        <div class="demo">
          <div class="toolbar">
            <span class="hint">Click a group row to expand / collapse it</span>
            <span class="stat-pill">{{ EMPLOYEES.length }} employees &middot; 6 departments</span>
          </div>
          <zen-grid
            class="grid"
            [columnDefs]="columns"
            [rowData]="EMPLOYEES"
            [options]="options"
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

    .hint {
      flex: 1; font-size: 13px; color: #475569;
      background: #e0e7ff; border: 1px solid #c7d2fe;
      border-radius: 8px; padding: 7px 12px;
    }

    .stat-pill { font-size: 12px; color: #64748b; white-space: nowrap; }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class GroupingDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;

  readonly columns: ColDefOrGroup<Employee>[] = [
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
    grouping: { defaultExpanded: true },
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'Single Level', code: CODE_TS    },
    { label: 'Multi-Level',  code: CODE_MULTI },
  ];
}
