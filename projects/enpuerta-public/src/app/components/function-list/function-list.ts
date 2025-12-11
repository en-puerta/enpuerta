import { Component, Input } from '@angular/core';
import { Function } from '@enpuerta/shared';

@Component({
  selector: 'app-function-list',
  standalone: false,
  templateUrl: './function-list.html',
  styleUrl: './function-list.scss',
})
export class FunctionListComponent {
  @Input() functions: Function[] = [];
  @Input() eventAlias: string = '';
}
