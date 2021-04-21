// Angular
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// Reactive X
import { forkJoin, Observable } from "rxjs";
import { map } from 'rxjs/operators';

// Internal dependencies
import TwitterCommunity from "../../model/twitter/twitter-community";
import TwitterProfile from "../../model/twitter/twitter-profile";


@Injectable
({
    providedIn: "root"
})
export default class TwitterDataService 
{
    /* CONSTANTS */

    private static readonly GRAPH_SCALING_FACTOR: number = 1000;


    /* LIFECYCLE */

    public constructor(private http: HttpClient) {}


    /* METHODS */

    public getProfiles() : Observable<TwitterProfile[]>
    {
        return forkJoin
        ({
            mapping: this.http.get<any>("assets/graph/de_1000_community_mapping.json"),
            communities: this.http.get<any>("assets/graph/de_1000_communities.json")
        })
        .pipe(map((json: any) =>
        {
            // Transform data
            return json.mapping.profiles.map((profile: any) =>
            {
                // Acquire basic information
                const twitterProfile: Partial<TwitterProfile> =
                {
                    id: profile.twitterId,
                    name: profile.name,
                    username: profile.username,
                    position:
                    {
                        x: profile.position[0] * TwitterDataService.GRAPH_SCALING_FACTOR,
                        y: profile.position[1] * TwitterDataService.GRAPH_SCALING_FACTOR
                    }
                };

                // Find associated community
                for(const communityId of Object.keys(json.communities))
                {
                    if(json.communities[communityId].includes(profile.username))
                    {
                        twitterProfile.community =
                        {
                            id: Number(communityId),
                            size: json.communities[communityId].length
                        }
                        break;
                    }
                }

                return twitterProfile;
            });
        }));
    }

    public getCommunities() : Observable<TwitterCommunity[]>
    {
        return this.http.get<any>("assets/graph/de_1000_communities.json").pipe(map((json: any) =>
        {
            const twitterCommunities: TwitterCommunity[] = [];
            for(const communityId of Object.keys(json))
            {
                const twitterCommunity: TwitterCommunity =
                {
                    id: Number(communityId),
                    size: json[communityId].length
                };

                twitterCommunities.push(twitterCommunity);
            }

            return twitterCommunities;
        }));
    }
}