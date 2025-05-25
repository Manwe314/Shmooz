import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { landingBackgroundResolver } from './landing-background.resolver';

describe('landingBackgroundResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => landingBackgroundResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
