import { Component } from '@angular/core';
import {
  ZenGridComponent,
  textColumn, numberColumn, currencyColumn,
  dateColumn, booleanColumn, badgeColumn, percentColumn,
} from 'zen-grid';
import type { ColDefOrGroup } from 'zen-grid';
import { CodePanelComponent } from './code-panel.component';
import type { CodeTab } from './code-panel.component';
import { Employee, EMPLOYEES } from './data';

const CODE_TEXT = `import { textColumn } from 'zen-grid';

// Basic text
textColumn<Employee>('name', { headerName: 'Name' })

// Proportional width (flex)
textColumn<Employee>('name', { flex: 1.5 })

// Fixed width + pinned
textColumn<Employee>('name', { width: 180, pinned: 'left' })

// Set filter — dropdown of unique values
textColumn<Employee>('department', {
  headerName: 'Department',
  filter: 'set',
})

// Text filter — contains / starts-with / equals ...
textColumn<Employee>('role', { filter: 'text' })`;

const CODE_NUMBER = `import { numberColumn, currencyColumn, percentColumn } from 'zen-grid';

// Integer
numberColumn<Employee>('performance', {
  headerName: 'Score', decimals: 0,
})

// Decimal
numberColumn<Employee>('ratio', { decimals: 2 })

// Currency — locale currency symbol & thousands separator
currencyColumn<Employee>('salary', { headerName: 'Salary' })

// Percent — multiplies by 100, appends %
percentColumn<Employee>('rate', { headerName: 'Rate' })

// Aggregation on grouped rows
currencyColumn<Employee>('salary', {
  headerName: 'Avg Salary',
  aggFunc: 'avg',  // 'sum' | 'avg' | 'min' | 'max' | 'count'
})`;

const CODE_DATE = `import { dateColumn } from 'zen-grid';

// Renders ISO strings as locale short date
dateColumn<Employee>('startDate', { headerName: 'Start Date' })

// Date range filter
dateColumn<Employee>('hireDate', {
  headerName: 'Hired',
  filter: 'date',
})`;

const CODE_BOOL = `import { booleanColumn } from 'zen-grid';

// Renders checkmark for true, dash for false
booleanColumn<Employee>('remote', { headerName: 'Remote' })`;

const CODE_BADGE = `import { badgeColumn } from 'zen-grid';

// Value is lowercased and spaces replaced with dashes
// → generates CSS classes: zen-badge  zen-badge-<value>
badgeColumn<Employee>('status', { headerName: 'Status' })

// Define the badge styles in your global styles.scss:
// .zen-badge          { padding: 2px 10px; border-radius: 12px; font-size: 11px; }
// .zen-badge-active   { background: #d1fae5; color: #065f46; }
// .zen-badge-inactive { background: #fee2e2; color: #991b1b; }
// .zen-badge-on-leave { background: #fef3c7; color: #92400e; }`;

@Component({
  selector: 'app-column-types-demo',
  standalone: true,
  imports: [ZenGridComponent, CodePanelComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>Column Types</h2>
        <p>
          zen-grid ships seven column-type helpers — each configures formatting,
          filtering and sorting correctly for its data type. Pick a tab on the
          right to see the code for each type.
        </p>
      </div>
      <div class="body">
        <div class="demo">
          <zen-grid class="grid" [columnDefs]="columns" [rowData]="EMPLOYEES" [options]="options" />
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
      h2 { font-size: 16px; font-weight: 600; color: #cdd6f4; margin: 0 0 4px; }
      p  { font-size: 13px; color: #6c7086; margin: 0; line-height: 1.5; }
    }

    .body { display: flex; flex: 1; overflow: hidden; }

    .demo {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column;
      padding: 20px 24px; background: #f8fafc;
    }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class ColumnTypesDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;

  readonly columns: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',        { headerName: 'name  (text)',       flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('department',  { headerName: 'department  (set)',  filter: 'set', width: 160 }),
    textColumn<Employee>('role',        { headerName: 'role  (text)',       flex: 1 }),
    currencyColumn<Employee>('salary',  { headerName: 'salary  (currency)'                           }),
    badgeColumn<Employee>('status',     { headerName: 'status  (badge)',    width: 140               }),
    dateColumn<Employee>('startDate',   { headerName: 'startDate  (date)',  width: 150               }),
    numberColumn<Employee>('performance', { headerName: 'score  (number)',  decimals: 0, width: 120  }),
    booleanColumn<Employee>('remote',   { headerName: 'remote  (boolean)', width: 120               }),
  ];

  readonly options = { defaultColDef: { sortable: true } };

  readonly codeTabs: CodeTab[] = [
    { label: 'textColumn',     code: CODE_TEXT   },
    { label: 'numberColumn',   code: CODE_NUMBER },
    { label: 'dateColumn',     code: CODE_DATE   },
    { label: 'booleanColumn',  code: CODE_BOOL   },
    { label: 'badgeColumn',    code: CODE_BADGE  },
  ];
}
