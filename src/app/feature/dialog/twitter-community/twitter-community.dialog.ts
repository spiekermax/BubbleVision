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


    /* CONSTANTS */
    
    private static readonly TWITTER_TIMELINE_TIMEOUT: number = 5000;
    
    
    /* ATTRIBUTES */
    
    public twitterTimelineState: "loading" | "loaded" = "loading";
    public twitterTimelineTimeout: boolean = false;


    /* LIFECYCLE */
  
    public constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<TwitterCommunityDialog>, @Inject(MAT_DIALOG_DATA) private data: [TwitterCommunity, TwitterProfile[]]) {}


    /* CALLBACKS */

    public onMemberClicked(member: TwitterProfile) : void
    {
        this.dialogRef.close(member);
    }

    public onSelectedTabChanged(tabIndex: number) : void
    {
        if(tabIndex != 1) return;

        // Reset state
        this.twitterTimelineState = "loading";
        this.twitterTimelineTimeout = false;

        // Load twitter widget
        (<any> window).twttr.widgets.load().then(() => this.twitterTimelineState = "loaded");

        // Timeout
        setTimeout(() => this.twitterTimelineTimeout = true, TwitterCommunityDialog.TWITTER_TIMELINE_TIMEOUT);
    }


    /* GETTER & SETTER */

    public get name() : string
    {
        return this.community.name;
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

    public get twitterListUrl() : string
    {
        return `https://twitter.com/${this.community.twitterList.author}/lists/${this.community.twitterList.slug}`;
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