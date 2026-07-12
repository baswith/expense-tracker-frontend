import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts: Toast[] = [];

  show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = ++this.counter;
    this.toasts.push({ id, message, type });
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string, duration = 3500) { this.show(message, 'success', duration); }
  error(message: string, duration = 4000)   { this.show(message, 'error', duration); }
  info(message: string, duration = 3500)    { this.show(message, 'info', duration); }
  warning(message: string, duration = 3500) { this.show(message, 'warning', duration); }

  dismiss(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
