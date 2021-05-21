// Angular
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// Reactive X
import { forkJoin, Observable, of, timer } from "rxjs";
import { concatMap, filter, map, switchMap, take } from "rxjs/operators";

// Internal dependencies
import { Position } from "../../model/position/position";
import { Tweet } from "../../model/twitter/tweet/tweet";

import { TwitterCommunity } from "../../model/twitter/community/twitter-community";
import { TwitterProfile } from "../../model/twitter/profile/twitter-profile";


@Injectable
({
    providedIn: "root"
})
export class TwitterDataService 
{
    /* CONSTANTS */

    private static readonly TWITTER_MINER_API_URL: string = "http://localhost:3000/api/";
    private static readonly TWITTER_MINER_API_KEY: string = "bWF4OjNKNTVKMWN6UFdFeHNjdDQ=";

    private static readonly POSITION_SCALING_FACTOR: number = 1000;


    /* LIFECYCLE */

    public constructor(private http: HttpClient) {}


    /* METHODS */

    public loadProfiles() : Observable<TwitterProfile[]>
    {
        return forkJoin
        ({
            mapping: this.http.get<any>("assets/graph/de_1000_mapping_base.json"),
            communities: this.http.get<any>("assets/graph/de_1000_communities_weighted_louvain.json")
        })
        .pipe(map((json: any) =>
        {
            // Transform data
            return json.mapping.profiles.map((profileDTO: any) =>
            {
                // Acquire basic information
                const profile: Partial<TwitterProfile> =
                {
                    id: profileDTO.twitterId,
                    name: profileDTO.name,
                    username: profileDTO.username,
                    description: profileDTO.description || "",
                    verified: profileDTO.verified,
                    imageUrl: profileDTO.profileImageUrl,
                    followerCount: profileDTO.followerCount,
                    followeeCount: profileDTO.followeeCount,
                    position:
                    {
                        x: profileDTO.position[0] * TwitterDataService.POSITION_SCALING_FACTOR,
                        y: profileDTO.position[1] * TwitterDataService.POSITION_SCALING_FACTOR
                    },
                    isLandmark: profileDTO.isLandmark
                };

                // Find associated community
                for(const communityId of Object.keys(json.communities))
                {
                    if(json.communities[communityId].includes(profileDTO.username))
                    {
                        profile.communityId = Number(communityId);
                        break;
                    }
                }

                return profile;
            });
        }));
    }

    public loadProfile(username: string, landmarks: TwitterProfile[]) : Observable<TwitterProfile>
    {
        return this.postToTwitterMinerAPI(`miner/scan?username=${username}`, null).pipe(switchMap(() =>
        {
            return this.postToTwitterMinerAPI(`export/distances`,
            {
                langs: {
                    de: {
                        num_profiles: 0
                    }
                },
                include_usernames: [username],
                landmarks: landmarks.map(landmark => landmark.username)
            })
            .pipe(switchMap(() =>
            {
                return timer(0, 500)
                    .pipe(concatMap(() => this.getFromTwitterMinerAPI<any>("export/distances")))
                    .pipe(filter(response => response.done))
                    .pipe(map(response => response.data.profiles[0].position))
                    .pipe(take(1));
            }))
            .pipe(switchMap((distances: number[]) =>
            {
                return forkJoin
                ({
                    info: this.getFromTwitterMinerAPI<any>(`profile/info?username=${username}`),
                    distances: of(distances)
                });
            }))
            .pipe(map((data: { info: any, distances: number[] }) =>
            {
                const profilePosition: Position = { x: 0, y: 0 };
                
                const weights: number[] = [0.5, 0.2, 0.11, 0.05, 0.03, 0.025, 0.025, 0.02, 0.02, 0.02];
                const highestDistances: number[] = [...data.distances].sort((a, b) => b - a).splice(0, 10);
                for(let i = 0; i < highestDistances.length; ++i)
                {
                    const index: number = data.distances.indexOf(highestDistances[i]);
                    profilePosition.x += weights[i] * landmarks[index].position.x;
                    profilePosition.y += weights[i] * landmarks[index].position.y;
                }

                const profile: TwitterProfile =
                {
                    id: data.info.twitter_id,
                    communityId: 101 * 21 - 1,
                    name: data.info.name,
                    username: data.info.username,
                    description: data.info.description || "",
                    verified: data.info.verified,
                    imageUrl: data.info.profile_image_url.replace("_normal", "_200x200"),
                    followerCount: data.info.followers_count,
                    followeeCount: data.info.followees_count,
                    position: profilePosition,
                    isLandmark: true
                };

                return profile;
            }));
        }));
    }

    public loadProfileFollowees(username: string) : Observable<Partial<TwitterProfile>[]>
    {
        return this.getFromTwitterMinerAPI(`profile/relations?username=${username}`).pipe(map((data: any) =>
        {
            if(!data.followees) return [];

            return data.followees.map((followee: any) =>
            ({
                id: followee.twitter_id,
                name: followee.name,
                username: followee.username,
                description: followee.description,
                verified: followee.verified,
                imageUrl: followee.profile_image_url.replace("_normal", "_200x200"),
                followerCount: followee.followers_count,
                followeeCount: followee.followees_count
            }));
        }));
    }

    public loadCommunities() : Observable<TwitterCommunity[]>
    {
        return this.http.get<TwitterCommunity[]>("assets/graph/de_1000_community_info.json");
    }

    public loadTweets(profiles: TwitterProfile[]) : Observable<Tweet[]>
    {
        if(!profiles.length) return of([]);

        return this.getFromTwitterMinerAPI<any[]>(`tweets/multi?twitter_ids=${profiles.map(profile => profile.id)}`).pipe(map((data: any[]) =>
        {
            return data.filter((instance: any) => !instance.tweet.is_retweet && !instance.tweet.is_quote).map((instance: any) =>
            ({
                id: instance.tweet.twitter_id_str,
                author:
                {
                    name: instance.profile.name,
                    username: instance.profile.username,
                    verified: instance.profile.verified,
                    imageUrl: instance.profile.profile_image_url
                },
                text: instance.tweet.text,
                timestamp: instance.tweet.timestamp
            }));
        }));
    }


    /* UTILITY */

    private getFromTwitterMinerAPI<T>(url: string) : Observable<T>
    {
        return this.http.get<T>(TwitterDataService.TWITTER_MINER_API_URL + url, 
        { 
            headers: 
            { 
                "Authorization": `Basic ${TwitterDataService.TWITTER_MINER_API_KEY}`,
                "Content-Type":  "application/json"
            }
        });
    }

    private postToTwitterMinerAPI(url: string, body: any) : Observable<string>
    {
        return this.http.post(TwitterDataService.TWITTER_MINER_API_URL + url, body, 
        { 
            headers: 
            { 
                "Authorization": `Basic ${TwitterDataService.TWITTER_MINER_API_KEY}`,
                "Content-Type":  "text/plain"
            },
            responseType: "text"
        });
    }
}