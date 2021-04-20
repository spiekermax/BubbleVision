// Angular
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// Reactive X
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

// Internal dependencies
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
        return this.http.get<any>("assets/graph/de_1000_mapping.json").pipe(map((json: any) =>
        {
            // Transform profiles
            return json.profiles.map((profile: any) =>
            {
                const twitterProfile: TwitterProfile =
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

                return twitterProfile;
            });
        }));
    }
}