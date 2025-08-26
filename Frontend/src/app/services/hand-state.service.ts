import { Injectable } from '@angular/core';

import { ProjectCard } from './project-cards.service';

export type AnimationState = 'entering' | 'inHand' | 'discarding';

export interface HandState {
  cards: ProjectCard[];
  deckOrigin: { x: number; y: number } | null;
}

@Injectable({ providedIn: 'root' })
export class HandStateService {
  private state: HandState | null = null;

  save(state: HandState): void {
    this.state = {
      cards: state.cards.map((c) => ({ ...c })),
      deckOrigin: state.deckOrigin ? { ...state.deckOrigin } : null,
    };
  }

  load(): HandState | null {
    return this.state
      ? {
          cards: this.state.cards.map((c) => ({ ...c })),
          deckOrigin: this.state.deckOrigin ? { ...this.state.deckOrigin } : null,
        }
      : null;
  }

  clear(): void {
    this.state = null;
  }

  hasState(): boolean {
    return !!this.state && !!this.state.cards?.length;
  }
}
