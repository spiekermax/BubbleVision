// Angular
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";

// Material Design
import { MatDialog } from "@angular/material/dialog";

// Reactive X
import { Observable, Subscription } from "rxjs";
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
export class HomePage implements OnInit, AfterViewInit
{
    /* NAMESPACES */

    public Utils = Utils;


    /* CONSTANTS */

    private static readonly MIN_TWITTER_FOLLOWERS_DEFAULT: number = 0;
    private static readonly MAX_TWITTER_FOLLOWERS_DEFAULT: number = 10e6;

    public readonly TWITTER_COMMUNITY_COLORS: string[] =
    [
        "#e6194B",
        "#3cb44b",
        "#ffe119",
        "#4363d8",
        "#f58231",
        "#911eb4",
        "#42d4f4",
        "#f032e6",
        "#bfef45",
        "#fabed4",
        "#469990",
        "#dcbeff",
        "#9A6324",
        "#fffac8",
        "#800000",
        "#aaffc3",
        "#808000",
        "#ffd8b1",
        "#000075",
        "#a9a9a9"
    ];


    /* COMPONENTS */

    @ViewChild(TwitterGraphComponent)
    private twitterGraph?: TwitterGraphComponent;


    /* ATTRIBUTES */

    public searchFormControl: FormControl = new FormControl();
    public searchResults?: Observable<SearchResult[]>;

    public followeeFilterFormControl: FormControl = new FormControl();
    public followeeFilterOptions?: Observable<TwitterProfile[]>;

    public twitterProfiles: TwitterProfile[] = [];
    public twitterCommunities: TwitterCommunity[] = [];

    public visibleTwitterProfiles: TwitterProfile[] = [];
    
    public visibleTwitterProfilesTweets: any[] = [];
    private visibleTwitterProfilesTweetsSubscription?: Subscription;
    
    public minTwitterFollowersLimit: number = HomePage.MIN_TWITTER_FOLLOWERS_DEFAULT;
    public maxTwitterFollowersLimit: number = HomePage.MAX_TWITTER_FOLLOWERS_DEFAULT;
    
    private isFolloweeFilterActive: boolean = false;
    private isMinTwitterFollowersFilterActive: boolean = false;
    private isMaxTwitterFollowersFilterActive: boolean = false;

    public isLoadingFolloweeFilterData: boolean = false;


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

        // Initialize followee filter autocomplete
        this.followeeFilterOptions = this.followeeFilterFormControl.valueChanges.pipe
        (
            startWith(""),
            map((query?: string | TwitterProfile) => typeof query === "string" ? query : undefined),
            map((query?: string) => this.searchTwitterProfile(query))
        );
    }

    public ngAfterViewInit() : void
    {
        //
        this.twitterGraph?.putHighlightCondition("reach", (twitterProfile: TwitterProfile) =>
        {
            return twitterProfile.followerCount >= this.minTwitterFollowersLimit 
                && twitterProfile.followerCount <= this.maxTwitterFollowersLimit;
        });
    }


    /* CALLBACKS */

    public onVisibleTwitterProfilesChanged(visibleTwitterProfiles: TwitterProfile[]) : void
    {
        //
        this.visibleTwitterProfilesTweetsSubscription?.unsubscribe();

        //
        this.visibleTwitterProfiles = visibleTwitterProfiles.sort((a, b) => b.followerCount - a.followerCount);

        //
        if(!this.visibleTwitterProfiles.length) return;

        //
        this.visibleTwitterProfilesTweetsSubscription = this.twitterDataService.loadTweets(visibleTwitterProfiles).subscribe((tweets: any[]) =>
        {
            this.visibleTwitterProfilesTweets = tweets;
        });
    }

    public onSearchResultSelected(searchResult: SearchResult) : void
    {
        switch(searchResult.type)
        {
            case "existing-twitter-profile":
            {
                // Zoom to selected profile
                this.zoomToTwitterProfile(searchResult.data, 100);
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
                    // Update graph
                    this.twitterGraph?.addProfile(profile);
                    
                    // Delay
                    setTimeout(() =>
                    {
                        // Close loading dialog
                        loadingDialog.close();

                        // Zoom to added profile
                        this.zoomToTwitterProfile(profile, 500);

                    }, 250);
                });

                // Cancel loading if dialog closed
                loadingDialog.afterClosed().subscribe(() => loadingObservable.unsubscribe());

                break;
            }
        }
    }

    public onTwitterFollowersLimitSliderChanged() : void
    {
        this.twitterGraph?.updateHighlights();

        this.isMinTwitterFollowersFilterActive = this.minTwitterFollowersLimit != HomePage.MIN_TWITTER_FOLLOWERS_DEFAULT;
        this.isMaxTwitterFollowersFilterActive = this.maxTwitterFollowersLimit != HomePage.MAX_TWITTER_FOLLOWERS_DEFAULT;
    }

    public onMinTwitterFollowersLimitSliderMoved(value: number | null) : void
    {
        if(value === null) return;

        this.minTwitterFollowersLimit = 10 * value * value;
    }

    public onMaxTwitterFollowersLimitSliderMoved(value: number | null) : void
    {
        if(value === null) return;

        this.maxTwitterFollowersLimit = 10 * value * value;
    }

    public onFolloweeFilterOptionSelected(twitterProfile: TwitterProfile) : void
    {
        //
        this.isLoadingFolloweeFilterData = true;

        //
        this.twitterDataService.loadProfileFollowees(twitterProfile.username).subscribe(data =>
        {
            //
            const followeeIds: number[] = data.map(followee => followee.id!);

            //
            this.twitterGraph?.putHighlightCondition("followee", twitterProfile => followeeIds.includes(twitterProfile.id));
            this.twitterGraph?.updateHighlights();

            //
            this.isFolloweeFilterActive = true;
            this.isLoadingFolloweeFilterData = false;
        });
    }

    public onFolloweeFilterReset() : void
    {
        this.followeeFilterFormControl.reset();

        this.twitterGraph?.takeHighlightCondition("followee");
        this.twitterGraph?.updateHighlights();

        this.isFolloweeFilterActive = false;
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

    private searchTwitterProfile(query?: string) : TwitterProfile[]
    {
        if(!query || !this.twitterProfiles) return [];

        // Sanitize query
        const sanitizedQuery: string = query.trim().replace(/\@/g, "");

        // Check if query is too short
        if(sanitizedQuery.length < 3) return [];

        // Normalize query
        const normalizedQuery: string = sanitizedQuery.toLowerCase();

        // Search twitter profiles
        return this.twitterProfiles.filter(profile =>
        { 
            return profile.name.toLowerCase().includes(normalizedQuery) 
                || profile.username.toLowerCase().includes(normalizedQuery);
        })
        .sort((a, b) => b.followerCount - a.followerCount);
    }

    public stringifyTwitterProfile(twitterProfile?: TwitterProfile) : string
    {
        if(!twitterProfile) return "";

        return `${twitterProfile.username}`;
    }

    public zoomToTwitterProfile(twitterProfile: TwitterProfile, delay: number = 0) : void
    {
        setTimeout(() => this.twitterGraph?.zoomToProfile(twitterProfile), delay);
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
            this.zoomToTwitterProfile(clickedMember, 100);
        });
    }


    /* GETTER & SETTER */

    public get activeFilterCount() : number
    {
        return (+this.isFolloweeFilterActive) + (+this.isMinTwitterFollowersFilterActive) + (+this.isMaxTwitterFollowersFilterActive);
    }
}