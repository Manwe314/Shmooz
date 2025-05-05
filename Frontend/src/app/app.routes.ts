import { Routes } from '@angular/router';
import { AppComponent } from './app.component';


export const routes: Routes = [
    {path: '', component: AppComponent},
    {path: ':slug', component: AppComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];
