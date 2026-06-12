import { Component, Signal, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface CodeTab { label: string; code: string; }

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const KW_RE  = /\b(import|export|from|default|const|let|var|class|interface|type|extends|implements|return|new|this|null|undefined|true|false|async|await|readonly|private|public|protected|static|of|in|for|if|else|while|do|throw|try|catch|finally|override)\b/g;
const DEC_RE = /(@[A-Za-z]\w*)/g;
const NUM_RE = /(?<!["\w])(\d[\d_]*(?:\.\d+)?)\b/g;

function applyTokens(plain: string): string {
  return plain
    .replace(KW_RE,  '<span class="hl-k">$1</span>')
    .replace(DEC_RE, '<span class="hl-d">$1</span>')
    .replace(NUM_RE, '<span class="hl-n">$1</span>');
}

function highlight(raw: string): string {
  return raw.split('\n').map(line => {
    // Full-line comment
    if (/^\s*\/\//.test(line)) return `<span class="hl-c">${esc(line)}</span>`;

    const out: string[] = [];
    let i = 0;
    while (i < line.length) {
      // Inline comment — rest of line
      if (line[i] === '/' && line[i + 1] === '/') {
        out.push(`<span class="hl-c">${esc(line.slice(i))}</span>`);
        i = line.length;
        break;
      }

      // String literal (single or double quote)
      const q = line[i];
      if (q === '"' || q === "'") {
        let j = i + 1;
        while (j < line.length && line[j] !== q) {
          if (line[j] === '\\') j++;
          j++;
        }
        if (j < line.length) j++;
        out.push(`<span class="hl-s">${esc(line.slice(i, j))}</span>`);
        i = j;
        continue;
      }

      // Template literal (backtick)
      if (q === '`') {
        let j = i + 1;
        while (j < line.length && line[j] !== '`') {
          if (line[j] === '\\') j++;
          j++;
        }
        if (j < line.length) j++;
        out.push(`<span class="hl-s">${esc(line.slice(i, j))}</span>`);
        i = j;
        continue;
      }

      // Plain segment — run until next string/comment delimiter
      let j = i;
      while (
        j < line.length &&
        line[j] !== '"' && line[j] !== "'" && line[j] !== '`' &&
        !(line[j] === '/' && line[j + 1] === '/')
      ) j++;
      out.push(applyTokens(esc(line.slice(i, j))));
      i = j;
    }
    return out.join('');
  }).join('\n');
}

@Component({
  selector: 'app-code-panel',
  standalone: true,
  template: `
    <div class="tabs-bar">
      @for (tab of tabs(); track tab.label; let i = $index) {
        <button class="ctab" [class.active]="activeIdx() === i" (click)="activeIdx.set(i)">
          {{ tab.label }}
        </button>
      }
      <button class="copy-btn" (click)="copy()">{{ copied() ? '✓ Copied' : 'Copy' }}</button>
    </div>
    <div class="code-scroll">
      <pre><code [innerHTML]="html()"></code></pre>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      background: #1a1b2e;
      border-left: 1px solid #2d2d50;
      overflow: hidden;
    }
    .tabs-bar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 0 6px;
      background: #12131f;
      border-bottom: 1px solid #2d2d50;
      flex-shrink: 0;
      min-height: 40px;
    }
    .ctab {
      padding: 8px 14px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: #585b70;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.12s;
      white-space: nowrap;
      &.active { color: #cdd6f4; border-bottom-color: #6366f1; }
      &:hover:not(.active) { color: #9399b2; }
    }
    .copy-btn {
      margin-left: auto;
      padding: 5px 12px;
      background: transparent;
      border: 1px solid #313244;
      border-radius: 6px;
      color: #585b70;
      font-size: 11px;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.12s;
      &:hover { border-color: #6366f1; color: #cdd6f4; }
    }
    .code-scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 16px 20px;
    }
    pre {
      margin: 0;
      font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
      font-size: 12.5px;
      line-height: 1.65;
      color: #cdd6f4;
      white-space: pre;
    }
    .hl-k { color: #cba6f7; }
    .hl-s { color: #a6e3a1; }
    .hl-c { color: #6c7086; font-style: italic; }
    .hl-d { color: #89b4fa; }
    .hl-n { color: #fab387; }
  `],
})
export class CodePanelComponent {
  private readonly san = inject(DomSanitizer);
  readonly tabs      = input.required<CodeTab[]>();
  // Reset to first tab whenever the tab list changes (e.g. navigating between demos)
  readonly activeIdx = linkedSignal(() => { void this.tabs(); return 0; });
  readonly copied    = signal(false);

  readonly html: Signal<SafeHtml> = computed(() =>
    this.san.bypassSecurityTrustHtml(highlight(this.tabs()[this.activeIdx()]?.code ?? ''))
  );

  copy(): void {
    const code = this.tabs()[this.activeIdx()]?.code ?? '';
    void navigator.clipboard.writeText(code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
