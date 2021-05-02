// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Utils } from "src/app/core/utils";

// Internal dependencies
import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";
import { TwitterProfile } from "src/app/shared/model/twitter/profile/twitter-profile";
import { TwitterProfileDialog } from "../twitter-profile/twitter-profile.dialog";


@Component
({
    selector: "twitter-community-dialog",
    templateUrl: "./twitter-community.dialog.html",
    styleUrls: ["./twitter-community.dialog.scss"]
})
export class TwitterCommunityDialog
{
    /* NAMESPACES */

    public Utils = Utils;


    /* LIFECYCLE */
  
    public constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<TwitterCommunityDialog>, @Inject(MAT_DIALOG_DATA) private twitterData: [TwitterCommunity, TwitterProfile[]]) {}


    /* METHODS */

    public openTwitterProfileDialog(twitterProfile: TwitterProfile) : void
    {
        this.dialog.open(TwitterProfileDialog,
        { 
            data: twitterProfile,
            width: "514px"
        });
    }


    /* GETTER & SETTER */

    public get name() : string
    {
        return this.community.hotspots["0"][0].name;
    }

    public get biggestMembers() : TwitterProfile[]
    {
        return this.profiles.sort((a, b) => b.followerCount - a.followerCount);
    }

    public get minFollowers() : string
    {
        const minFollowers: number = Math.min(...this.profiles.map(profile => profile.followerCount));

        return Utils.shortenNumber(minFollowers);
    }

    public get maxFollowers() : string
    {
        const maxFollowers: number = Math.max(...this.profiles.map(profile => profile.followerCount));

        return Utils.shortenNumber(maxFollowers);
    }


    /* UTILITY */

    private get community() : TwitterCommunity
    {
        return this.twitterData[0];
    }

    private get profiles() : TwitterProfile[]
    {
        return this.twitterData[1];
    }
}