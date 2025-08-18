import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { deckResolver } from './deck.resolver';

describe('deckResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => deckResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
