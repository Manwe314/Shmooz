import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DeckComponent } from './deck/deck.component';


export const routes: Routes = [
    {path: '', component: DashboardComponent},
    {path: 'decks', component: DeckComponent},

];
