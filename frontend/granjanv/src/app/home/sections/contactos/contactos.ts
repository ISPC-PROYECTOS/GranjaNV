import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contactos.html',
  styleUrls: ['./contactos.css']
})
export class Contactos implements OnInit {
  titulo = 'Contactos';
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Formulario enviado:', this.contactForm.value);
      // Aquí puedes hacer una llamada al backend
      this.contactForm.reset();
    }
  }
}
