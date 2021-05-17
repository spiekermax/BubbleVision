// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

// Internal dependencies
import { PreferenceService } from "src/app/shared/service/preference/preference-service";


@Component
({
    selector: "settings-dialog",
    templateUrl: "./settings.dialog.html",
    styleUrls: ["./settings.dialog.scss"]
})
export class SettingsDialog
{
    /* ATTRIBUTES */

    public twitterProfileResolution: number = this.preferenceService.twitterProfileResolution;
    public twitterCommunityResolution: number = this.preferenceService.twitterCommunityResolution;


    /* LIFECYCLE */
  
    public constructor(private dialogRef: MatDialogRef<SettingsDialog>, @Inject(MAT_DIALOG_DATA) private data: any, private preferenceService: PreferenceService) {}


    /* CALLBACKS */

    public onTwitterProfileResolutionSliderMoved(twitterProfileResolution: number | null) : void
    {
        if(twitterProfileResolution === null) return;

        this.twitterProfileResolution = twitterProfileResolution;
    }

    public onApplyButtonClicked() : void
    {
        this.preferenceService.twitterProfileResolution = this.twitterProfileResolution;
        this.preferenceService.twitterCommunityResolution = this.twitterCommunityResolution;

        this.dialogRef.close
        ({
            twitterProfileResolution: this.twitterProfileResolution,
            twitterCommunityResolution:  this.twitterCommunityResolution
        });
    }


    /* GETTER & SETTER */

    public get twitterProfileResolutionPercentage() : number
    {
        return ~~(this.twitterProfileResolution * 100);
    }

    public get twitterCommunityResolutionPercentage() : number
    {
        return ~~(this.twitterCommunityResolution * 100);
    }
}