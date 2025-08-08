import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './admin/login/login.component';
import { PageComponent } from './page/page.component';
import { PageResolver } from './resolvers/page.resolver';
import { LandingBackgroundResolver } from './resolvers/landing-background.resolver';
import { deckResolver } from './resolvers/deck.resolver';
import { SlugResolver } from './resolvers/slug.resolver';
import  { AnimationDelayGuard } from './guards/animation-delay.guard';
import { LandingAnimationGuard } from './guards/landing-animation.guard';

export const routes: Routes = [
    {path: '', component: LandingPageComponent, resolve: {slug: SlugResolver, deck: deckResolver, background: LandingBackgroundResolver},canActivate: [LandingAnimationGuard], runGuardsAndResolvers: 'always'},
    {path: 'login', component: LoginComponent},
    {path: 'page_one', component: PageComponent, resolve: {slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver},canActivate: [AnimationDelayGuard], runGuardsAndResolvers: 'always'},
    {path: 'page_two', component: PageComponent, resolve: {slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver},canActivate: [AnimationDelayGuard], runGuardsAndResolvers: 'always'},
    {path: 'page_one/:slug', component: PageComponent, resolve: {slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver},canActivate: [AnimationDelayGuard], runGuardsAndResolvers: 'always'},
    {path: 'page_two/:slug', component: PageComponent, resolve: {slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver},canActivate: [AnimationDelayGuard], runGuardsAndResolvers: 'always'},
    {path: 'project_page/:id', component: PageComponent, resolve: {slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver},canActivate: [AnimationDelayGuard], runGuardsAndResolvers: 'always'},
    {path: ':slug', component: LandingPageComponent, resolve: {slug: SlugResolver, deck: deckResolver, background: LandingBackgroundResolver},canActivate: [LandingAnimationGuard], runGuardsAndResolvers: 'always'},
    {path: '**', redirectTo: '', pathMatch: 'full'}
];