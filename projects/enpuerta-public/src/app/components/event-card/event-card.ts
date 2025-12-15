import { Component, Input } from '@angular/core';
import { Event, Function as EventFunction } from '@enpuerta/shared';

@Component({
  selector: 'app-event-card',
  standalone: false,
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss'
})
export class EventCardComponent {
  @Input() event!: Event;
  @Input() nextFunction: EventFunction | null | undefined;
  @Input() functionsCount: number = 0;
  @Input() isSoldOut: boolean = false;
  @Input() hideDescription: boolean = false;
}
