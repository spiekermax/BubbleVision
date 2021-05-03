// Angular
import { Component, Inject } from "@angular/core";

// Material Design
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

// Internal dependencies
import { Utils } from "src/app/core/utils";

import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";
import { TwitterProfile } from "src/app/shared/model/twitter/profile/twitter-profile";


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
  
    public constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<TwitterCommunityDialog>, @Inject(MAT_DIALOG_DATA) private data: [TwitterCommunity, TwitterProfile[]]) {}


    /* CALLBACKS */

    public onMemberClicked(member: TwitterProfile) : void
    {
        this.dialogRef.close(member);
    }


    /* GETTER & SETTER */

    public get name() : string
    {
        return this.community.hotspots["0"][0].name;
    }

    public get minFollowers() : string
    {
        const minFollowers: number = Math.min(...this.members.map(profile => profile.followerCount));

        return Utils.shortenNumber(minFollowers);
    }

    public get maxFollowers() : string
    {
        const maxFollowers: number = Math.max(...this.members.map(profile => profile.followerCount));

        return Utils.shortenNumber(maxFollowers);
    }

    public get membersSortedByFollowers() : TwitterProfile[]
    {
        return this.members.sort((a, b) => b.followerCount - a.followerCount);
    }


    /* UTILITY */

    private get community() : TwitterCommunity
    {
        return this.data[0];
    }

    private get members() : TwitterProfile[]
    {
        return this.data[1];
    }
}