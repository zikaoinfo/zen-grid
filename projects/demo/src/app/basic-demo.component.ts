import { Component } from '@angular/core';
import { ZenGridComponent, textColumn, numberColumn } from 'zen-grid';
import type { ColDefOrGroup } from 'zen-grid';
import { SplitPaneComponent } from './split-pane.component';
import type { CodeTab } from './code-panel.component';

interface Planet { name: string; type: string; diameter: number; moons: number; }

const ROWS: Planet[] = [
  { name: 'Mercury', type: 'Terrestrial', diameter:   4_879, moons:   0 },
  { name: 'Venus',   type: 'Terrestrial', diameter:  12_104, moons:   0 },
  { name: 'Earth',   type: 'Terrestrial', diameter:  12_756, moons:   1 },
  { name: 'Mars',    type: 'Terrestrial', diameter:   6_792, moons:   2 },
  { name: 'Jupiter', type: 'Gas Giant',   diameter: 142_984, moons:  95 },
  { name: 'Saturn',  type: 'Gas Giant',   diameter: 120_536, moons: 145 },
  { name: 'Uranus',  type: 'Ice Giant',   diameter:  51_118, moons:  28 },
  { name: 'Neptune', type: 'Ice Giant',   diameter:  49_528, moons:  16 },
];

const CODE_TS = `import { Component } from '@angular/core';
import { ZenGridComponent, textColumn, numberColumn } from 'zen-grid';
import type { ColDefOrGroup } from 'zen-grid';

interface Planet {
  name: string; type: string;
  diameter: number; moons: number;
}

const ROWS: Planet[] = [
  { name: 'Mercury', type: 'Terrestrial', diameter:   4_879, moons:   0 },
  { name: 'Venus',   type: 'Terrestrial', diameter:  12_104, moons:   0 },
  { name: 'Earth',   type: 'Terrestrial', diameter:  12_756, moons:   1 },
  { name: 'Mars',    type: 'Terrestrial', diameter:   6_792, moons:   2 },
  { name: 'Jupiter', type: 'Gas Giant',   diameter: 142_984, moons:  95 },
  { name: 'Saturn',  type: 'Gas Giant',   diameter: 120_536, moons: 145 },
];

@Component({
  standalone: true,
  imports: [ZenGridComponent],
  template: \`
    <zen-grid [columnDefs]="columns" [rowData]="rows" />
  \`,
})
export class HelloWorldComponent {
  readonly rows = ROWS;

  readonly columns: ColDefOrGroup<Planet>[] = [
    textColumn<Planet>('name',     { headerName: 'Planet'                         }),
    textColumn<Planet>('type',     { headerName: 'Type'                           }),
    numberColumn<Planet>('diameter', {
      headerName: 'Diameter km', decimals: 0,
    }),
    numberColumn<Planet>('moons', {
      headerName: 'Moons', decimals: 0, width: 90,
    }),
  ];
}`;

@Component({
  selector: 'app-basic-demo',
  standalone: true,
  imports: [ZenGridComponent, SplitPaneComponent],
  template: `
    <div class="page">
      <div class="intro">
        <h2>Hello World</h2>
        <p>
          The minimum you need: define a row interface, build column definitions
          with a column-type helper, then bind <code>[columnDefs]</code> and
          <code>[rowData]</code> to <code>&lt;zen-grid&gt;</code>.
        </p>
      </div>
      <app-split-pane [codeTabs]="codeTabs">
        <div class="demo">
          <zen-grid class="grid" [columnDefs]="columns" [rowData]="rows" />
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
      code {
        font-family: 'Fira Code', monospace; font-size: 12px;
        background: #1e1f38; padding: 1px 5px; border-radius: 4px; color: #a5b4fc;
      }
    }

    .demo {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column;
      padding: 20px 24px; background: #f8fafc;
    }

    .grid { flex: 1; min-height: 0; }
  `],
})
export class BasicDemoComponent {
  readonly rows = ROWS;

  readonly columns: ColDefOrGroup<Planet>[] = [
    textColumn<Planet>('name',     { headerName: 'Planet'                             }),
    textColumn<Planet>('type',     { headerName: 'Type'                               }),
    numberColumn<Planet>('diameter', { headerName: 'Diameter km', decimals: 0         }),
    numberColumn<Planet>('moons',    { headerName: 'Moons',       decimals: 0, width: 90 }),
  ];

  readonly codeTabs: CodeTab[] = [{ label: 'TypeScript', code: CODE_TS }];
}
