import { TestBed } from '@angular/core/testing';

import { FieldResolveService } from './field-resolve.service';

describe('FieldResolveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FieldResolveService = TestBed.get(FieldResolveService);
    expect(service).toBeTruthy();
  });
});
