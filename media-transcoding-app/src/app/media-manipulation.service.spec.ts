import { TestBed, inject } from '@angular/core/testing';

import { MediaManipulationService } from './media-manipulation.service';

describe('MediaManipulationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MediaManipulationService]
    });
  });

  it('should be created', inject([MediaManipulationService], (service: MediaManipulationService) => {
    expect(service).toBeTruthy();
  }));
});
