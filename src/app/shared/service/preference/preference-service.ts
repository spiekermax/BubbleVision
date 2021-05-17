// Angular
import { Injectable } from "@angular/core";


@Injectable
({
    providedIn: "root"
})
export class PreferenceService 
{
    /* CONSTANTS */

    // Keys
    private static readonly KEY_TWITTER_PROFILE_RESOLUTION: string = "twitter-profile-resolution";
    private static readonly KEY_TWITTER_COMMUNITY_RESOLUTION: string = "twitter-community-resolution";

    // Defaults
    private static readonly DEFAULT_TWITTER_PROFILE_RESOLUTION: number = 0.5;
    private static readonly DEFAULT_TWITTER_COMMUNITY_RESOLUTION: number = 0.01;


    /* GETTER & SETTER */

    public get twitterProfileResolution() : number
    {
        const valueString: string | null = localStorage.getItem(PreferenceService.KEY_TWITTER_PROFILE_RESOLUTION);
        return valueString ? +valueString : PreferenceService.DEFAULT_TWITTER_PROFILE_RESOLUTION;
    }

    public set twitterProfileResolution(newTwitterProfileResolution: number)
    {
        localStorage.setItem(PreferenceService.KEY_TWITTER_PROFILE_RESOLUTION, newTwitterProfileResolution.toString());
    }

    public get twitterCommunityResolution() : number
    {
        const valueString: string | null = localStorage.getItem(PreferenceService.KEY_TWITTER_COMMUNITY_RESOLUTION);
        return valueString ? +valueString : PreferenceService.DEFAULT_TWITTER_COMMUNITY_RESOLUTION;
    }

    public set twitterCommunityResolution(newTwitterCommunityResolution: number)
    {
        localStorage.setItem(PreferenceService.KEY_TWITTER_COMMUNITY_RESOLUTION, newTwitterCommunityResolution.toString());
    }
}