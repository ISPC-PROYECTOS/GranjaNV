import { Directive, HostListener, output } from '@angular/core';

@Directive({
  selector: '[appCerrarConEscape]',
})
export class CerrarConEscapeDirective {
  cerrarEscape = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrarEscape.emit();
  }
}