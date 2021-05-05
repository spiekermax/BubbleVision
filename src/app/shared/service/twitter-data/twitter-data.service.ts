// Angular
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// Reactive X
import { forkJoin, Observable } from "rxjs";
import { map } from "rxjs/operators";

// Internal dependencies
import { TwitterCommunity } from "../../model/twitter/community/twitter-community";
import { TwitterProfile } from "../../model/twitter/profile/twitter-profile";


@Injectable
({
    providedIn: "root"
})
export class TwitterDataService 
{
    /* CONSTANTS */

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
    
    public loadCommunities() : Observable<TwitterCommunity[]>
    {
        return this.http.get<TwitterCommunity[]>("assets/graph/de_1000_community_info.json");
    }
}