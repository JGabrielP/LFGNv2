import { TestBed } from '@angular/core/testing';

import { TranferService } from './tranfer.service';

describe('TranferService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TranferService = TestBed.get(TranferService);
    expect(service).toBeTruthy();
  });
});
