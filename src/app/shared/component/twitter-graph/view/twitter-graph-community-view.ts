// Reactive X
import { Observable, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { Colors } from "src/app/core/colors";

import { TwitterCommunity } from "src/app/shared/model/twitter/community/twitter-community";

import { TwitterGraphCamera } from "../camera/twitter-graph-camera";


export class TwitterGraphCommunityView extends PIXI.Container
{
    /* ATTRIBUTES */

    // Render properties
    private lodScalingFactor: number = TwitterGraphCamera.getLodScalingFactor(this.lod);

    // State
    private currentSizeLabel?: PIXI.Text;
    private currentSizeLabelBounds?: PIXI.Rectangle;

    private totalSizeLabel?: PIXI.Text;
    private totalSizeLabelBounds?: PIXI.Rectangle;

    // Events
    private clickSubject: Subject<void> = new Subject();


    /* LIFECYCLE */

    public constructor(private community: TwitterCommunity, private renderer: PIXI.Renderer, private lod?: number, private resolution: number = 1)
    {
        super();

        //
        if(this.community.radius < 0.1)
            throw new Error("Community radius too small!");

        //
        this.zIndex = this.community.size;

        //
        this.addBackground();
        this.addLabels();
    }


    /* INITIALIZATION */

    private addBackground() : void
    {
        //
        const circleSprite: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
        circleSprite.tint = Colors.getTwitterCommunityColor(this.community.numericId).asNumber;
        circleSprite.width = (1000 / this.lodScalingFactor) * 4 * this.community.radius;
        circleSprite.height = (1000 / this.lodScalingFactor) * 4 * this.community.radius;

        //
        const circleMask: PIXI.Sprite = PIXI.Sprite.from("assets/radial-gradient.png");
        circleMask.width = (1000 / this.lodScalingFactor) * 4 * this.community.radius;
        circleMask.height = (1000 / this.lodScalingFactor) * 4 * this.community.radius;

        //
        const maskedContainer: PIXI.Container = new PIXI.Container();
        maskedContainer.addChild(circleMask);
        maskedContainer.addChild(circleSprite);
        circleSprite.mask = circleMask;

        //
        maskedContainer.position.x = (1000 / this.lodScalingFactor) * (this.community.centroid[0] - 2 * this.community.radius);
        maskedContainer.position.y = (1000 / this.lodScalingFactor) * (this.community.centroid[1] - 2 * this.community.radius);
        
        maskedContainer.interactive = true;
        maskedContainer.cursor = "pointer";
        maskedContainer.hitArea = new PIXI.Circle((1000 / this.lodScalingFactor) * 2 * this.community.radius, (1000 / this.lodScalingFactor) * 2 * this.community.radius, (1000 / this.lodScalingFactor) * 1.2 * this.community.radius);

        maskedContainer.on("click", () => this.onClicked());

        //
        this.addChild(maskedContainer);
    }

    private addLabels() : void
    {
        const nameLabel: PIXI.Text = new PIXI.Text("#" + this.community.name?.toLowerCase() || "error", new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (200 / this.lodScalingFactor) * this.community.radius + 4.5 * Math.log(100 / this.community.radius),
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1500 / this.lodScalingFactor) * this.community.radius
        }));
        
        const nameLabelBounds: PIXI.Rectangle = nameLabel.getLocalBounds(new PIXI.Rectangle());
        const nameLabelWidth: number = nameLabelBounds.width;
        const nameLabelHeight: number = nameLabelBounds.height;

        nameLabel.position.x = (1000 / this.lodScalingFactor) * (this.community.centroid[0] - this.community.radius) + ((1000 / this.lodScalingFactor) * this.community.radius) - nameLabelWidth / 2;
        nameLabel.position.y = (1000 / this.lodScalingFactor) * (this.community.centroid[1] - this.community.radius) + ((1000 / this.lodScalingFactor) * this.community.radius) - nameLabelHeight / 2;
        nameLabel.resolution = this.resolution;
        nameLabel.cacheAsBitmap = true;

        this.addChild(nameLabel);

        this.currentSizeLabel = new PIXI.Text(this.community.size.toString() || "???", new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (130 / this.lodScalingFactor) * this.community.radius + 4.5 * Math.log(100 / this.community.radius),
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1200 / this.lodScalingFactor) * this.community.radius
        }));
        
        this.currentSizeLabelBounds = this.currentSizeLabel.getLocalBounds(new PIXI.Rectangle());
        const currentSizeLabelWidth: number = this.currentSizeLabelBounds.width;
        const currentSizeLabelHeight: number = this.currentSizeLabelBounds.height;

        this.currentSizeLabel.position.x = (1000 / this.lodScalingFactor) * (this.community.centroid[0] - this.community.radius) + ((1000 / this.lodScalingFactor) * this.community.radius) - currentSizeLabelWidth / 2;
        this.currentSizeLabel.position.y = (1000 / this.lodScalingFactor) * (this.community.centroid[1] - this.community.radius) + ((1200 / this.lodScalingFactor) * this.community.radius) - currentSizeLabelHeight / 2 + nameLabelHeight / 2;
        this.currentSizeLabel.resolution = this.resolution;
        this.currentSizeLabel.cacheAsBitmap = true;

        this.addChild(this.currentSizeLabel);

        this.totalSizeLabel = new PIXI.Text(`/${this.community.size}` || "???", new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: (75 / this.lodScalingFactor) * this.community.radius + 4.5 * Math.log(100 / this.community.radius),
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: (1200 / this.lodScalingFactor) * this.community.radius
        }));

        this.totalSizeLabelBounds = this.totalSizeLabel.getLocalBounds(new PIXI.Rectangle());

        this.totalSizeLabel.resolution = this.resolution;
        this.totalSizeLabel.cacheAsBitmap = true;
        this.totalSizeLabel.visible = false;

        this.addChild(this.totalSizeLabel);
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
        this.addLabels();
    }
    
    public updateCurrentSize(size: number) : void
    {
        if(!this.currentSizeLabel || !this.totalSizeLabel) return;

        // Update text
        this.currentSizeLabel.cacheAsBitmap = false;
        this.currentSizeLabel.text = size.toString();
        this.currentSizeLabel.cacheAsBitmap = true;

        //
        if(size != this.community.size && !this.totalSizeLabel.visible)
        {
            this.currentSizeLabel.position.x -= this.totalSizeLabelBounds!.width / 2;
        }
        
        //
        if(size == this.community.size && this.totalSizeLabel.visible)
        {
            this.currentSizeLabel.position.x += this.totalSizeLabelBounds!.width / 2;
        }

        // 
        this.totalSizeLabel.visible = size != this.community.size;

        //
        const oldSizeLabelBounds: PIXI.Rectangle = this.currentSizeLabelBounds!;
        this.currentSizeLabelBounds = this.currentSizeLabel.getLocalBounds(new PIXI.Rectangle());

        //
        this.currentSizeLabel.position.x -= (this.currentSizeLabelBounds.width - oldSizeLabelBounds.width) / 2;

        //
        this.totalSizeLabel.position.x = this.currentSizeLabel.position.x + this.currentSizeLabelBounds.width * 1.1;
        this.totalSizeLabel.position.y = this.currentSizeLabel.position.y + this.currentSizeLabelBounds.height * 0.085;
    }


    /* CALLBACKS */

    private onClicked() : void
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