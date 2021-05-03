// Reactive X
import { Observable, Subject } from "rxjs";

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

    // Events
    private clickSubject: Subject<void> = new Subject();


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
                this.addHotspotLabels(hotspot);
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

    private addHotspotLabels(hotspot: TwitterCommunityHotspot) : void
    {
        const nameLabelStyle: PIXI.TextStyle = new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (200 / this.scalingFactor) * hotspot.radius,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1500 / this.scalingFactor) * hotspot.radius
        });
        const nameLabel: PIXI.Text = new PIXI.Text("#" + hotspot.name?.toLowerCase() || "error", nameLabelStyle);
        
        const nameLabelBounds: PIXI.Rectangle = nameLabel.getBounds();
        const nameLabelWidth: number = nameLabelBounds.width;
        const nameLabelHeight: number = nameLabelBounds.height;

        nameLabel.position.x = (1000 / this.scalingFactor) * (hotspot.centroid[0] - hotspot.radius) + ((1000 / this.scalingFactor) * hotspot.radius) - nameLabelWidth / 2;
        nameLabel.position.y = (1000 / this.scalingFactor) * (hotspot.centroid[1] - hotspot.radius) + ((1000 / this.scalingFactor) * hotspot.radius) - nameLabelHeight / 2;
        nameLabel.cacheAsBitmap = true;

        this.addChild(nameLabel);

        const size: number = this.lod == 0 ? this.community.size : hotspot.size;

        const sizeLabelStyle: PIXI.TextStyle = new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (150 / this.scalingFactor) * hotspot.radius,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1200 / this.scalingFactor) * hotspot.radius
        });
        const sizeLabel: PIXI.Text = new PIXI.Text(size.toString() || "???", sizeLabelStyle);
        
        const sizeLabelBounds: PIXI.Rectangle = sizeLabel.getBounds();
        const sizeLabelWidth: number = sizeLabelBounds.width;
        const sizeLabelHeight: number = nameLabelBounds.height;

        sizeLabel.position.x = (1000 / this.scalingFactor) * (hotspot.centroid[0] - hotspot.radius) + ((1000 / this.scalingFactor) * hotspot.radius) - sizeLabelWidth / 2;
        sizeLabel.position.y = (1000 / this.scalingFactor) * (hotspot.centroid[1] - hotspot.radius) + ((1100 / this.scalingFactor) * hotspot.radius) - sizeLabelHeight / 2 + nameLabelHeight;
        sizeLabel.cacheAsBitmap = true;

        this.addChild(sizeLabel);
    }


    /* METHODS */

    public blur() : void
    {
        this.alpha = 0.18;
    }

    public sharpen() : void
    {
        this.alpha = 1;
    }


    /* CALLBACKS */

    private onHotspotClicked(hotspot: TwitterCommunityHotspot) : void
    {
        this.clickSubject.next();
    }


    /* GETTER & SETTER */

    public get data() : TwitterCommunity
    {
        return this.community;
    }

    public get clickedEvent() : Observable<void>
    {
        return this.clickSubject;
    }
}