// Angular
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";

// Material Design
import { MatDialog } from "@angular/material/dialog";
import { MatSliderChange } from "@angular/material/slider";

// Reactive X
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

// Internal dependencies
import { Utils } from "src/app/core/utils";

import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";
import { TwitterProfile } from "src/app/shared/model/twitter/profile/twitter-profile";

import { TwitterGraphComponent } from "src/app/shared/component/twitter-graph/twitter-graph.component";
import { TwitterDataService } from "src/app/shared/service/twitter-data/twitter-data.service";

import { TwitterProfileDialog } from "../../dialog/twitter-profile/twitter-profile.dialog";
import { TwitterCommunityDialog } from "../../dialog/twitter-community/twitter-community.dialog";
import { SettingsDialog } from "../../dialog/settings/settings.dialog";


@Component
({
    selector: "home-page",
    templateUrl: "./home.page.html",
    styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit
{
    /* NAMESPACES */

    public Utils = Utils;


    /* COMPONENTS */

    @ViewChild(TwitterGraphComponent)
    private twitterGraph?: TwitterGraphComponent;


    /* ATTRIBUTES */

    public searchFormControl: FormControl = new FormControl();

    public twitterProfiles: TwitterProfile[] = [];
    public twitterCommunities: TwitterCommunity[] = [];

    public filteredTwitterProfiles?: Observable<TwitterProfile[]>;

    public minTwitterFollowersLimit: number = 0;
    public maxTwitterFollowersLimit: number = 10e6;


    /* LIFECYCLE */

    public constructor(private dialog: MatDialog, private twitterDataService: TwitterDataService)
    {
        // Load twitter profiles
        this.twitterDataService.loadProfiles().subscribe(twitterProfiles => 
        {
            this.twitterProfiles = twitterProfiles;
        });

        // Load twitter communities
        this.twitterDataService.loadCommunities().subscribe(twitterCommunities =>
        {
            this.twitterCommunities = twitterCommunities;    
        });
    }

    public ngOnInit() : void
    {
        // Initialize search autocomplete
        this.filteredTwitterProfiles = this.searchFormControl.valueChanges.pipe
        (
            startWith(""),
            map((query?: string | TwitterProfile) => typeof query === "string" ? query : undefined),
            map((query?: string) => this.searchTwitterProfiles(query))
        );
    }


    /* CALLBACKS */

    public onTwitterFollowersLimitSliderChanged() : void
    {
        this.twitterGraph?.highlightProfiles((profile: TwitterProfile) =>
        {
            return profile.followerCount >= this.minTwitterFollowersLimit && profile.followerCount <= this.maxTwitterFollowersLimit;
        });
    }

    public onTwitterMinFollowersLimitSliderMoved(value: number | null) : void
    {
        if(value === null) return;

        this.minTwitterFollowersLimit = 10 * value * value;
    }

    public onTwitterMaxFollowersLimitSliderMoved(value: number | null) : void
    {
        if(value === null) return;

        this.maxTwitterFollowersLimit = 10 * value * value;
    }

    public onSearchResultSelected(twitterProfile: TwitterProfile) : void
    {
        // Zoom to selected profile
        this.twitterGraph?.zoomToProfile(twitterProfile);
    }


    /* METHODS */

    private searchTwitterProfiles(query?: string) : TwitterProfile[]
    {
        if(!query || !this.twitterProfiles) return [];

        // Sanitize query
        const sanitizedQuery: string = query.trim().replace(/\@/g, "");

        // Check if query is too short
        if(sanitizedQuery.length < 3) return [];

        // Normalize query
        const normalizedQuery: string = sanitizedQuery.toLowerCase();

        // Filter twitter profiles
        return this.twitterProfiles.filter(profile =>
        { 
            return profile.name.toLowerCase().includes(normalizedQuery) ||
                profile.username.toLowerCase().includes(normalizedQuery) ||
                profile.description.toLowerCase().includes(normalizedQuery);
        })
        .sort((a, b) => b.followerCount - a.followerCount);
    }

    public stringifyTwitterProfile(twitterProfile?: TwitterProfile) : string
    {
        if(!twitterProfile) return "";

        return `${twitterProfile.name} (@${twitterProfile.username})`;
    }


    /* METHODS - DIALOGS */

    public openTwitterProfileDialog(twitterProfile: TwitterProfile) : void
    {
        this.dialog.open(TwitterProfileDialog,
        { 
            data: twitterProfile,
            width: "514px"
        });
    }

    public openTwitterCommunityDialog(twitterCommunity: TwitterCommunity) : void
    {
        const twitterCommunityMembers: TwitterProfile[] = this.twitterProfiles.filter(profile => twitterCommunity.members.includes(profile.username));

        this.dialog.open(TwitterCommunityDialog,
        { 
            data: [twitterCommunity, twitterCommunityMembers],
            width: "514px"
        })
        .afterClosed().subscribe((clickedMember?: TwitterProfile) =>
        {
            if(!clickedMember) return;

            // Zoom to selected profile
            this.twitterGraph?.zoomToProfile(clickedMember);
        });
    }

    public openSettingsDialog() : void
    {
        this.dialog.open(SettingsDialog);
    }
}