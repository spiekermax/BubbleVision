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
    private static readonly BACKGROUND_COLORS: number[] =
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

    //
    private sizeLabel?: PIXI.Text;
    private sizeLabelBounds?: PIXI.Rectangle;

    // Events
    private clickSubject: Subject<void> = new Subject();


    /* LIFECYCLE */

    public constructor(private renderer: PIXI.Renderer, private community: TwitterCommunity, private lod: number, private resolution: number = 1)
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
        circle.beginFill(TwitterGraphCommunityView.BACKGROUND_COLORS[this.community.id % 21]);
        circle.drawCircle(0, 0, (1000 / this.scalingFactor) * 2 * hotspot.radius);
        circle.endFill();

        //
        const circleTexture: PIXI.Texture = this.renderer.generateTexture(circle, PIXI.SCALE_MODES.LINEAR, this.resolution);
        const circleSprite: PIXI.Sprite = PIXI.Sprite.from(circleTexture);

        const circleMask: PIXI.Sprite = PIXI.Sprite.from("assets/radial-gradient.png");
        circleMask.width = circle.width;
        circleMask.height = circle.height;

        const maskedContainer: PIXI.Container = new PIXI.Container();
        maskedContainer.addChild(circleSprite);
        maskedContainer.addChild(circleMask);
        circleSprite.mask = circleMask;

        //
        maskedContainer.position.x = (1000 / this.scalingFactor) * (hotspot.centroid[0] - 2 * hotspot.radius);
        maskedContainer.position.y = (1000 / this.scalingFactor) * (hotspot.centroid[1] - 2 * hotspot.radius);
        
        maskedContainer.interactive = true;
        maskedContainer.cursor = "pointer";
        maskedContainer.hitArea = new PIXI.Circle((1000 / this.scalingFactor) * 2 * hotspot.radius, (1000 / this.scalingFactor) * 2 * hotspot.radius, (1000 / this.scalingFactor) * 1.2 * hotspot.radius);

        maskedContainer.on("click", () => this.onHotspotClicked(hotspot));

        //
        this.addChild(maskedContainer);
    }

    private addHotspotLabels(hotspot: TwitterCommunityHotspot) : void
    {
        const nameLabel: PIXI.Text = new PIXI.Text("#" + hotspot.name?.toLowerCase() || "error", new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (200 / this.scalingFactor) * hotspot.radius,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1500 / this.scalingFactor) * hotspot.radius
        }));
        
        const nameLabelBounds: PIXI.Rectangle = nameLabel.getBounds();
        const nameLabelWidth: number = nameLabelBounds.width;
        const nameLabelHeight: number = nameLabelBounds.height;

        nameLabel.position.x = (1000 / this.scalingFactor) * (hotspot.centroid[0] - hotspot.radius) + ((1000 / this.scalingFactor) * hotspot.radius) - nameLabelWidth / 2;
        nameLabel.position.y = (1000 / this.scalingFactor) * (hotspot.centroid[1] - hotspot.radius) + ((1000 / this.scalingFactor) * hotspot.radius) - nameLabelHeight / 2;
        nameLabel.cacheAsBitmap = true;

        this.addChild(nameLabel);
        

        if(this.lod == 1 && this.community.hotspots["1"].length > 1) return;

        this.sizeLabel = new PIXI.Text(this.community.size.toString() || "???", new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (150 / this.scalingFactor) * hotspot.radius,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1200 / this.scalingFactor) * hotspot.radius
        }));
        
        this.sizeLabelBounds = this.sizeLabel.getLocalBounds(new PIXI.Rectangle());
        const sizeLabelWidth: number = this.sizeLabelBounds.width;
        const sizeLabelHeight: number = this.sizeLabelBounds.height;

        this.sizeLabel.position.x = (1000 / this.scalingFactor) * (hotspot.centroid[0] - hotspot.radius) + ((1000 / this.scalingFactor) * hotspot.radius) - sizeLabelWidth / 2;
        this.sizeLabel.position.y = (1000 / this.scalingFactor) * (hotspot.centroid[1] - hotspot.radius) + ((1100 / this.scalingFactor) * hotspot.radius) - sizeLabelHeight / 2 + nameLabelHeight;

        this.addChild(this.sizeLabel);
    }


    /* METHODS */

    public blur() : void
    {
        this.alpha = 0;
    }

    public sharpen() : void
    {
        this.alpha = 1;
    }

    public updateResolution(newResolution: number) : void
    {
        if(newResolution == this.resolution) return;

        // Update resolution
        this.resolution = newResolution;

        // Update graphics
        this.removeChildren();

        for(const lod of Object.keys(this.community.hotspots))
        {
            if(lod != this.lod.toString()) continue;

            // Iterate over hotspots
            for(const hotspot of this.community.hotspots[lod])
            {
                if(hotspot.radius < 0.1) continue;

                this.addHotspotBackground(hotspot);
                this.addHotspotLabels(hotspot);
            }
        }
    }
    
    public updateSizeLabel(size: number) : void
    {
        if(!this.sizeLabel) return;

        // Update text
        this.sizeLabel.text = size.toString();

        //
        const oldSizeLabelBounds = this.sizeLabelBounds!;
        this.sizeLabelBounds = this.sizeLabel.getLocalBounds(new PIXI.Rectangle());

        //
        this.sizeLabel.position.x -= (this.sizeLabelBounds.width - oldSizeLabelBounds.width) / 2;
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