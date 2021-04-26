// Angular
import { AfterViewInit, Component, Inject } from "@angular/core";

// Material Design
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

// Internal dependencies
import { Utils } from "src/app/core/utils";
import { TwitterProfile } from "src/app/shared/model/twitter/twitter-profile";


@Component
({
    selector: "twitter-profile-dialog",
    templateUrl: "./twitter-profile.dialog.html",
    styleUrls: ["./twitter-profile.dialog.scss"]
})
export class TwitterProfileDialog implements AfterViewInit
{
    /* LIFECYCLE */
  
    public constructor(private dialogRef: MatDialogRef<TwitterProfileDialog>, @Inject(MAT_DIALOG_DATA) private profile: TwitterProfile) {}

    public ngAfterViewInit() : void 
    {
        // Load twitter widget
        (<any> window).twttr.widgets.load();
    }


    /* GETTER & SETTER */

    public get name() : string
    {
        return Utils.twemojify(this.profile.name);
    }

    public get username() : string
    {
        return this.profile.username;
    }

    public get imageUrl() : string
    {
        return this.profile.imageUrl;
    }

    public get followerCount() : string
    {
        return Utils.shortenNumber(this.profile.followerCount);
    }

    public get followeeCount() : string
    {
        return Utils.shortenNumber(this.profile.followeeCount);
    }

    public get description() : string
    {
        return Utils.twemojify(Utils.urlify(this.profile.description));
    }
}