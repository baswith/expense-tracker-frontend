import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  toast = inject(ToastService);

  trackById(_: number, t: Toast) { return t.id; }

  icon(type: Toast['type']): string {
    return { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }[type];
  }
}
