import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  standalone: false,
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
})
export class AdminSidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
}
