import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzModalService } from 'ng-zorro-antd/modal';

import { TableEntry } from '../../services/data.service';

export interface EntryFormData {
  name: string;
  description: string;
  date: Date;
  repository_link: string;
  go_to_link: string;
}

@Component({
  selector: 'app-entry-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule
  ],
  templateUrl: './entry-modal.component.html',
  styleUrls: ['./entry-modal.component.scss'],
  standalone: true
})
export class EntryModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() loading = false;
  @Input() editMode = false;
  @Input() entryData: TableEntry | null = null;

  @Output() save = new EventEmitter<EntryFormData>();
  @Output() cancel = new EventEmitter<void>();

  entryForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modal: NzModalService
  ) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entryData'] || changes['editMode']) {
      this.updateForm();
    }
  }

  private initializeForm(): void {
    this.entryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      date: [new Date(), [Validators.required]],
      repository_link: ['', [Validators.required, this.urlValidator]],
      go_to_link: ['', [Validators.required, this.urlValidator]]
    });
  }

  private updateForm(): void {
    if (this.editMode && this.entryData) {
      this.entryForm.patchValue({
        name: this.entryData.name,
        description: this.entryData.description,
        date: this.entryData.date,
        repository_link: this.entryData.repository_link,
        go_to_link: this.entryData.go_to_link
      });
    } else {
      this.entryForm.reset();
      this.entryForm.patchValue({ date: new Date() });
    }
  }

  private urlValidator(control: any) {
    if (!control.value) return null;
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  get modalTitle(): string {
    return this.editMode ? 'Edit Entry' : 'Add New Entry';
  }

  get okText(): string {
    return this.editMode ? 'Update' : 'Create';
  }

  handleCancel(): void {
    if (this.hasUnsavedChanges()) {
      this.modal.confirm({
        nzTitle: 'Discard changes?',
        nzContent: 'You have unsaved changes. Are you sure you want to cancel?',
        nzOkText: 'Discard',
        nzOkDanger: true,
        nzCancelText: 'Keep editing',
        nzOnOk: () => {
          this.clearFormAndCancel();
        }
      });
    } else {
      this.clearFormAndCancel();
    }
  }

  private hasUnsavedChanges(): boolean {
    const formValue = this.entryForm.value;

    if (this.editMode && this.entryData) {
      return (
        formValue.name !== this.entryData.name ||
        formValue.description !== this.entryData.description ||
        formValue.date?.getTime() !== this.entryData.date?.getTime() ||
        formValue.repository_link !== this.entryData.repository_link ||
        formValue.go_to_link !== this.entryData.go_to_link
      );
    } else {
      const today = new Date();
      return (
        (formValue.name && formValue.name.trim() !== '') ||
        (formValue.description && formValue.description.trim() !== '') ||
        (formValue.date && formValue.date.toDateString() !== today.toDateString()) ||
        (formValue.repository_link && formValue.repository_link.trim() !== '') ||
        (formValue.go_to_link && formValue.go_to_link.trim() !== '')
      );
    }
  }

  private clearFormAndCancel(): void {
    this.entryForm.reset();
    this.entryForm.patchValue({ date: new Date() });
    this.cancel.emit();
  }

  handleOk(): void {
    if (this.entryForm.valid) {
      this.save.emit(this.entryForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.entryForm.controls).forEach(key => {
      const control = this.entryForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(field: string): string {
    const control = this.entryForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(field)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors!['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    if (control?.hasError('invalidUrl')) {
      return 'Please enter a valid URL (starting with http:// or https://)';
    }
    return '';
  }

  private getFieldDisplayName(field: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Name',
      description: 'Description',
      date: 'Date',
      repository_link: 'Repository link',
      go_to_link: 'Go to link'
    };
    return displayNames[field] || field;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.entryForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
}
