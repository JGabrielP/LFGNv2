import { TestBed } from '@angular/core/testing';

import { FinancesService } from './finances.service';

describe('FinancesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FinancesService = TestBed.get(FinancesService);
    expect(service).toBeTruthy();
  });
});
