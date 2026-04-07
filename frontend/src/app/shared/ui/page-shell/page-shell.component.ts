import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-shell',
  imports: [],
  templateUrl: './page-shell.component.html',
  styleUrl: './page-shell.component.scss'
})
export class PageShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
