// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component
({
    selector: "welcome-dialog",
    templateUrl: "./welcome.dialog.html",
    styleUrls: ["./welcome.dialog.scss"]
})
export class WelcomeDialog
{
    /* LIFECYCLE */
  
    public constructor(private dialogRef: MatDialogRef<WelcomeDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}