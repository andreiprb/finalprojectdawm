import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DatabaseService } from '../services/db.service';

export class CustomValidators {

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
      const isLengthValid = value.length >= 6;

      const errors: any = {};

      if (!isLengthValid) {
        errors.minLength = true;
      }
      if (!hasUpperCase) {
        errors.missingUpperCase = true;
      }
      if (!hasLowerCase) {
        errors.missingLowerCase = true;
      }
      if (!hasNumeric) {
        errors.missingNumeric = true;
      }
      if (!hasSpecialChar) {
        errors.missingSpecialChar = true;
      }

      return Object.keys(errors).length ? { strongPassword: errors } : null;
    };
  }

  static validEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(value)) {
        return { invalidEmail: true };
      }

      return null;
    };
  }

  static goodEmail(dbService: DatabaseService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = control.value;

      if (!value || !value.trim()) {
        return of(null);
      }

      return of(value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          return dbService.auth.signInWithPassword({
            email: email,
            password: 'dummy-password-that-will-never-work-12345!@#'
          });
        }),
        map((signInResult: any) => {
          if (signInResult.error) {
            const errorMessage = signInResult.error.message.toLowerCase();

            if (errorMessage.includes('invalid') &&
              (errorMessage.includes('credentials') || errorMessage.includes('password'))) {
              return { emailExists: true };
            } else if (errorMessage.includes('not found') ||
              errorMessage.includes('user not found') ||
              errorMessage.includes('email not confirmed')) {
              return null;
            } else {
              return { emailExists: true };
            }
          } else {
            return { emailExists: true };
          }
        }),
        catchError(() => {
          console.warn('Error checking email availability');
          return of(null);
        })
      );
    };
  }

  static passwordMatch(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.parent?.get(passwordField);
      const confirmPassword = control.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password.value === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  static validName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;

      if (!nameRegex.test(value)) {
        return { invalidName: true };
      }

      return null;
    };
  }
}
