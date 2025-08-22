import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { slugResolver } from './slug.resolver';

describe('slugResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => slugResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
