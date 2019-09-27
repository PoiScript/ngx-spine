import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NgxSpineComponent } from "./ngx-spine.component";

describe("NgxSpineComponent", () => {
  let component: NgxSpineComponent;
  let fixture: ComponentFixture<NgxSpineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxSpineComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxSpineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
