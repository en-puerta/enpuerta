import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: false,
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
})
export class MetricCardComponent {
  @Input() label: string = '';
  @Input() value: number | string = 0;
  @Input() icon?: string;
}
