// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component
({
    selector: "help-dialog",
    templateUrl: "./help.dialog.html",
    styleUrls: ["./help.dialog.scss"]
})
export class HelpDialog
{
    /* LIFECYCLE */
  
    public constructor(private dialogRef: MatDialogRef<HelpDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}