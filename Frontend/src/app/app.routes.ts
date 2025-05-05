import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './admin/login/login.component';


export const routes: Routes = [
    {path: '', component: AppComponent},
    {path: 'login', component: LoginComponent},
    {path: ':slug', component: AppComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];
