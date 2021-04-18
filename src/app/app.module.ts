// Angular
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// Material Design
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";

// Internal dependencies
import { AppRoot } from "./app.root";
import { AppRoutingModule } from "./app-routing.module";

import { HomePage } from "./feature/page/home/home.page";
import { SettingsDialog } from "./feature/dialog/settings/settings.dialog";

import { TwitterGraph } from "./shared/component/twitter-graph/twitter-graph";


@NgModule({
    declarations: [
        AppRoot,
        HomePage,
        SettingsDialog,

        TwitterGraph
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,

        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatToolbarModule
    ],
    providers: [],
    bootstrap: [AppRoot]
})
export class AppModule {}