import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';


export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: ':slug', component: LandingPageComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];
