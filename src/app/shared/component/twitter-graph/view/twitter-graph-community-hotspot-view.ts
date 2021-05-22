// Reactive X
import { Observable, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";
import { TwitterCommunityHotspot } from "src/app/shared/model/twitter/community/twitter-community-hotspot";

import { TwitterGraphCamera } from "../camera/twitter-graph-camera";


export class TwitterGraphCommunityHotspotView extends PIXI.Container
{
    /* STATIC */

    // Constants
    private static readonly BACKGROUND_COLORS: number[] =
    [
        0xe6194B,
        0x3cb44b,
        0xf57920,
        0x4363d8,
        0xffe119,
        0x911eb4,
        0x42d4f4,
        0xf032e6,
        0xa6d13b,
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
        0xa9a9a9,
    ];


    /* ATTRIBUTES */

    // Render properties
    private lodScalingFactor: number = TwitterGraphCamera.getLodScalingFactor(this.lod);

    // State
    private sizeLabel?: PIXI.Text;
    private sizeLabelBounds?: PIXI.Rectangle;

    // Events
    private clickSubject: Subject<void> = new Subject();


    /* LIFECYCLE */

    public constructor(private community: TwitterCommunity, private hotspot: TwitterCommunityHotspot, private renderer: PIXI.Renderer, private lod?: number, private resolution: number = 1)
    {
        super();

        //
        if(this.hotspot.radius < 0.1) return;

        //
        this.zIndex = this.hotspot.size;

        //
        this.addBackground();
        this.addLabel();
    }


    /* INITIALIZATION */

    private addBackground() : void
    {
        //
        const circleSprite: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
        circleSprite.tint = TwitterGraphCommunityHotspotView.BACKGROUND_COLORS[this.community.numericId % 21];
        circleSprite.width = (1000 / this.lodScalingFactor) * 4 * this.hotspot.radius;
        circleSprite.height = (1000 / this.lodScalingFactor) * 4 * this.hotspot.radius;

        //
        const circleMask: PIXI.Sprite = PIXI.Sprite.from("assets/radial-gradient.png");
        circleMask.width = (1000 / this.lodScalingFactor) * 4 * this.hotspot.radius;
        circleMask.height = (1000 / this.lodScalingFactor) * 4 * this.hotspot.radius;

        //
        const maskedContainer: PIXI.Container = new PIXI.Container();
        maskedContainer.addChild(circleMask);
        maskedContainer.addChild(circleSprite);
        circleSprite.mask = circleMask;

        //
        maskedContainer.position.x = (1000 / this.lodScalingFactor) * (this.hotspot.centroid[0] - 2 * this.hotspot.radius);
        maskedContainer.position.y = (1000 / this.lodScalingFactor) * (this.hotspot.centroid[1] - 2 * this.hotspot.radius);
        
        maskedContainer.interactive = true;
        maskedContainer.cursor = "pointer";
        maskedContainer.hitArea = new PIXI.Circle((1000 / this.lodScalingFactor) * 2 * this.hotspot.radius, (1000 / this.lodScalingFactor) * 2 * this.hotspot.radius, (1000 / this.lodScalingFactor) * 1.2 * this.hotspot.radius);

        maskedContainer.on("click", () => this.onClicked());

        //
        this.addChild(maskedContainer);
    }

    private addLabel() : void
    {
        const nameLabel: PIXI.Text = new PIXI.Text("#" + this.hotspot.name?.toLowerCase() || "error", new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (200 / this.lodScalingFactor) * this.hotspot.radius,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1500 / this.lodScalingFactor) * this.hotspot.radius
        }));
        
        const nameLabelBounds: PIXI.Rectangle = nameLabel.getLocalBounds(new PIXI.Rectangle());
        const nameLabelWidth: number = nameLabelBounds.width;
        const nameLabelHeight: number = nameLabelBounds.height;

        nameLabel.position.x = (1000 / this.lodScalingFactor) * (this.hotspot.centroid[0] - this.hotspot.radius) + ((1000 / this.lodScalingFactor) * this.hotspot.radius) - nameLabelWidth / 2;
        nameLabel.position.y = (1000 / this.lodScalingFactor) * (this.hotspot.centroid[1] - this.hotspot.radius) + ((1000 / this.lodScalingFactor) * this.hotspot.radius) - nameLabelHeight / 2;
        nameLabel.resolution = this.resolution;
        nameLabel.cacheAsBitmap = true;

        this.addChild(nameLabel);

        this.sizeLabel = new PIXI.Text(this.hotspot.size.toString() || "???", new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (150 / this.lodScalingFactor) * this.hotspot.radius,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1200 / this.lodScalingFactor) * this.hotspot.radius
        }));
        
        this.sizeLabelBounds = this.sizeLabel.getLocalBounds(new PIXI.Rectangle());
        const sizeLabelWidth: number = this.sizeLabelBounds.width;
        const sizeLabelHeight: number = this.sizeLabelBounds.height;

        this.sizeLabel.position.x = (1000 / this.lodScalingFactor) * (this.hotspot.centroid[0] - this.hotspot.radius) + ((1000 / this.lodScalingFactor) * this.hotspot.radius) - sizeLabelWidth / 2;
        this.sizeLabel.position.y = (1000 / this.lodScalingFactor) * (this.hotspot.centroid[1] - this.hotspot.radius) + ((1100 / this.lodScalingFactor) * this.hotspot.radius) - sizeLabelHeight / 2 + nameLabelHeight;
        this.sizeLabel.resolution = this.resolution;
        this.sizeLabel.cacheAsBitmap = true;

        this.addChild(this.sizeLabel);
    }


    /* METHODS */

    public blur() : void
    {
        this.visible = false;
    }

    public sharpen() : void
    {
        this.visible = true;
    }

    public updateResolution(newResolution: number) : void
    {
        if(newResolution == this.resolution) return;

        // Update resolution
        this.resolution = newResolution;

        // Update graphics
        this.removeChildren();
        this.addBackground();
        this.addLabel();
    }
    
    public updateSizeLabel(size: number) : void
    {
        if(!this.sizeLabel) return;

        // Update text
        this.sizeLabel.cacheAsBitmap = false;
        this.sizeLabel.text = size.toString();
        this.sizeLabel.cacheAsBitmap = true;

        //
        const oldSizeLabelBounds = this.sizeLabelBounds!;
        this.sizeLabelBounds = this.sizeLabel.getLocalBounds(new PIXI.Rectangle());

        //
        this.sizeLabel.position.x -= (this.sizeLabelBounds.width - oldSizeLabelBounds.width) / 2;
    }


    /* CALLBACKS */

    private onClicked() : void
    {
        this.clickSubject.next();
    }


    /* GETTER & SETTER */

    public get data() : TwitterCommunityHotspot
    {
        return this.hotspot;
    }

    public get clickedEvent() : Observable<void>
    {
        return this.clickSubject;
    }
}