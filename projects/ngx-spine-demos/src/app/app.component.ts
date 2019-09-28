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
  spine = "spineboy-3-8";
}
