// Angular
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// Internal dependencies
import { AppRoot } from "./app.root";
import { AppRoutingModule } from "./app-routing.module";


@NgModule({
    declarations: [
        AppRoot
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule
    ],
    providers: [],
    bootstrap: [AppRoot]
})
export class AppModule {}