import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './admin/login/login.component';
import { PageComponent } from './page/page.component';


export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'login', component: LoginComponent},
    {path: 'page_one', component: PageComponent },
    {path: 'page_two', component: PageComponent },
    {path: 'page_one/:slug', component: PageComponent },
    {path: 'page_two/:slug', component: PageComponent },
    {path: 'project_page/:id', component: PageComponent },
    {path: ':slug', component: LandingPageComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];