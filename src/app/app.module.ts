// Angular
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// Material Design
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";

// Internal dependencies
import { AppRoot } from "./app.root";
import { AppRoutingModule } from "./app-routing.module";

import { HomePage } from "./feature/page/home-page/home.page";


@NgModule({
    declarations: [
        AppRoot,
        HomePage
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,

        MatButtonModule,
        MatIconModule,
        MatToolbarModule
    ],
    providers: [],
    bootstrap: [AppRoot]
})
export class AppModule {}