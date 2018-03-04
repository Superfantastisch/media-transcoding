import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaManipulationComponent } from './media-manipulation.component';

describe('MediaManipulationComponent', () => {
  let component: MediaManipulationComponent;
  let fixture: ComponentFixture<MediaManipulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaManipulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaManipulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
