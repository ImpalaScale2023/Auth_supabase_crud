import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaintenanceCompaniesComponent } from './maintenance/maintenance.component';
import { Company } from '@app/core/models/database.types';
import { CompanyService } from '@app/core/services/company.service';


@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies.component.html'
})
export class CompaniesComponent {
  companies = signal<Company[]>([]);
  isLoading = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  viewMode= signal<'cards' | 'list'>('list');

  private _companyService =  inject(CompanyService);
  private _router = inject(Router);
  
  constructor() {}
  
  async loadCompanies() {
    this.isLoading.set(true);
    try {
      this.companies.set(await this._companyService.getCompanies());
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngAfterViewInit(){
    this.loadCompanies();
  }

   openModal(company?: Company) {
    if (company) {
      this.isEditing.set(true);
      // this.selectedCompany = company;
      // this.formData = { ...company };
      // this.previewUrl = company.logo_url || null;
    } else {
      //Nuevo ingreso
      this.isEditing.set(false);
      // this.selectedCompany = null;
      // this.resetForm();
    }
    this.isModalOpen.set(true);
  };

  toggleViewMode() {
    this.viewMode.update(()=> this.viewMode() === 'cards' ? 'list' : 'cards');
  }

  
  goBack() {
    this._router.navigate(['/dashboard']);
  }
}
