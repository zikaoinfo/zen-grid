import { Component, signal } from '@angular/core';
import { BasicDemoComponent }    from './basic-demo.component';
import { GroupingDemoComponent } from './grouping-demo.component';
import { EditingDemoComponent }  from './editing-demo.component';

type Tab = 'basic' | 'grouping' | 'editing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BasicDemoComponent, GroupingDemoComponent, EditingDemoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly activeTab = signal<Tab>('basic');

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
