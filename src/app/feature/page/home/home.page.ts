// Angular
import { Component } from "@angular/core";

// Internal dependencies
import TwitterProfile from "src/app/shared/model/twitter/twitter-profile";
import GraphDataService from "src/app/shared/service/graph-data/graph-data.service";


@Component
({
    selector: "home-page",
    templateUrl: "./home.page.html",
    styleUrls: ["./home.page.scss"]
})
export class HomePage
{
    /* ATTRIBUTES */

    public twitterProfiles!: TwitterProfile[];


    /* LIFECYCLE */

    public constructor(private graphDataService: GraphDataService)
    {
        this.graphDataService.getGraph().subscribe(twitterProfiles => 
        {
            this.twitterProfiles = twitterProfiles;
        });
    }
}