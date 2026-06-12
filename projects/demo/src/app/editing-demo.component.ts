import { Component, signal } from '@angular/core';
import {
  ZenGridComponent,
  textColumn, currencyColumn, badgeColumn, numberColumn,
} from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent, CellValueChangedEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { Employee, EMPLOYEES } from './data';

@Component({
  selector: 'app-editing-demo',
  standalone: true,
  imports: [ZenGridComponent],
  template: `
    <div class="toolbar">
      <p class="hint">
        Double-click a <strong>Salary</strong> or <strong>Score</strong> cell to edit.
        Changes stay local.
      </p>
      <button class="btn-undo" [disabled]="!canUndo()" (click)="undo()">↩ Undo</button>
      <button class="btn-undo" [disabled]="!canRedo()" (click)="redo()">↪ Redo</button>
    </div>
    @if (lastEdit()) {
      <p class="edit-log">✏️ {{ lastEdit() }}</p>
    }
    <zen-grid
      class="grid"
      [columnDefs]="columns"
      [rowData]="EMPLOYEES"
      [options]="options"
      (gridReady)="onGridReady($event)"
      (cellValueChanged)="onCellValueChanged($event)"
    />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; gap: 10px; }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .hint {
      flex: 1;
      font-size: 13px;
      color: #475569;
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 8px 14px;
      line-height: 1.5;
    }

    .btn-undo {
      padding: 7px 14px;
      background: #fff;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      transition: all 0.15s;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        border-color: #6366f1;
        color: #6366f1;
      }

      &:disabled { opacity: 0.4; cursor: default; }
    }

    .edit-log {
      flex-shrink: 0;
      font-size: 12px;
      color: #065f46;
      background: #d1fae5;
      border-radius: 6px;
      padding: 6px 12px;
    }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class EditingDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;
  private gridApi: GridApi<Employee> | null = null;
  readonly lastEdit  = signal<string | null>(null);
  readonly canUndo   = signal(false);
  readonly canRedo   = signal(false);

  readonly columns: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',       { headerName: 'Full Name',  flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('department', { headerName: 'Department', filter: 'set', width: 160 }),
    textColumn<Employee>('role',       { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary', { headerName: 'Salary',     editable: true }),
    badgeColumn<Employee>('status',    { headerName: 'Status',     width: 120 }),
    numberColumn<Employee>('performance', { headerName: 'Score',   decimals: 0, editable: true, width: 90 }),
  ];

  readonly options: GridOptions<Employee> = {
    editTriggers: ['doubleClick', 'f2'],
    selection: { mode: 'single' },
    defaultColDef: { sortable: true },
  };

  onGridReady(event: GridReadyEvent<Employee>): void {
    this.gridApi = event.api;
    this.syncUndoRedo();
  }

  onCellValueChanged(event: CellValueChangedEvent<Employee>): void {
    const name = (event.row as Employee).name;
    const col  = event.colId === 'salary' ? 'Salary' : 'Score';
    this.lastEdit.set(`${name} — ${col} changed from ${String(event.oldValue)} to ${String(event.newValue)}`);
    this.syncUndoRedo();
  }

  undo(): void {
    this.gridApi?.undo();
    this.syncUndoRedo();
    this.lastEdit.set('(undo applied)');
  }

  redo(): void {
    this.gridApi?.redo();
    this.syncUndoRedo();
    this.lastEdit.set('(redo applied)');
  }

  private syncUndoRedo(): void {
    this.canUndo.set(this.gridApi?.canUndo() ?? false);
    this.canRedo.set(this.gridApi?.canRedo() ?? false);
  }
}
