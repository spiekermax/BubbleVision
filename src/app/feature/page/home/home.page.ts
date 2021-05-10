// Angular
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";

// Material Design
import { MatDialog } from "@angular/material/dialog";

// Reactive X
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

// Internal dependencies
import { Utils } from "src/app/core/utils";

import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";
import { TwitterProfile } from "src/app/shared/model/twitter/profile/twitter-profile";

import { TwitterGraphComponent } from "src/app/shared/component/twitter-graph/twitter-graph.component";
import { TwitterDataService } from "src/app/shared/service/twitter-data/twitter-data.service";

import { HelpDialog } from "../../dialog/help/help.dialog";
import { LoadingDialog } from "../../dialog/loading/loading.dialog";
import { SettingsDialog } from "../../dialog/settings/settings.dialog";

import { TwitterProfileDialog } from "../../dialog/twitter-profile/twitter-profile.dialog";
import { TwitterCommunityDialog } from "../../dialog/twitter-community/twitter-community.dialog";

import { SearchResult } from "./model/search-result";


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
    public searchResults?: Observable<SearchResult[]>;

    public twitterProfiles: TwitterProfile[] = [];
    public twitterCommunities: TwitterCommunity[] = [];

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
        this.searchResults = this.searchFormControl.valueChanges.pipe
        (
            startWith(""),
            map((query?: string | SearchResult) => typeof query === "string" ? query : undefined),
            map((query?: string) => this.search(query))
        );
    }


    /* CALLBACKS */

    public onTwitterFollowersLimitSliderChanged() : void
    {
        this.twitterGraph?.highlightProfiles((twitterProfile: TwitterProfile) =>
        {
            return twitterProfile.followerCount >= this.minTwitterFollowersLimit && twitterProfile.followerCount <= this.maxTwitterFollowersLimit;
        });

        this.twitterGraph?.highlightCommunities((twitterCommunity: TwitterCommunity) =>
        {
            return this.twitterProfiles.some(twitterProfile =>
            {
                return twitterProfile.followerCount >= this.minTwitterFollowersLimit 
                    && twitterProfile.followerCount <= this.maxTwitterFollowersLimit 
                    && twitterCommunity.members.includes(twitterProfile.username); 
            });
        })
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

    public onSearchResultSelected(searchResult: SearchResult) : void
    {
        switch(searchResult.type)
        {
            case "existing-twitter-profile":
            {
                // Zoom to selected profile
                setTimeout(() => this.twitterGraph?.zoomToProfile(searchResult.data), 100);
                break;
            }
            case "custom-twitter-profile":
            {
                // Aggregate landmarks
                const landmarks: TwitterProfile[] = this.twitterProfiles.filter(profile => profile.isLandmark);
                
                // Load specified profile
                const loadingDialog = this.dialog.open(LoadingDialog, { autoFocus: false, disableClose: true, data: { loadingMessage: "Analysiere Profil..." } });
                const loadingObservable = this.twitterDataService.loadProfile(searchResult.data, landmarks).subscribe(profile => 
                {
                    this.twitterProfiles = [...this.twitterProfiles, profile];
                    
                    setTimeout(() =>
                    {
                        // Close loading dialog
                        loadingDialog.close();

                        // Zoom to added profile
                        setTimeout(() => this.twitterGraph?.zoomToProfile(profile), 250);

                    }, 250);
                });

                // Cancel loading if dialog closed
                loadingDialog.afterClosed().subscribe(() => loadingObservable.unsubscribe());

                break;
            }
        }
    }


    /* METHODS */

    private search(query?: string) : SearchResult[]
    {
        if(!query || !this.twitterProfiles) return [];

        // Sanitize query
        const sanitizedQuery: string = query.trim().replace(/\@/g, "");

        // Check if query is too short
        if(sanitizedQuery.length < 3) return [];

        // Normalize query
        const normalizedQuery: string = sanitizedQuery.toLowerCase();

        // Search twitter profiles
        const twitterProfileSearchResults: SearchResult[] = this.twitterProfiles.filter(profile =>
        { 
            return profile.name.toLowerCase().includes(normalizedQuery) 
                || profile.username.toLowerCase().includes(normalizedQuery)
                || profile.description.toLowerCase().includes(normalizedQuery);
        })
        .sort((a, b) => b.followerCount - a.followerCount)
        .map(profile => ({ type: "existing-twitter-profile", data: profile }));

        // Aggregate search results
        const searchResults: SearchResult[] = [];
        searchResults.push(...twitterProfileSearchResults);

        if(!this.twitterProfiles.some(profile => profile.username.toLowerCase() == normalizedQuery))
            searchResults.push({ type: "custom-twitter-profile", data: sanitizedQuery });

        return searchResults;
    }

    public stringifySearchResult(searchResult?: SearchResult) : string
    {
        if(!searchResult) return "";

        switch(searchResult.type)
        {
            case "existing-twitter-profile":
            {
                return `${searchResult.data.name} (@${searchResult.data.username})`;
            }
            case "custom-twitter-profile":
            {
                return "";
            }
        }
    }


    /* METHODS - DIALOGS */

    public openHelpDialog() : void
    {
        this.dialog.open(HelpDialog);
    }

    public openSettingsDialog() : void
    {
        this.dialog.open(SettingsDialog);
    }

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
            setTimeout(() => this.twitterGraph?.zoomToProfile(clickedMember), 100);
        });
    }
}