import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './admin/login/login.component';
import { PageComponent } from './page/page.component';
import { PageResolver } from './resolvers/page.resolver';
import { LandingBackgroundResolver } from './resolvers/landing-background.resolver';


export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'login', component: LoginComponent},
    {path: 'page_one', component: PageComponent, resolve: {page: PageResolver, background: LandingBackgroundResolver}, runGuardsAndResolvers: 'always'},
    {path: 'page_two', component: PageComponent, resolve: {page: PageResolver, background: LandingBackgroundResolver}, runGuardsAndResolvers: 'always'},
    {path: 'page_one/:slug', component: PageComponent, resolve: {page: PageResolver, background: LandingBackgroundResolver}, runGuardsAndResolvers: 'always'},
    {path: 'page_two/:slug', component: PageComponent, resolve: {page: PageResolver, background: LandingBackgroundResolver}, runGuardsAndResolvers: 'always'},
    {path: 'project_page/:id', component: PageComponent, resolve: {page: PageResolver, background: LandingBackgroundResolver}, runGuardsAndResolvers: 'always'},
    {path: ':slug', component: LandingPageComponent},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];