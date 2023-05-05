import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { StoreModule } from './store';

describe('AppComponent', () => {
  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, StoreModule],
      declarations: [AppComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    return { fixture, component };
  };

  it('should create the app', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render title', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Angular 16 Integration Test');
  });
});
