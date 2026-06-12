import { Component, signal } from '@angular/core';
import { ZenGridComponent, textColumn, currencyColumn, badgeColumn, numberColumn } from 'zen-grid';
import type { ColDefOrGroup, GridOptions, GridReadyEvent, CellValueChangedEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { SplitPaneComponent } from './split-pane.component';
import type { CodeTab } from './code-panel.component';
import { Employee, EMPLOYEES } from './data';

const CODE_TS = `import { Component, signal } from '@angular/core';
import { ZenGridComponent, textColumn, currencyColumn } from 'zen-grid';
import type {
  ColDefOrGroup, GridOptions,
  GridReadyEvent, CellValueChangedEvent,
} from 'zen-grid';
import type { GridApi } from 'zen-grid';

@Component({
  standalone: true,
  imports: [ZenGridComponent],
  template: \`
    <button [disabled]="!canUndo()" (click)="undo()">Undo</button>
    <button [disabled]="!canRedo()" (click)="redo()">Redo</button>

    <zen-grid
      [columnDefs]="columns"
      [rowData]="rows"
      [options]="options"
      (gridReady)="onGridReady($event)"
      (cellValueChanged)="onCellValueChanged($event)"
    />
  \`,
})
export class EditingDemoComponent {
  private api: GridApi<Employee> | null = null;
  readonly canUndo  = signal(false);
  readonly canRedo  = signal(false);
  readonly lastEdit = signal<string | null>(null);

  readonly columns: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',   { flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('role',   { flex: 1, editable: true }),
    currencyColumn<Employee>('salary', {
      editable: true,
      // conditional: only active employees can edit
      // editable: (row) => row.status === 'Active',
    }),
  ];

  readonly options: GridOptions<Employee> = {
    editTriggers: ['doubleClick', 'f2'],
  };

  onGridReady(e: GridReadyEvent<Employee>) {
    this.api = e.api;
    this.syncUndoRedo();
  }

  onCellValueChanged(e: CellValueChangedEvent<Employee>) {
    this.lastEdit.set(
      \`\${e.colId}: \${String(e.oldValue)} to \${String(e.newValue)}\`
    );
    this.syncUndoRedo();
  }

  undo() { this.api?.undo(); this.syncUndoRedo(); }
  redo() { this.api?.redo(); this.syncUndoRedo(); }

  private syncUndoRedo() {
    this.canUndo.set(this.api?.canUndo() ?? false);
    this.canRedo.set(this.api?.canRedo() ?? false);
  }
}`;

const CODE_ADVANCED = `// Conditional editable (function form)
currencyColumn<Employee>('salary', {
  editable: (row) => row.status === 'Active',
})

// Validation
textColumn<Employee>('role', {
  editable: true,
  validators: [
    (value) => ({
      valid: String(value).trim().length > 0,
      message: 'Role cannot be empty',
    }),
  ],
})

// Custom cell editor component
import type { ZenCellEditor, CellEditorParams } from 'zen-grid';

@Component({
  standalone: true,
  template: \`<select [(ngModel)]="val">
    <option>Active</option>
    <option>Inactive</option>
  </select>\`,
})
class StatusEditor implements ZenCellEditor<Employee> {
  val = '';
  zenEditorInit(p: CellEditorParams<Employee>) {
    this.val = String(p.value);
  }
  getValue() { return this.val; }
}

textColumn<Employee>('status', {
  editable: true,
  cellEditor: StatusEditor,
})`;

@Component({
  selector: 'app-editing-demo',
  standalone: true,
  imports: [ZenGridComponent, SplitPaneComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>Inline Editing</h2>
        <p>
          Mark columns as <code>editable: true</code> and set
          <code>editTriggers</code> to activate editing. Full undo/redo stack
          is built-in. Double-click or press <kbd>F2</kbd> on a cell to start
          editing, <kbd>Enter</kbd> to confirm, <kbd>Esc</kbd> to cancel.
        </p>
      </div>
      <app-split-pane [codeTabs]="codeTabs">
        <div class="demo">
          <div class="toolbar">
            <span class="hint">Double-click <strong>Salary</strong> or <strong>Score</strong> cells to edit</span>
            <button class="btn-undo" [disabled]="!canUndo()" (click)="undo()">Undo</button>
            <button class="btn-undo" [disabled]="!canRedo()" (click)="redo()">Redo</button>
          </div>
          @if (lastEdit()) {
            <div class="edit-log">{{ lastEdit() }}</div>
          }
          <zen-grid
            class="grid"
            [columnDefs]="columns"
            [rowData]="EMPLOYEES"
            [options]="options"
            (gridReady)="onGridReady($event)"
            (cellValueChanged)="onCellValueChanged($event)"
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
      code, kbd {
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
      background: #fef3c7; border: 1px solid #fde68a;
      border-radius: 8px; padding: 7px 12px;
    }

    .btn-undo {
      padding: 7px 14px; background: #fff; color: #374151;
      border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-family: inherit; transition: all 0.15s; flex-shrink: 0;
      &:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
      &:disabled { opacity: 0.4; cursor: default; }
    }

    .edit-log {
      flex-shrink: 0; font-size: 12px;
      color: #065f46; background: #d1fae5;
      border-radius: 6px; padding: 6px 12px;
    }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class EditingDemoComponent {
  readonly EMPLOYEES = EMPLOYEES;
  private gridApi: GridApi<Employee> | null = null;
  readonly lastEdit = signal<string | null>(null);
  readonly canUndo  = signal(false);
  readonly canRedo  = signal(false);

  readonly columns: ColDefOrGroup<Employee>[] = [
    textColumn<Employee>('name',        { headerName: 'Name',       flex: 1.5, pinned: 'left' }),
    textColumn<Employee>('department',  { headerName: 'Department', filter: 'set', width: 160 }),
    textColumn<Employee>('role',        { headerName: 'Role',       flex: 1 }),
    currencyColumn<Employee>('salary',  { headerName: 'Salary',     editable: true }),
    badgeColumn<Employee>('status',     { headerName: 'Status',     width: 120 }),
    numberColumn<Employee>('performance', {
      headerName: 'Score', decimals: 0, editable: true, width: 90,
    }),
  ];

  readonly options: GridOptions<Employee> = {
    editTriggers: ['doubleClick', 'f2'],
    selection: { mode: 'single' },
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'Basic Editing', code: CODE_TS       },
    { label: 'Advanced',      code: CODE_ADVANCED },
  ];

  onGridReady(event: GridReadyEvent<Employee>): void {
    this.gridApi = event.api;
    this.syncUndoRedo();
  }

  onCellValueChanged(event: CellValueChangedEvent<Employee>): void {
    const name = (event.row as Employee).name;
    const col  = event.colId === 'salary' ? 'Salary' : 'Score';
    this.lastEdit.set(`${name} — ${col}: ${String(event.oldValue)} to ${String(event.newValue)}`);
    this.syncUndoRedo();
  }

  undo(): void { this.gridApi?.undo(); this.syncUndoRedo(); this.lastEdit.set('(undo applied)'); }
  redo(): void { this.gridApi?.redo(); this.syncUndoRedo(); this.lastEdit.set('(redo applied)'); }

  private syncUndoRedo(): void {
    this.canUndo.set(this.gridApi?.canUndo() ?? false);
    this.canRedo.set(this.gridApi?.canRedo() ?? false);
  }
}
