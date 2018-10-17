
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavLFGNComponent } from './nav-lfgn.component';

describe('NavLFGNComponent', () => {
  let component: NavLFGNComponent;
  let fixture: ComponentFixture<NavLFGNComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule],
      declarations: [NavLFGNComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavLFGNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
