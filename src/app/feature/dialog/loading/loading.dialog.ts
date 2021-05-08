// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component
({
    selector: "loading-dialog",
    templateUrl: "./loading.dialog.html",
    styleUrls: ["./loading.dialog.scss"]
})
export class LoadingDialog
{
    /* LIFECYCLE */
  
    public constructor(private dialogRef: MatDialogRef<LoadingDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}
}