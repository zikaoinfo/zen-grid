# zen-grid

<p align="center">
  <a href="https://zikaoinfo.github.io/zen-grid/"><strong>▶ Live Demo →</strong></a>
</p>

<p align="center">
  <a href="https://github.com/zikaoinfo/zen-grid/actions/workflows/ci.yml">
    <img src="https://github.com/zikaoinfo/zen-grid/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/zikaoinfo/zen-grid/actions/workflows/pages.yml">
    <img src="https://github.com/zikaoinfo/zen-grid/actions/workflows/pages.yml/badge.svg" alt="Pages" />
  </a>
  <img src="https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white" alt="Angular 19" />
  <img src="https://img.shields.io/badge/signals-native-6366f1" alt="Signal-native" />
  <img src="https://img.shields.io/badge/license-MIT-22c55e" alt="MIT License" />
</p>

<p align="center">
  Production-grade, <strong>signal-native</strong> Angular 19 data grid.<br/>
  Virtual scrolling · Grouping · Pivoting · Inline editing · CSV / Excel export.<br/>
  <em>Zero runtime dependencies beyond Angular.</em>
</p>

---

## ✨ Features

| | Feature | Details |
|--|---------|---------|
| 🚀 | **Signal-native** | Built entirely with Angular signals; fully zoneless-compatible |
| 📜 | **Virtual scroll** | DOM + Canvas render paths; handles 100 k+ rows smoothly |
| 🗂️ | **Grouping & pivot** | Multi-level row groups, pivot columns, pluggable `aggFunc` |
| ✏️ | **Inline editing** | Click / double-click / F2 triggers, validators, undo/redo stack |
| 🔍 | **Sort & filter** | Text, number, date, set, boolean filters + custom component |
| 📤 | **Export** | Streaming CSV built-in; Excel & PDF via adapter plug-ins |
| 🎨 | **Theming** | Built-in dark mode, CSS variable tokens, per-column cell classes |
| ♿ | **Accessible** | WAI-ARIA grid pattern, keyboard navigation, screen-reader live region |
| 📌 | **Column features** | Pinning, resizing, reordering, hiding, flex sizing |
| 🖱️ | **Selection** | Row (single / multi), checkbox, cell ranges, clipboard copy |
| 🌐 | **Server-side** | Infinite / server row models with block caching |
| 🌲 | **Tree data** | Lazy-loaded tree rows with async child fetch |

---

## 📦 Installation

```bash
npm install zen-grid
```

> **Peer dependencies:** `@angular/core >=19`, `@angular/common >=19`, `rxjs ^6.5.3 || ^7.4.0`

---

## 🚀 Quick Start

```typescript
import { Component } from '@angular/core';
import { ZenGridComponent, textColumn, currencyColumn } from 'zen-grid';
import type { GridOptions } from 'zen-grid';

interface Employee {
  name: string;
  department: string;
  salary: number;
}

@Component({
  standalone: true,
  imports: [ZenGridComponent],
  template: `
    <zen-grid
      [columnDefs]="columns"
      [rowData]="rows"
      [options]="options"
      style="height: 400px; display: block"
    />
  `,
})
export class MyComponent {
  columns = [
    textColumn<Employee>('name',       { headerName: 'Name',   flex: 1 }),
    textColumn<Employee>('department', { headerName: 'Dept',   filter: 'set' }),
    currencyColumn<Employee>('salary', { headerName: 'Salary' }),
  ];

  rows: Employee[] = [
    { name: 'Alice Smith', department: 'Engineering', salary: 120_000 },
    { name: 'Bob Jones',   department: 'Sales',       salary: 85_000 },
  ];

  options: GridOptions<Employee> = {
    selection: { mode: 'multiple', checkboxes: true },
  };
}
```

---

## 📖 Column Presets

Typed factory functions that return a `ColumnDef<T>` with sensible defaults you can override:

| Preset | Filter | Default width | Notes |
|--------|--------|---------------|-------|
| `textColumn(field, opts?)` | `text` | auto | Plain text, free-text search |
| `numberColumn(field, opts?)` | `number` | 110 px | Right-aligned; `decimals` option |
| `currencyColumn(field, opts?)` | `number` | 130 px | `Intl.NumberFormat`; `aggFunc: 'sum'` |
| `percentColumn(field, opts?)` | `number` | 100 px | `0.42 → "42.0%"` |
| `dateColumn(field, opts?)` | `date` | 140 px | `Intl.DateTimeFormat`; parses strings |
| `booleanColumn(field, opts?)` | `boolean` | 90 px | Renders `✓` / `✕` |
| `badgeColumn(field, opts?)` | `set` | 120 px | CSS class badges (`zen-badge-<value>`) |

All presets accept any `ColumnDef<T>` property as an override:

```typescript
currencyColumn<Trade>('price', {
  currency: 'EUR',
  pinned: 'right',
  aggFunc: 'avg',
})
```

---

## ⚙️ Grid Options

```typescript
const options: GridOptions<T> = {
  // ── Row model ─────────────────────────────────────────────
  rowModelType: 'client',          // 'client' | 'server' | 'infinite'
  datasource: myServerDatasource,  // required for server / infinite
  getRowId: (row) => row.id,

  // ── Rendering ─────────────────────────────────────────────
  rowHeight: { mode: 'fixed', height: 36 },   // or 'dynamic' / 'auto'
  headerHeight: 40,
  renderMode: 'dom',                           // or 'canvas' for 100k+ rows
  overscan: 4,

  // ── Features ──────────────────────────────────────────────
  selection: { mode: 'multiple', checkboxes: true },
  grouping: {},
  editTriggers: ['doubleClick', 'f2'],          // or add 'click'
  rowDragEnabled: true,
  clipboard: true,

  // ── Appearance ────────────────────────────────────────────
  defaultColDef: { sortable: true },
  rowClassRules: { 'row-danger': (row) => row.risk > 0.8 },

  // ── Persistence ───────────────────────────────────────────
  statePersistence: { storage: 'localStorage', key: 'my-grid' },
};
```

---

## 🔌 Grid API

Obtain the typed API via the `(gridReady)` event:

```typescript
onGridReady(event: GridReadyEvent<T>): void {
  this.api = event.api;
}
```

| Method | Description |
|--------|-------------|
| `setRowData(rows)` | Replace entire dataset |
| `applyTransaction({ add, update, remove })` | Incremental row mutations |
| `patchRow(rowId, fn)` | Patch a single row without full re-render |
| `undo()` / `redo()` | Revert / reapply row mutations |
| `setQuickFilter(text)` | Global search across all quick-filter columns |
| `setFilterModel(model)` | Set column filter state programmatically |
| `setSortModel(model)` | Set sort state programmatically |
| `getSelectedRows()` | Returns currently selected rows |
| `selectAll()` / `deselectAll()` | Bulk selection |
| `downloadCsv(fileName)` | Stream filtered/sorted rows to a CSV download |
| `exportExcel(fileName)` | Export to Excel (requires adapter) |
| `flashCells(cells)` | Animate cells to highlight value changes |
| `ensureIndexVisible(index)` | Scroll a row into the viewport |
| `getColumnState()` | Snapshot column widths / visibility / order |
| `applyColumnState(state)` | Restore a previously captured column state |
| `startEditingCell(cell)` | Begin editing a cell programmatically |

Signals exposed on the API for reactive consumption:

```typescript
api.displayedRows  // Signal<readonly RowNode<T>[]>
api.selectedRows   // Signal<readonly T[]>
api.canUndo        // Signal<boolean>
api.canRedo        // Signal<boolean>
```

---

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for an in-depth look at the signal data-flow graph, the virtual-scroll engine, the canvas render path, and how to extend zen-grid with custom cell renderers, editors, filter components, and tooltip components.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch
2. `npm ci` to install
3. Edit files under `projects/zen-grid/src/`
4. `npx jest --ci` — tests must pass
5. `npm run build:prod` — build must succeed
6. Open a pull request — CI runs automatically

---

## 📄 License

MIT © [zikaoinfo](https://github.com/zikaoinfo)
