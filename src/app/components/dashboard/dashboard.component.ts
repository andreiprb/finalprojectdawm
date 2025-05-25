import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

import { DataService, TableEntry } from '../../services/data.service';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzIconModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzLayoutModule,
    NzDropDownModule,
    NzMenuModule,
    NzAvatarModule
  ],
  standalone: true
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  entries: TableEntry[] = [];
  isLoading = false;
  currentUser: UserProfile | null = null;

  // Modal state
  isModalVisible = false;
  isEditMode = false;
  editingEntryId: string | null = null;
  modalTitle = 'Add New Entry';

  // Form
  entryForm!: FormGroup;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCurrentUser();
    this.subscribeToEntries();
    this.loadEntries();
    // Debug: Check what's in user metadata
    this.authService.debugUserMetadata();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private urlValidator(control: any) {
    if (!control.value) return null;
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private subscribeToEntries(): void {
    this.dataService.entries$
      .pipe(takeUntil(this.destroy$))
      .subscribe(entries => {
        this.entries = entries;
      });
  }

  async loadEntries(): Promise<void> {
    this.isLoading = true;
    try {
      await this.dataService.loadEntries();
    } catch (error: any) {
      this.message.error(error.message || 'Failed to load entries');
    } finally {
      this.isLoading = false;
    }
  }

  openModal(): void {
    this.isEditMode = false;
    this.editingEntryId = null;
    this.modalTitle = 'Add New Entry';
    this.entryForm.reset();
    this.entryForm.patchValue({ date: new Date() });
    this.isModalVisible = true;
  }

  openEditModal(entry: TableEntry): void {
    this.isEditMode = true;
    this.editingEntryId = entry.id!;
    this.modalTitle = 'Edit Entry';
    this.entryForm.patchValue({
      name: entry.name,
      description: entry.description,
      date: entry.date,
      repository_link: entry.repository_link,
      go_to_link: entry.go_to_link
    });
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.entryForm.reset();
  }

  async handleOk(): Promise<void> {
    if (this.entryForm.valid) {
      this.isLoading = true;
      try {
        const formValue = this.entryForm.value;

        if (this.isEditMode && this.editingEntryId) {
          await this.dataService.updateEntry(this.editingEntryId, formValue);
          this.message.success('Entry updated successfully!');
        } else {
          await this.dataService.createEntry(formValue);
          this.message.success('Entry created successfully!');
        }

        this.isModalVisible = false;
        this.entryForm.reset();
      } catch (error: any) {
        this.message.error(error.message || 'Operation failed');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      await this.dataService.deleteEntry(id);
      this.message.success('Entry deleted successfully!');
    } catch (error: any) {
      this.message.error(error.message || 'Failed to delete entry');
    }
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.message.error(error.message || 'Failed to sign out');
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
