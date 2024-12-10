import { TestBed } from '@angular/core/testing';

import { provideNgxs } from './store';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideNgxs()]
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
    expect(compiled.querySelector('h1').textContent).toContain('Angular 19 Integration Test');
  });
});
