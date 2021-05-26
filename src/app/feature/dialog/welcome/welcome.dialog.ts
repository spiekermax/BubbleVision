// Angular
import { AfterViewInit, Component, Inject, ViewChild } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatHorizontalStepper } from "@angular/material/stepper";


@Component
({
    selector: "welcome-dialog",
    templateUrl: "./welcome.dialog.html",
    styleUrls: ["./welcome.dialog.scss"]
})
export class WelcomeDialog implements AfterViewInit
{
    /* COMPONENTS */

    @ViewChild(MatHorizontalStepper)
    private stepper?: MatHorizontalStepper;


    /* LIFECYCLE */

    public constructor(private dialogRef: MatDialogRef<WelcomeDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}

    public ngAfterViewInit() : void
    {
        this.stepper!._getIndicatorType = () => "number";
    }
}