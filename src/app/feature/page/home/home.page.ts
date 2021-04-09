// Angular
import { Component } from "@angular/core";

// Material Design
import { MatDialog } from "@angular/material/dialog";
import { SettingsDialog } from "../../dialog/settings/settings.dialog";


@Component({
    selector: "app-home-page",
    templateUrl: "./home.page.html",
    styleUrls: ["./home.page.scss"]
})
export class HomePage
{
    /* LIFECYCLE */

    public constructor(private dialog: MatDialog) {}


    /* CALLBACKS */

    public onSettingsButtonClicked() : void
    {
        this.dialog.open(SettingsDialog);
    }
}