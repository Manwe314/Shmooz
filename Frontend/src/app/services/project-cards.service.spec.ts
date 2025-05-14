import { TestBed } from '@angular/core/testing';

import { ProjectCardsService } from './project-cards.service';

describe('ProjectCardsService', () => {
  let service: ProjectCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
