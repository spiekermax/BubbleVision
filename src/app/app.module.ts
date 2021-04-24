// Angular
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// Material Design
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
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
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

        MatAutocompleteModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatToolbarModule
    ],
    providers: [],
    bootstrap: [AppRoot]
})
export class AppModule {}