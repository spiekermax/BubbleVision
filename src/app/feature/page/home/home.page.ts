// Angular
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";

// Material Design
import { MatDialog } from "@angular/material/dialog";

// Reactive X
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

// Internal dependencies
import { TwitterCommunity } from "src/app/shared/model/twitter/twitter-community";
import { TwitterProfile } from "src/app/shared/model/twitter/twitter-profile";

import { TwitterGraphComponent } from "src/app/shared/component/twitter-graph/twitter-graph.component";
import { TwitterDataService } from "src/app/shared/service/twitter-data/twitter-data.service";

import { SettingsDialog } from "../../dialog/settings/settings.dialog";
import { TwitterProfileDialog } from "../../dialog/twitter-profile/twitter-profile.dialog";


@Component
({
    selector: "home-page",
    templateUrl: "./home.page.html",
    styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit
{
    /* COMPONENTS */

    @ViewChild(TwitterGraphComponent)
    private twitterGraph?: TwitterGraphComponent;


    /* ATTRIBUTES */

    public searchFormControl: FormControl = new FormControl();

    public twitterProfiles: TwitterProfile[] = [];
    public twitterCommunities0: TwitterCommunity[] = [];
    public twitterCommunities1: TwitterCommunity[] = [];

    public filteredTwitterProfiles?: Observable<TwitterProfile[]>;


    /* LIFECYCLE */

    public constructor(private dialog: MatDialog, private twitterDataService: TwitterDataService)
    {
        // Load twitter profiles
        this.twitterDataService.loadProfiles().subscribe(twitterProfiles => 
        {
            this.twitterProfiles = twitterProfiles;
        });

        // Load twitter communities
        this.twitterDataService.loadCommunities0().subscribe(twitterCommunities =>
        {
            this.twitterCommunities0 = twitterCommunities;    
        });
        this.twitterDataService.loadCommunities1().subscribe(twitterCommunities =>
        {
            this.twitterCommunities1 = twitterCommunities;
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

    public openSettingsDialog() : void
    {
        this.dialog.open(SettingsDialog);
    }
}