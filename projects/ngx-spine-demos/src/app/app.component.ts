import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  animation = null;
  animations = [];
  skin = null;
  skins = [];
  speed = 1;
  spine = "spineboy-3-7";
  dataUrls = {
    atlas: "/assets/spineboy-3-7.atlas",
    skel: "/assets/spineboy-3-7.skel"
  };

  selectSpine(spine: string) {
    this.spine = spine;
    this.dataUrls = {
      atlas: `/assets/${spine}.atlas`,
      skel: `/assets/${spine}.skel`
    };
  }
}
