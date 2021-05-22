// Angular
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";

// Material Design
import { MatDialog } from "@angular/material/dialog";

// Reactive X
import { Observable, Subscription } from "rxjs";
import { map, startWith } from "rxjs/operators";

// Internal dependencies
import { Colors } from "src/app/core/colors";
import { Utils } from "src/app/core/utils";

import { Tweet } from "src/app/shared/model/twitter/tweet/tweet";
import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";
import { TwitterProfile } from "src/app/shared/model/twitter/profile/twitter-profile";
import { SearchResult } from "./model/search-result";

import { PreferenceService } from "src/app/shared/service/preference/preference-service";
import { TwitterDataService } from "src/app/shared/service/twitter-data/twitter-data.service";

import { TwitterGraphComponent } from "src/app/shared/component/twitter-graph/twitter-graph.component";

import { HelpDialog } from "../../dialog/help/help.dialog";
import { LoadingDialog } from "../../dialog/loading/loading.dialog";
import { SettingsDialog } from "../../dialog/settings/settings.dialog";

import { TwitterProfileDialog } from "../../dialog/twitter-profile/twitter-profile.dialog";
import { TwitterCommunityDialog } from "../../dialog/twitter-community/twitter-community.dialog";


@Component
({
    selector: "home-page",
    templateUrl: "./home.page.html",
    styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit, AfterViewInit
{
    /* NAMESPACES */

    public Colors = Colors;
    public Utils = Utils;


    /* CONSTANTS */

    private static readonly MIN_FOLLOWERS_DEFAULT: number = 0;
    private static readonly MAX_FOLLOWERS_DEFAULT: number = 10e6;


    /* COMPONENTS */

    @ViewChild(TwitterGraphComponent)
    private twitterGraph?: TwitterGraphComponent;


    /* ATTRIBUTES */

    // Data
    public twitterProfiles: TwitterProfile[] = [];
    public twitterCommunities: TwitterCommunity[] = [];

    // Preferences
    public twitterGraphCullingEnabled: boolean = this.preferenceService.cullingEnabled;
    public twitterGraphProfileResolution: number = this.preferenceService.twitterProfileResolution;
    public twitterGraphCommunityResolution: number = this.preferenceService.twitterCommunityResolution;

    // Search controls
    public searchFormControl: FormControl = new FormControl();
    public searchResults?: Observable<SearchResult[]>;

    // Filter controls
    public followeeFilterFormControl: FormControl = new FormControl();
    public followeeFilterOptions?: Observable<TwitterProfile[]>;

    // Twitter graph state
    public visibleTwitterGraphProfiles: TwitterProfile[] = [];

    public visibleTwitterGraphProfileTweets: Tweet[] = [];
    public visibleTwitterGraphProfileTweetsSubscription?: Subscription;

    // Filter state
    public minFollowersLimit: number = HomePage.MIN_FOLLOWERS_DEFAULT;
    public maxFollowersLimit: number = HomePage.MAX_FOLLOWERS_DEFAULT;
    
    public isFolloweeFilterActive: boolean = false;
    public isFolloweeFilterLoading: boolean = false;

    public isMinTwitterFollowersFilterActive: boolean = false;
    public isMaxTwitterFollowersFilterActive: boolean = false;


    /* LIFECYCLE */

    public constructor(private dialog: MatDialog, private preferenceService: PreferenceService, private twitterDataService: TwitterDataService)
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
            return twitterProfile.followerCount >= this.minFollowersLimit 
                && twitterProfile.followerCount <= this.maxFollowersLimit;
        });
    }


    /* CALLBACKS */

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

    public onFollowersLimitSliderChanged() : void
    {
        this.twitterGraph?.updateHighlights();

        this.isMinTwitterFollowersFilterActive = this.minFollowersLimit != HomePage.MIN_FOLLOWERS_DEFAULT;
        this.isMaxTwitterFollowersFilterActive = this.maxFollowersLimit != HomePage.MAX_FOLLOWERS_DEFAULT;
    }

    public onMinFollowersLimitSliderMoved(value: number | null) : void
    {
        if(value === null) return;

        this.minFollowersLimit = 10 * value * value;
    }

    public onMaxFollowersLimitSliderMoved(value: number | null) : void
    {
        if(value === null) return;

        this.maxFollowersLimit = 10 * value * value;
    }

    public onFolloweeFilterOptionSelected(twitterProfile: TwitterProfile) : void
    {
        //
        this.isFolloweeFilterLoading = true;

        //
        this.twitterDataService.loadProfileFollowees(twitterProfile.username).subscribe(followees =>
        {
            //
            const followeeIds: number[] = followees.map(followee => followee.id!);

            //
            this.twitterGraph?.putHighlightCondition("followee", twitterProfile => followeeIds.includes(twitterProfile.id));
            this.twitterGraph?.updateHighlights();

            //
            this.isFolloweeFilterActive = true;
            this.isFolloweeFilterLoading = false;
        });
    }

    public onFolloweeFilterReset() : void
    {
        this.followeeFilterFormControl.reset();

        this.twitterGraph?.takeHighlightCondition("followee");
        this.twitterGraph?.updateHighlights();

        this.isFolloweeFilterActive = false;
    }

    public onVisibleTwitterGraphProfilesChanged(visibleTwitterProfiles: TwitterProfile[]) : void
    {
        //
        this.visibleTwitterGraphProfileTweetsSubscription?.unsubscribe();

        //
        this.visibleTwitterGraphProfiles = visibleTwitterProfiles.sort((a, b) => b.followerCount - a.followerCount);

        //
        if(!this.visibleTwitterGraphProfiles.length) return;

        //
        this.visibleTwitterGraphProfileTweetsSubscription = this.twitterDataService.loadTweets(visibleTwitterProfiles).subscribe((tweets: any[]) =>
        {
            this.visibleTwitterGraphProfileTweets = tweets;
        });
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
        this.dialog.open(SettingsDialog).afterClosed().subscribe((settings: any) =>
        {
            if(!settings) return;

            if(settings.cullingEnabled !== undefined)
                this.twitterGraphCullingEnabled = settings.cullingEnabled;

            if(settings.twitterProfileResolution !== undefined)
                this.twitterGraphProfileResolution = settings.twitterProfileResolution;
            
            if(settings.twitterCommunityResolution !== undefined)
                this.twitterGraphCommunityResolution = settings.twitterCommunityResolution;
        });
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