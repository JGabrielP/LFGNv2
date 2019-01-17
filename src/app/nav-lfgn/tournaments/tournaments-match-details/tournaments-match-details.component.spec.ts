import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentsMatchDetailsComponent } from './tournaments-match-details.component';

describe('TournamentsMatchDetailsComponent', () => {
  let component: TournamentsMatchDetailsComponent;
  let fixture: ComponentFixture<TournamentsMatchDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentsMatchDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentsMatchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
