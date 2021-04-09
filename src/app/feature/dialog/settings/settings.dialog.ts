// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
    selector: "app-settings-dialog",
    templateUrl: "./settings.dialog.html",
    styleUrls: ["./settings.dialog.scss"]
})
export class SettingsDialog
{
    /* LIFECYCLE */
  
    public constructor(private dialogRef: MatDialogRef<SettingsDialog>, @Inject(MAT_DIALOG_DATA) private data: any) {}
}