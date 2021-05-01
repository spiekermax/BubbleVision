// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";
import { TwitterCommunityHotspot } from "src/app/shared/model/twitter/community/twitter-community-hotspot";

import { TwitterGraphCamera } from "../camera/twitter-graph-camera";


export class TwitterGraphCommunityView extends PIXI.Container
{
    /* STATIC */

    // Constants
    private static readonly COLOR_MAP: number[] =
    [
        0xe6194B,
        0x3cb44b,
        0xffe119,
        0x4363d8,
        0xf58231,
        0x911eb4,
        0x42d4f4,
        0xf032e6,
        0xbfef45,
        0xfabed4,
        0x469990,
        0xdcbeff,
        0x9A6324,
        0xfffac8,
        0x800000,
        0xaaffc3,
        0x808000,
        0xffd8b1,
        0x000075,
        0xa9a9a9
    ];


    /* ATTRIBUTES */

    private scalingFactor: number = TwitterGraphCamera.getLodScalingFactor(this.lod);


    /* LIFECYCLE */

    public constructor(private renderer: PIXI.Renderer, private community: TwitterCommunity, private lod: number)
    {
        super();

        //
        this.zIndex = this.community.size;

        // Add graphics
        for(const lod of Object.keys(community.hotspots))
        {
            if(lod != this.lod.toString()) continue;

            // Iterate over hotspots
            for(const hotspot of community.hotspots[lod])
            {
                if(hotspot.radius < 0.1) continue;

                this.addHotspotBackground(hotspot);
                this.addHotspotLabel(hotspot);
            }
        }
    }


    /* INITIALIZATION */

    private addHotspotBackground(hotspot: TwitterCommunityHotspot) : void
    {
        //
        const circle: PIXI.Graphics = new PIXI.Graphics();
        circle.beginFill(TwitterGraphCommunityView.COLOR_MAP[this.community.id % 21]);
        circle.drawCircle(0, 0, (1000 / this.scalingFactor) * hotspot.radius);
        circle.endFill();

        //
        circle.alpha = 0.82;

        //
        const circleTexture: PIXI.Texture = this.renderer.generateTexture(circle, PIXI.SCALE_MODES.LINEAR, 1);
        const circleSprite: PIXI.Sprite = PIXI.Sprite.from(circleTexture);

        //
        circleSprite.position.x = (1000 / this.scalingFactor) * (hotspot.centroid[0] - hotspot.radius);
        circleSprite.position.y = (1000 / this.scalingFactor) * (hotspot.centroid[1] - hotspot.radius);
        
        circleSprite.interactive = true;
        circleSprite.cursor = "pointer";
        circleSprite.hitArea = new PIXI.Circle((1000 / this.scalingFactor) * hotspot.radius, (1000 / this.scalingFactor) * hotspot.radius, (1000 / this.scalingFactor) * hotspot.radius);

        circleSprite.on("click", () => this.onHotspotClicked(hotspot));

        //
        this.addChild(circleSprite);
    }

    private addHotspotLabel(hotspot: TwitterCommunityHotspot) : void
    {
        const labelStyle: PIXI.TextStyle = new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (200 / this.scalingFactor) * hotspot.radius,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1200 / this.scalingFactor) * hotspot.radius
        });
        const label: PIXI.Text = new PIXI.Text("#" + hotspot.name?.toUpperCase() || "ERROR", labelStyle);
        
        const labelBounds: PIXI.Rectangle = label.getBounds();
        const labelWidth: number = labelBounds.width;
        const labelHeight: number = labelBounds.height;

        label.position.x = hotspot.centroid[0] * (1000 / this.scalingFactor) - labelWidth / 2;
        label.position.y = hotspot.centroid[1] * (1000 / this.scalingFactor) - labelHeight / 2;
        label.cacheAsBitmap = true;

        this.addChild(label);
    }


    /* CALLBACKS */

    private onHotspotClicked(hotspot: TwitterCommunityHotspot) : void
    {
        console.log(this.community, hotspot);
    }
}