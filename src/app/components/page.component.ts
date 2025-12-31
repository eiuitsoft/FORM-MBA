import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./layouts/navbar/navbar.component";
import { PageLayoutComponent } from "./layouts/page-layout/page-layout.component";

@Component({
  selector: "body",
  standalone: true,
  imports: [PageLayoutComponent, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <app-page-layout>
      <router-outlet/>
    </app-page-layout>
  `,
})

export class PageComponent {
  constructor() {}
}
