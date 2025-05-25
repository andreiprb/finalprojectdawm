import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

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

export interface SortConfig {
  field: keyof TableEntry | null;
  direction: 'asc' | 'desc' | null;
}

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

  entries = signal<TableEntry[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  sortConfig = signal<SortConfig>({ field: 'date', direction: 'desc' });

  currentUser: UserProfile | null = null;

  isModalVisible = false;
  isEditMode = false;
  editingEntryId: string | null = null;
  modalTitle = 'Add New Entry';

  entryForm!: FormGroup;
  searchControl = new FormControl('');

  filteredEntries = computed(() => {
    const entries = this.entries();
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) return entries;

    return entries.filter(entry =>
      entry.name.toLowerCase().includes(term) ||
      entry.description.toLowerCase().includes(term) ||
      entry.date.toDateString().toLowerCase().includes(term)
    );
  });

  sortedEntries = computed(() => {
    const entries = this.filteredEntries();
    const config = this.sortConfig();

    if (!config.field || !config.direction) return entries;

    return [...entries].sort((a, b) => {
      const aValue = this.getSortValue(a, config.field!);
      const bValue = this.getSortValue(b, config.field!);

      let result = 0;
      if (aValue < bValue) result = -1;
      else if (aValue > bValue) result = 1;

      return config.direction === 'desc' ? -result : result;
    });
  });

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupSearch();
    this.loadCurrentUser();
    this.subscribeToEntries();
    this.loadEntries();
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

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm.set(value || '');
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
        this.entries.set(entries);
      });
  }

  async loadEntries(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.dataService.loadEntries();
    } catch (error: any) {
      this.message.error(error.message || 'Failed to load entries');
    } finally {
      this.isLoading.set(false);
    }
  }

  sort(field: keyof TableEntry): void {
    const currentConfig = this.sortConfig();
    let newDirection: 'asc' | 'desc' = 'asc';

    if (currentConfig.field === field) {
      if (currentConfig.direction === 'asc') {
        newDirection = 'desc';
      } else if (currentConfig.direction === 'desc') {
        this.sortConfig.set({ field: null, direction: null });
        return;
      }
    }

    this.sortConfig.set({ field, direction: newDirection });
  }

  private getSortValue(entry: TableEntry, field: keyof TableEntry): any {
    switch (field) {
      case 'date':
        return new Date(entry.date).getTime();
      case 'name':
      case 'description':
        return entry[field].toLowerCase();
      default:
        return entry[field];
    }
  }

  highlightText(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
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
      this.isLoading.set(true);
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
        this.isLoading.set(false);
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
