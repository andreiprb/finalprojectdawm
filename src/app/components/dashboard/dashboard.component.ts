import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
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
import { EntryModalComponent, EntryFormData } from '../entry-modal/entry-modal.component';
import { UI_CONFIG } from '../../constants/app.constants';

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
    NzInputModule,
    NzIconModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzLayoutModule,
    NzDropDownModule,
    NzMenuModule,
    NzAvatarModule,
    EntryModalComponent
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
  editingEntry: TableEntry | null = null;

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
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadCurrentUser();
    this.subscribeToEntries();
    this.loadEntries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(UI_CONFIG.SEARCH_DEBOUNCE),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm.set(value || '');
      });
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
        return entry.date.getTime();
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
    this.editingEntry = null;
    this.isModalVisible = true;
  }

  openEditModal(entry: TableEntry): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.isModalVisible = true;
  }

  onModalCancel(): void {
    this.isModalVisible = false;
    this.editingEntry = null;
  }

  async onModalSave(formData: EntryFormData): Promise<void> {
    this.isLoading.set(true);
    try {
      if (this.isEditMode && this.editingEntry?.id) {
        await this.dataService.updateEntry(this.editingEntry.id, formData);
        this.message.success('Entry updated successfully!');
      } else {
        await this.dataService.createEntry(formData);
        this.message.success('Entry created successfully!');
      }

      this.isModalVisible = false;
      this.editingEntry = null;
    } catch (error: any) {
      this.message.error(error.message || 'Operation failed');
    } finally {
      this.isLoading.set(false);
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
}
