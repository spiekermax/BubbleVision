// Angular
import { Component } from "@angular/core";

// Internal dependencies
import TwitterProfile from "src/app/shared/model/twitter/twitter-profile";
import TwitterDataService from "src/app/shared/service/twitter-data/twitter-data.service";


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

    public constructor(private twitterDataService: TwitterDataService)
    {
        this.twitterDataService.getProfiles().subscribe(twitterProfiles => 
        {
            this.twitterProfiles = twitterProfiles;
        });
    }
}