import { Component, input, signal } from '@angular/core';
import { CodePanelComponent } from './code-panel.component';
import type { CodeTab } from './code-panel.component';

@Component({
  selector: 'app-split-pane',
  standalone: true,
  imports: [CodePanelComponent],
  template: `
    <div class="left">
      <ng-content />
    </div>
    <div
      class="handle"
      [class.dragging]="dragging()"
      (pointerdown)="startDrag($event)"
      title="Drag to resize"
    ></div>
    <div class="right" [style.width.px]="codeW()">
      <app-code-panel [tabs]="codeTabs()" />
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      overflow: hidden;
      min-width: 0;
    }

    .left {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* ── Drag handle ── */
    .handle {
      width: 6px;
      flex-shrink: 0;
      cursor: col-resize;
      background: #1e1f38;
      position: relative;
      user-select: none;
      touch-action: none;
      transition: background 0.12s;

      /* dotted center indicator */
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 2px;
        height: 30px;
        border-radius: 2px;
        background: repeating-linear-gradient(
          to bottom,
          #45475a 0, #45475a 3px,
          transparent 3px, transparent 6px
        );
        transition: background 0.12s;
      }

      &:hover {
        background: rgb(99 102 241 / 0.15);
        &::before {
          background: repeating-linear-gradient(
            to bottom,
            #6366f1 0, #6366f1 3px,
            transparent 3px, transparent 6px
          );
        }
      }

      &.dragging {
        background: rgb(99 102 241 / 0.25);
        &::before {
          background: repeating-linear-gradient(
            to bottom,
            #818cf8 0, #818cf8 3px,
            transparent 3px, transparent 6px
          );
        }
      }
    }

    .right {
      flex-shrink: 0;
      display: flex;
      overflow: hidden;
      min-width: 180px;
      max-width: 75vw;
    }
  `],
})
export class SplitPaneComponent {
  readonly codeTabs = input.required<CodeTab[]>();
  readonly codeW    = signal(420);
  readonly dragging = signal(false);

  startDrag(event: PointerEvent): void {
    event.preventDefault();
    const startX = event.clientX;
    const startW = this.codeW();
    this.dragging.set(true);

    const onMove = (e: PointerEvent) => {
      const delta  = startX - e.clientX;
      const newW   = Math.max(180, Math.min(800, startW + delta));
      this.codeW.set(newW);
    };

    const onUp = () => {
      this.dragging.set(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup',   onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup',   onUp);
  }
}
