import { Component, computed, signal } from '@angular/core';
import { HomeDemoComponent }        from './home-demo.component';
import { BasicDemoComponent }       from './basic-demo.component';
import { ColumnTypesDemoComponent } from './column-types-demo.component';
import { SortingDemoComponent }     from './sorting-demo.component';
import { GroupingDemoComponent }    from './grouping-demo.component';
import { EditingDemoComponent }     from './editing-demo.component';
import { LargeDemoComponent }       from './large-demo.component';

type Route = 'home' | 'hello-world' | 'column-types' | 'sorting' | 'grouping' | 'editing' | 'large';

interface NavItem { id: Route; label: string; }
interface NavSection { label: string; items: NavItem[]; }

const NAV: NavSection[] = [
  { label: 'Overview',        items: [{ id: 'home',         label: 'Showcase'      }] },
  { label: 'Getting Started', items: [{ id: 'hello-world',  label: 'Hello World'   },
                                       { id: 'column-types', label: 'Column Types'  }] },
  { label: 'Features',        items: [{ id: 'sorting',      label: 'Sort & Filter' },
                                       { id: 'grouping',     label: 'Row Grouping'  },
                                       { id: 'editing',      label: 'Inline Editing'}] },
  { label: 'Performance',     items: [{ id: 'large',        label: '25 000 Rows'   }] },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HomeDemoComponent,
    BasicDemoComponent,
    ColumnTypesDemoComponent,
    SortingDemoComponent,
    GroupingDemoComponent,
    EditingDemoComponent,
    LargeDemoComponent,
  ],
  template: `
    <div class="shell" [class.open]="sidebarOpen()">

      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-mark">ZG</div>
          <span class="logo-name">ZenGrid</span>
        </div>

        @for (section of nav; track section.label) {
          <div class="nav-section">
            <span class="section-label">{{ section.label }}</span>
            @for (item of section.items; track item.id) {
              <button
                class="nav-item"
                [class.active]="route() === item.id"
                (click)="navigate(item.id)"
              >{{ item.label }}</button>
            }
          </div>
        }

        <div class="sidebar-footer">
          <a href="https://github.com/zikaoinfo/zen-grid" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.npmjs.com/package/zen-grid" target="_blank" rel="noopener">npm</a>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <button class="burger" (click)="toggleSidebar()" aria-label="Toggle sidebar">
            <span></span><span></span><span></span>
          </button>
          <span class="page-crumb">zen-grid</span>
          <span class="page-sep">/</span>
          <span class="page-title">{{ currentItem().label }}</span>
        </header>

        <div class="content">
          @switch (route()) {
            @case ('home')         { <app-home-demo /> }
            @case ('hello-world')  { <app-basic-demo /> }
            @case ('column-types') { <app-column-types-demo /> }
            @case ('sorting')      { <app-sorting-demo /> }
            @case ('grouping')     { <app-grouping-demo /> }
            @case ('editing')      { <app-editing-demo /> }
            @case ('large')        { <app-large-demo /> }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }

    .shell { display: flex; height: 100%; background: #0f172a; }

    /* ── Sidebar ── */
    .sidebar {
      width: 0;
      flex-shrink: 0;
      background: #12131f;
      border-right: 1px solid #1a1b2e;
      overflow: hidden;
      transition: width 0.22s ease;
      display: flex;
      flex-direction: column;
    }
    .shell.open .sidebar { width: 232px; }

    .sidebar-logo {
      padding: 18px 18px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #1a1b2e;
      flex-shrink: 0;
    }
    .logo-mark {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; color: #fff;
      flex-shrink: 0;
    }
    .logo-name { font-size: 15px; font-weight: 700; color: #cdd6f4; white-space: nowrap; }

    .nav-section { padding: 14px 0 4px; }
    .section-label {
      display: block;
      padding: 0 18px 6px;
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.9px; text-transform: uppercase;
      color: #45475a; white-space: nowrap;
    }
    .nav-item {
      display: block; width: 100%;
      text-align: left;
      padding: 7px 18px;
      background: none; border: none;
      border-left: 2px solid transparent;
      color: #7f849c;
      font-size: 13px; font-family: inherit;
      cursor: pointer; white-space: nowrap;
      transition: all 0.12s;
      &:hover { color: #cdd6f4; background: #1e1f38; }
      &.active { color: #cdd6f4; border-left-color: #6366f1; background: #1e1f38; }
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 14px 18px;
      border-top: 1px solid #1a1b2e;
      display: flex; gap: 16px;
      a {
        font-size: 12px; color: #45475a; text-decoration: none;
        transition: color 0.12s;
        &:hover { color: #cdd6f4; }
      }
    }

    /* ── Main ── */
    .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

    .topbar {
      height: 50px; flex-shrink: 0;
      background: #12131f;
      border-bottom: 1px solid #1a1b2e;
      display: flex; align-items: center;
      gap: 8px; padding: 0 20px;
    }
    .burger {
      display: flex; flex-direction: column; gap: 4px;
      background: none; border: none; cursor: pointer; padding: 5px; border-radius: 4px;
      span { display: block; width: 16px; height: 2px; background: #585b70; border-radius: 2px; transition: background 0.12s; }
      &:hover span { background: #cdd6f4; }
    }
    .page-crumb { font-size: 13px; color: #45475a; }
    .page-sep   { font-size: 13px; color: #313244; }
    .page-title { font-size: 13px; font-weight: 600; color: #cdd6f4; }

    .content { flex: 1; min-height: 0; display: flex; overflow: hidden; }
  `],
})
export class AppComponent {
  readonly nav = NAV;
  readonly route = signal<Route>('home');
  readonly sidebarOpen = signal(true);

  readonly currentItem = computed(() => {
    for (const s of this.nav) {
      const found = s.items.find(item => item.id === this.route());
      if (found) return found;
    }
    return NAV[0].items[0];
  });

  navigate(id: Route): void { this.route.set(id); }
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
}
