// PIXI
import * as PIXI from "pixi.js";
import { AbstractRenderer } from "pixi.js";

// Internal dependencies
import TwitterProfile from "src/app/shared/model/twitter/twitter-profile";


export default class TwitterGraphProfileNode extends PIXI.Container
{
    /* CONSTANTS */

    private static readonly NODE_SIZE: number = 75;


    /* LIFECYCLE */

    public constructor(private profile: TwitterProfile, private background: PIXI.DisplayObject)
    {
        super();

        // Configure properties
        this.position.x = profile.position.x;
        this.position.y = profile.position.y;
        this.cursor = "pointer";
        this.interactive = true;
        
        // Add graphics
        this.addCircle();
        this.addLabel();
    }


    /* INITIALIZATION */

    private addCircle() : void
    {
        this.addChild(this.background);
    }

    private addLabel() : void
    {
        const text: PIXI.Text = new PIXI.Text(this.profile.name, new PIXI.TextStyle({ fill: "white", fontSize: 28 }));
        text.resolution = 1;

        const textBounds: PIXI.Rectangle = new PIXI.Rectangle();
        text.getLocalBounds(textBounds);

        const textWidth: number = textBounds.width;
        const textHeight: number = textBounds.height;
        
        text.position.set(150 - textWidth / 2, 150 - textHeight / 2);
        text.cacheAsBitmap = true;

        this.addChild(text);
    }
}