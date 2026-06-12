import { Component } from '@angular/core';
import {
  ZenGridComponent,
  textColumn, currencyColumn, booleanColumn, badgeColumn, numberColumn,
} from 'zen-grid';
import type { ColDefOrGroup, GridOptions } from 'zen-grid';
import { Employee, EMPLOYEES } from './data';

@Component({
  selector: 'app-grouping-demo',
  standalone: true,
  imports: [ZenGridComponent],
  template: `
    <p class="hint">
      Rows are grouped by department. Click a group row to expand/collapse.
      Salary and Score columns show <strong>averages</strong> per group.
    </p>
    <zen-grid
      class="grid"
      [columnDefs]="columns"
      [rowData]="EMPLOYEES"
      [options]="options"
    />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; gap: 12px; }

    .hint {
      flex-shrink: 0;
      font-size: 13px;
      color: #475569;
      background: #e0e7ff;
      border: 1px solid #c7d2fe;
      border-radius: 8px;
      padding: 10px 14px;
      line-height: 1.5;
    }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class GroupingDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;

  readonly columns: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',       { headerName: 'Full Name',  flex: 1.5 }),
    textColumn<Employee>('department', { headerName: 'Department', rowGroup: true, hide: true }),
    textColumn<Employee>('role',       { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary', { headerName: 'Avg Salary', aggFunc: 'avg' }),
    badgeColumn<Employee>('status',    { headerName: 'Status',     width: 120 }),
    numberColumn<Employee>('performance', { headerName: 'Avg Score', decimals: 1, aggFunc: 'avg', width: 100 }),
    booleanColumn<Employee>('remote',  { headerName: 'Remote',     width: 90 }),
  ];

  readonly options: GridOptions<Employee> = {
    grouping: {},
    defaultColDef: { sortable: true },
  };
}
