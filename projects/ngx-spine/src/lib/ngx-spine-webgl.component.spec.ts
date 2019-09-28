import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NgxSpineWebglComponent } from "./ngx-spine-webgl.component";

describe("NgxSpineWebglComponent", () => {
  let component: NgxSpineWebglComponent;
  let fixture: ComponentFixture<NgxSpineWebglComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxSpineWebglComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxSpineWebglComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
