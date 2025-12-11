import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@enpuerta/shared';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      this.router.navigate(['/events']);
    } catch (error: any) {
      console.error('Login error:', error);
      console.log('Error code:', error.code);

      // Map Firebase errors to user-friendly messages
      if (error.code === 'auth/operation-not-allowed') {
        this.errorMessage = 'El método de autenticación no está habilitado. Contactá al administrador.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.errorMessage = 'Email o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'El email ingresado no es válido.';
      } else if (error.code === 'auth/user-disabled') {
        this.errorMessage = 'Esta cuenta ha sido deshabilitada.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Demasiados intentos fallidos. Intentá más tarde.';
      } else if (error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email o contraseña incorrectos.';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Intentá nuevamente.';
      }

      console.log('Error message set to:', this.errorMessage);
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => this.cdr.detectChanges(), 0);
    } finally {
      this.loading = false;
    }
  }
}
