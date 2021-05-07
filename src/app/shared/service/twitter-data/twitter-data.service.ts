// Angular
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// Reactive X
import { forkJoin, Observable, of, timer } from "rxjs";
import { concatMap, filter, map, switchMap, take } from "rxjs/operators";

// Internal dependencies
import { Position } from "../../model/position/position";

import { TwitterCommunity } from "../../model/twitter/community/twitter-community";
import { TwitterProfile } from "../../model/twitter/profile/twitter-profile";


@Injectable
({
    providedIn: "root"
})
export class TwitterDataService 
{
    /* CONSTANTS */

    private static readonly TWITTER_MINER_API_URL: string = "https://192.168.2.147:1234/api/";
    private static readonly TWITTER_MINER_API_KEY: string = "bWF4OjNKNTVKMWN6UFdFeHNjdDQ";

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
        return this.postToTwitterMinerAPI<void>(`miner/scan?username=${username}`, null).pipe(switchMap(() =>
        {
            return this.postToTwitterMinerAPI<void>(`export/distances`,
            {
                "langs": {
                    "de": {
                        "num_profiles": 0
                    }
                },
                "include_usernames": [username],
                "landmarks": landmarks.map(landmark => landmark.username)
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
                const normalizationFactor: number = data.distances.reduce((a, b) => a + b);
                const normalizedDistances: number[] = data.distances.map(distance => distance / normalizationFactor);

                const profilePosition: Position = { x: 0, y: 0 };
                for(let i = 0; i < landmarks.length; ++i)
                {
                    profilePosition.x += landmarks[i].position.x * normalizedDistances[i];
                    profilePosition.y += landmarks[i].position.y * normalizedDistances[i];
                }

                const profile: TwitterProfile =
                {
                    id: data.info.twitterId,
                    communityId: 21 * 21,
                    name: data.info.name,
                    username: data.info.username,
                    description: data.info.description || "",
                    verified: data.info.verified,
                    imageUrl: data.info.profile_image_url,
                    followerCount: data.info.followers_count,
                    followeeCount: data.info.followees_count,
                    position: profilePosition,
                    isLandmark: true
                };

                return profile;
            }));
        }));
    }

    public loadCommunities() : Observable<TwitterCommunity[]>
    {
        return this.http.get<TwitterCommunity[]>("assets/graph/de_1000_community_info.json");
    }


    /* UTILITY */

    private getFromTwitterMinerAPI<T>(url: string) : Observable<T>
    {
        return this.http.get<T>(TwitterDataService.TWITTER_MINER_API_URL + url, 
        { 
            headers: 
            { 
                "Authorization": `Basic ${TwitterDataService.TWITTER_MINER_API_KEY}`,
            }
        });
    }

    private postToTwitterMinerAPI<T>(url: string, body: any) : Observable<T>
    {
        return this.http.post<T>(TwitterDataService.TWITTER_MINER_API_URL + url, body, 
        { 
            headers: 
            { 
                "Authorization": `Basic ${TwitterDataService.TWITTER_MINER_API_KEY}`,
            }
        });
    }
}