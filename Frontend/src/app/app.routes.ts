import { Routes } from '@angular/router';

import { AuthGuard } from './admin/auth/auth.guard';
import { LoginComponent } from './admin/login/login.component';
import { SelectedSlugGuard } from './admin/slugs/selected-slug.guard';
import { SlugSelectComponent } from './admin/slugs/slug-select.component';
import { AdminWorkspaceComponent } from './admin/workspace/admin-workspace.component';
import { AnimationDelayGuard } from './guards/animation-delay.guard';
import { LandingAnimationGuard } from './guards/landing-animation.guard';
import { SlugGuard } from './guards/slug.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { PageComponent } from './page/page.component';
import { deckResolver } from './resolvers/deck.resolver';
import { LandingBackgroundResolver } from './resolvers/landing-background.resolver';
import { PageResolver } from './resolvers/page.resolver';
import { SlugResolver } from './resolvers/slug.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    resolve: { slug: SlugResolver, deck: deckResolver, background: LandingBackgroundResolver },
    canActivate: [SlugGuard, LandingAnimationGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: SlugSelectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    component: AdminWorkspaceComponent,
    canActivate: [AuthGuard, SelectedSlugGuard],
  },
  {
    path: 'page_one',
    component: PageComponent,
    resolve: { slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver },
    canActivate: [SlugGuard, AnimationDelayGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'page_two',
    component: PageComponent,
    resolve: { slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver },
    canActivate: [SlugGuard, AnimationDelayGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'page_one/:slug',
    component: PageComponent,
    resolve: { slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver },
    canActivate: [SlugGuard, AnimationDelayGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'page_two/:slug',
    component: PageComponent,
    resolve: { slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver },
    canActivate: [SlugGuard, AnimationDelayGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'project_page/:id',
    component: PageComponent,
    resolve: { slug: SlugResolver, page: PageResolver, background: LandingBackgroundResolver },
    canActivate: [SlugGuard, AnimationDelayGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: ':slug',
    component: LandingPageComponent,
    resolve: { slug: SlugResolver, deck: deckResolver, background: LandingBackgroundResolver },
    canActivate: [SlugGuard, LandingAnimationGuard],
    runGuardsAndResolvers: 'always',
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
