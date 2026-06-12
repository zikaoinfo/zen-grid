import { Component, linkedSignal, signal } from '@angular/core';
import {
  ZenGridComponent,
  textColumn, numberColumn, booleanColumn, currencyColumn, badgeColumn,
} from 'zen-grid';
import type { ColDefOrGroup, ColumnGroupDef, GridOptions, GridReadyEvent } from 'zen-grid';
import type { GridApi } from 'zen-grid';
import { SplitPaneComponent } from './split-pane.component';
import type { CodeTab } from './code-panel.component';

interface Row {
  id:               number;
  name:             string;
  email:            string;
  badge:            string;
  department:       string;
  role:             string;
  manager:          string;
  team:             string;
  region:           string;
  country:          string;
  salary:           number;
  bonus:            number;
  taxRate:          number;
  netSalary:        number;
  budget:           number;
  score:            number;
  quality:          number;
  productivity:     number;
  attendance:       number;
  lastReview:       number;
  vacationDays:     number;
  sickDays:         number;
  overtimeHours:    number;
  trainingHours:    number;
  certifications:   number;
  projectCount:     number;
  activeProjects:   number;
  completedProjects:number;
  skills:           number;
  yearsExp:         number;
  remote:           boolean;
  status:           string;
  officeLocation:   string;
  floor:            number;
  desk:             number;
  promotionEligible:boolean;
  hasBenefits:      boolean;
  education:        string;
  startYear:        number;
  reviewCount:      number;
}

const DEPTS    = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Legal', 'Support', 'Product', 'Design'];
const ROLES    = ['Engineer', 'Manager', 'Analyst', 'Director', 'Specialist', 'Lead', 'Consultant', 'Coordinator', 'Architect', 'VP'];
const TEAMS    = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
const REGIONS  = ['AMER', 'EMEA', 'APAC', 'LATAM'];
const COUNTRIES= ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'IN', 'BR', 'SG'];
const STATUSES = ['Active', 'On Leave', 'Probation', 'Contractor'];
const OFFICES  = ['New York', 'London', 'Berlin', 'Singapore', 'Sydney', 'Toronto', 'Tokyo', 'Paris'];
const EDUCATIONS = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'MBA'];

function generateRows(n: number): Row[] {
  const rows: Row[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const salary   = 40_000 + (i * 37) % 120_001;
    const taxRate  = 20 + (i % 21);
    rows[i] = {
      id:                i + 1,
      name:              `Employee ${String(i + 1).padStart(6, '0')}`,
      email:             `emp${i + 1}@corp.io`,
      badge:             `B${String(i + 1).padStart(5, '0')}`,
      department:        DEPTS[i % DEPTS.length],
      role:              ROLES[i % ROLES.length],
      manager:           `Mgr-${String(((i / 15) | 0) + 1).padStart(4, '0')}`,
      team:              TEAMS[i % TEAMS.length],
      region:            REGIONS[i % REGIONS.length],
      country:           COUNTRIES[i % COUNTRIES.length],
      salary,
      bonus:             (salary * (0.08 + (i % 5) * 0.02)) | 0,
      taxRate,
      netSalary:         (salary * (1 - taxRate / 100)) | 0,
      budget:            50_000 + (i * 71) % 450_001,
      score:             (i % 100) + 1,
      quality:           60 + (i % 41),
      productivity:      50 + (i % 51),
      attendance:        85 + (i % 16),
      lastReview:        2 + (i % 4),
      vacationDays:      10 + (i % 21),
      sickDays:          i % 15,
      overtimeHours:     i % 80,
      trainingHours:     10 + (i % 91),
      certifications:    i % 8,
      projectCount:      1 + (i % 12),
      activeProjects:    i % 5,
      completedProjects: i % 20,
      skills:            3 + (i % 18),
      yearsExp:          1 + (i % 30),
      remote:            i % 3 !== 0,
      status:            STATUSES[i % STATUSES.length],
      officeLocation:    OFFICES[i % OFFICES.length],
      floor:             1 + (i % 20),
      desk:              100 + (i % 100),
      promotionEligible: i % 4 === 0,
      hasBenefits:       i % 5 !== 4,
      education:         EDUCATIONS[i % EDUCATIONS.length],
      startYear:         1995 + (i % 30),
      reviewCount:       1 + (i % 12),
    };
  }
  return rows;
}

function group(groupId: string, headerName: string, children: readonly ColDefOrGroup<Row>[]): ColumnGroupDef<Row> {
  return { groupId, headerName, children, isGroup: true };
}

const CODE_INTERFACE = `interface Row {
  // Identity (5)
  id: number; name: string; email: string;
  badge: string; department: string;
  // Team (5)
  role: string; manager: string; team: string;
  region: string; country: string;
  // Compensation (5)
  salary: number; bonus: number;
  taxRate: number; netSalary: number; budget: number;
  // Performance (5)
  score: number; quality: number;
  productivity: number; attendance: number; lastReview: number;
  // Time Off (5)
  vacationDays: number; sickDays: number;
  overtimeHours: number; trainingHours: number; certifications: number;
  // Projects (5)
  projectCount: number; activeProjects: number;
  completedProjects: number; skills: number; yearsExp: number;
  // Work Info (5)
  remote: boolean; status: string;
  officeLocation: string; floor: number; desk: number;
  // Flags (5)
  promotionEligible: boolean; hasBenefits: boolean;
  education: string; startYear: number; reviewCount: number;
}

// 500 000 rows generated once — O(n) loop, ~220 MB heap
const ROWS: Row[] = generateRows(500_000);`;

const CODE_COLUMNS = `// 40 columns arranged in 8 column groups of 5
const columns: ColDefOrGroup<Row>[] = [

  group('identity', 'Identity', [
    numberColumn<Row>('id',         { headerName: 'ID',    decimals: 0, width: 80 }),
    textColumn<Row>('name',         { headerName: 'Name',  flex: 1.5 }),
    textColumn<Row>('email',        { headerName: 'Email', flex: 1.2 }),
    textColumn<Row>('badge',        { headerName: 'Badge', width: 90 }),
    textColumn<Row>('department',   { headerName: 'Dept',  filter: 'set', width: 140 }),
  ]),

  group('team', 'Team', [
    textColumn<Row>('role',         { headerName: 'Role',    flex: 1 }),
    textColumn<Row>('manager',      { headerName: 'Manager', flex: 1 }),
    textColumn<Row>('team',         { headerName: 'Team',    filter: 'set', width: 100 }),
    textColumn<Row>('region',       { headerName: 'Region',  filter: 'set', width: 90 }),
    textColumn<Row>('country',      { headerName: 'Country', filter: 'set', width: 80 }),
  ]),

  // … 6 more groups (Compensation, Performance, Time Off,
  //                   Projects, Work Info, Flags)

];

// Virtual scroll renders only ~20 rows at any time,
// regardless of whether the total is 500 or 500 000.
const options: GridOptions<Row> = {
  getRowId: (row) => row.id,
  defaultColDef: { sortable: true },
};`;

@Component({
  selector: 'app-massive-demo',
  standalone: true,
  imports: [ZenGridComponent, SplitPaneComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>500 000 Rows &times; 40 Columns</h2>
        <p>
          20 million data cells — only the ~20 visible rows and
          their 40 columns exist in the DOM at any time.
          Columns are organised into 8 logical groups.
          Shift-click headers to multi-sort across 40 columns.
        </p>
      </div>
      <app-split-pane [codeTabs]="codeTabs">
        <div class="demo">
          <div class="toolbar">
            <input
              class="search"
              type="search"
              placeholder="Quick filter all 40 columns..."
              (input)="onSearch($event)"
            />
            @if (renderMs() !== null) {
              <span class="perf-badge">
                Ready in {{ renderMs() }} ms &middot;
                {{ rows.length.toLocaleString() }} rows &middot; 40 cols
              </span>
            }
            <span class="row-count">
              {{ displayed().toLocaleString() }} / {{ rows.length.toLocaleString() }} rows
            </span>
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
      h2 { font-size: 16px; font-weight: 600; color: #cdd6f4; margin: 0 0 4px; }
      p  { font-size: 13px; color: #6c7086; margin: 0; line-height: 1.5; }
    }

    .demo {
      flex: 1; min-width: 0; display: flex; flex-direction: column;
      padding: 16px 20px; gap: 10px; background: #f8fafc;
    }

    .toolbar { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

    .search {
      flex: 1; max-width: 300px; padding: 8px 14px;
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
export class MassiveDemoComponent {
  private readonly initTime = Date.now();
  private gridApi: GridApi<Row> | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly rows: Row[] = generateRows(500_000);
  readonly renderMs  = signal<number | null>(null);
  readonly displayed = linkedSignal(() => this.rows.length);

  readonly columns: ColDefOrGroup<Row>[] = [
    group('identity', 'Identity', [
      numberColumn<Row>('id',           { headerName: 'ID',         decimals: 0, width: 80 }),
      textColumn<Row>('name',           { headerName: 'Name',       flex: 1.5 }),
      textColumn<Row>('email',          { headerName: 'Email',      flex: 1.2 }),
      textColumn<Row>('badge',          { headerName: 'Badge',      width: 90 }),
      textColumn<Row>('department',     { headerName: 'Department', filter: 'set', width: 140 }),
    ]),
    group('team', 'Team', [
      textColumn<Row>('role',           { headerName: 'Role',       flex: 1, filter: 'set' }),
      textColumn<Row>('manager',        { headerName: 'Manager',    flex: 1 }),
      textColumn<Row>('team',           { headerName: 'Team',       filter: 'set', width: 100 }),
      textColumn<Row>('region',         { headerName: 'Region',     filter: 'set', width: 90 }),
      textColumn<Row>('country',        { headerName: 'Country',    filter: 'set', width: 85 }),
    ]),
    group('compensation', 'Compensation', [
      currencyColumn<Row>('salary',     { headerName: 'Salary',     filter: 'number' }),
      currencyColumn<Row>('bonus',      { headerName: 'Bonus',      filter: 'number' }),
      numberColumn<Row>('taxRate',      { headerName: 'Tax %',      decimals: 0, width: 80 }),
      currencyColumn<Row>('netSalary',  { headerName: 'Net Salary', filter: 'number' }),
      currencyColumn<Row>('budget',     { headerName: 'Budget',     filter: 'number' }),
    ]),
    group('performance', 'Performance', [
      numberColumn<Row>('score',        { headerName: 'Score',      decimals: 0, width: 80, filter: 'number' }),
      numberColumn<Row>('quality',      { headerName: 'Quality',    decimals: 0, width: 85, filter: 'number' }),
      numberColumn<Row>('productivity', { headerName: 'Prod.',      decimals: 0, width: 80 }),
      numberColumn<Row>('attendance',   { headerName: 'Attend. %',  decimals: 0, width: 95 }),
      numberColumn<Row>('lastReview',   { headerName: 'Last Rev.',  decimals: 0, width: 90 }),
    ]),
    group('timeoff', 'Time & Training', [
      numberColumn<Row>('vacationDays', { headerName: 'Vacation',   decimals: 0, width: 90 }),
      numberColumn<Row>('sickDays',     { headerName: 'Sick Days',  decimals: 0, width: 95 }),
      numberColumn<Row>('overtimeHours',{ headerName: 'Overtime h', decimals: 0, width: 100 }),
      numberColumn<Row>('trainingHours',{ headerName: 'Training h', decimals: 0, width: 100 }),
      numberColumn<Row>('certifications',{ headerName: 'Certs',     decimals: 0, width: 75 }),
    ]),
    group('projects', 'Projects', [
      numberColumn<Row>('projectCount',    { headerName: 'Total',    decimals: 0, width: 75 }),
      numberColumn<Row>('activeProjects',  { headerName: 'Active',   decimals: 0, width: 75 }),
      numberColumn<Row>('completedProjects',{ headerName: 'Done',    decimals: 0, width: 75 }),
      numberColumn<Row>('skills',          { headerName: 'Skills',   decimals: 0, width: 75 }),
      numberColumn<Row>('yearsExp',        { headerName: 'Exp. yrs', decimals: 0, width: 85 }),
    ]),
    group('workinfo', 'Work Info', [
      booleanColumn<Row>('remote',      { headerName: 'Remote',     width: 85 }),
      badgeColumn<Row>('status',        { headerName: 'Status',     filter: 'set', width: 110 }),
      textColumn<Row>('officeLocation', { headerName: 'Office',     filter: 'set', width: 110 }),
      numberColumn<Row>('floor',        { headerName: 'Floor',      decimals: 0, width: 70 }),
      numberColumn<Row>('desk',         { headerName: 'Desk',       decimals: 0, width: 70 }),
    ]),
    group('flags', 'Career', [
      booleanColumn<Row>('promotionEligible', { headerName: 'Promo.',   width: 85 }),
      booleanColumn<Row>('hasBenefits',       { headerName: 'Benefits', width: 85 }),
      textColumn<Row>('education',            { headerName: 'Education', filter: 'set', width: 115 }),
      numberColumn<Row>('startYear',          { headerName: 'Start Yr', decimals: 0, width: 85 }),
      numberColumn<Row>('reviewCount',        { headerName: 'Reviews',  decimals: 0, width: 85 }),
    ]),
  ];

  readonly options: GridOptions<Row> = {
    getRowId: (row) => row.id,
    defaultColDef: { sortable: true },
  };

  readonly codeTabs: CodeTab[] = [
    { label: 'Data Shape',    code: CODE_INTERFACE },
    { label: 'Column Groups', code: CODE_COLUMNS   },
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
    if (this.searchTimer !== null) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.gridApi?.setQuickFilter(value || null);
      this.displayed.set(this.gridApi?.getDisplayedRowCount() ?? this.rows.length);
    }, 250);
  }
}
