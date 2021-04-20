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
export default class GraphDataService 
{
    /* LIFECYCLE */

    public constructor(private http: HttpClient) {}


    /* METHODS */

    public getGraph() : Observable<TwitterProfile[]>
    {
        return this.http.get<string>("assets/graph/de_1000_mapping.json").pipe(map((json: any) =>
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
                        x: profile.position[0] * 1000,
                        y: profile.position[1] * 1000
                    }
                };

                return twitterProfile;
            });
        }));
    }
}