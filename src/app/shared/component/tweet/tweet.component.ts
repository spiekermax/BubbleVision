// Angular
import { Component, Input } from "@angular/core";

// Internal dependencies
import { Utils } from "src/app/core/utils";
import { Tweet } from "../../model/twitter/tweet/tweet";


@Component
({
    selector: "tweet",
    templateUrl: "./tweet.component.html",
    styleUrls: ["./tweet.component.scss"]
})
export class TweetComponent
{
    /* DIRECTIVES */

    @Input()
    public data?: Tweet;


    /* METHODS */

    public openTweetOnNewTab() : void
    {
        window.open(`https://twitter.com/${this.data!.author.username}/status/${this.data!.id}`, "_blank");
    }

    public likeTweetOnNewTab() : void
    {
        window.open(`https://twitter.com/intent/like?tweet_id=${this.data!.id}`, "_blank");
    }

    public openProfileOnNewTab() : void
    {
        window.open(`https://twitter.com/${this.data!.author.username}`, "_blank");
    }


    /* GETTER & SETTER */

    public get authorName() : string
    {
        return Utils.twemojify(this.data!.author.name);
    }

    public get authorUsername() : string
    {
        return this.data!.author.username;
    }

    public get authorVerified() : boolean
    {
        return this.data!.author.verified;
    }

    public get text() : string
    {
        return Utils.twemojify(Utils.urlify(this.data!.text));
    }

    public get creationTime() : { value: string | number, unit: string }
    {
        //
        const creationTimestamp: Date = new Date(this.data!.timestamp * 1000);

        //
        const secondsAgo: number = ~~((Date.now() - creationTimestamp.getTime()) / 1000);
        
        //
        if(secondsAgo > 60 * 60 * 24)
        {
            const creationTime =
            {
                value: creationTimestamp.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" }),
                unit: ""
            };

            return creationTime;
        }
        if(secondsAgo > 60 * 60)
        {
            const creationTime =
            {
                value: ~~(secondsAgo / (60 * 60)),
                unit: "h"
            };

            return creationTime;
        }
        if(secondsAgo > 60)
        {
            const creationTime =
            {
                value: ~~(secondsAgo / 60),
                unit: "m"
            };

            return creationTime;
        }

        const creationTime =
        {
            value: secondsAgo,
            unit: "s"
        };

        return creationTime;
    }
}