import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { provideNgxs } from './store';

describe('App', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideNgxs()]
    });

    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    return { fixture, component };
  };

  it('should create the app', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const { fixture } = setup();
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Angular 20 Integration Test');
  });
});
