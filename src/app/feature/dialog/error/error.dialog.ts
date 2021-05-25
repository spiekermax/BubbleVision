// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component
({
    selector: "error-dialog",
    templateUrl: "./error.dialog.html",
    styleUrls: ["./error.dialog.scss"]
})
export class ErrorDialog
{
    /* LIFECYCLE */
  
    public constructor(private dialogRef: MatDialogRef<ErrorDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}