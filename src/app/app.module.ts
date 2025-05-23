import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IconDefinition } from '@ant-design/icons-angular';
import {
  UserOutline,
  LockOutline,
  MailOutline,
  LogoutOutline,
  SettingOutline,
  DownOutline
} from '@ant-design/icons-angular/icons';

import { DashboardComponent } from './components/dashboard/dashboard.component';

const icons: IconDefinition[] = [
  UserOutline,
  LockOutline,
  MailOutline,
  LogoutOutline,
  SettingOutline,
  DownOutline
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,

    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzMessageModule,
    NzDividerModule,
    NzLayoutModule,
    NzAvatarModule,
    NzDropDownModule,
    NzMenuModule,
    NzIconModule.forRoot(icons),
    NzStatisticModule,
    NzListModule,
    NzSpinModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
