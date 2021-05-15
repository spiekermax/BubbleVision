// Angular
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// Material Design
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from "@angular/material/slider";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";

// Internal dependencies
import { AppRoot } from "./app.root";
import { AppRoutingModule } from "./app-routing.module";

import { HomePage } from "./feature/page/home/home.page";

import { HelpDialog } from "./feature/dialog/help/help.dialog";
import { LoadingDialog } from "./feature/dialog/loading/loading.dialog";
import { SettingsDialog } from "./feature/dialog/settings/settings.dialog";

import { TwitterCommunityDialog } from "./feature/dialog/twitter-community/twitter-community.dialog";
import { TwitterProfileDialog } from "./feature/dialog/twitter-profile/twitter-profile.dialog";

import { TwitterGraphComponent } from "./shared/component/twitter-graph/twitter-graph.component";


@NgModule({
    declarations: [
        AppRoot,
        HomePage,

        HelpDialog,
        LoadingDialog,
        SettingsDialog,

        TwitterCommunityDialog,
        TwitterProfileDialog,

        TwitterGraphComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        HttpClientModule,

        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSliderModule,
        MatTabsModule,
        MatToolbarModule
    ],
    providers: [],
    bootstrap: [AppRoot]
})
export class AppModule {}