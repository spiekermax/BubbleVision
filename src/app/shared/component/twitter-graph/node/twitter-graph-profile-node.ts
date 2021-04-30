// Reactive X
import { Observable, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { TwitterProfile } from "src/app/shared/model/twitter/twitter-profile";
import { TwitterGraphResourceManager } from "../resource-manager/twitter-graph-resource-manager";


export class TwitterGraphProfileNode extends PIXI.Container
{
    /* STATIC */

    // Constants
    public static readonly NODE_SIZE: number = 300;
    private static readonly IMAGE_PADDING: number = 24;

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

    // Variables
    private static BACKGROUND_TEXTURE_MAP: PIXI.Texture[] = new Array(20);


    /* ATTRIBUTES */

    // State
    private placeholderImage?: PIXI.Sprite;
    private profileImage?: PIXI.Sprite;

    private label?: PIXI.Text;

    // Events
    private clickSubject: Subject<void> = new Subject();


    /* LIFECYCLE */

    public constructor(private renderer: PIXI.Renderer, private profile: TwitterProfile)
    {
        super();

        // Configure properties
        this.position.x = profile.position.x;
        this.position.y = profile.position.y;

        this.cursor = "pointer";
        this.interactive = true;
        
        // Add graphics
        this.addBackground();
        this.addLabel();
        this.addPlaceholderImage();
        this.addImage();

        // Add callbacks
        this.on("click", this.onClicked.bind(this));
    }


    /* INITIALIZATION */

    private addBackground() : void
    {
        if(!TwitterGraphProfileNode.BACKGROUND_TEXTURE_MAP[this.profile.communityId % 21])
        {
            // Create background graphics
            const circle: PIXI.Graphics = new PIXI.Graphics();
            circle.beginFill(TwitterGraphProfileNode.COLOR_MAP[this.profile.communityId % 21]);
            circle.drawCircle(0, 0, TwitterGraphProfileNode.NODE_SIZE / 2);
            circle.endFill();

            // Generate texture
            TwitterGraphProfileNode.BACKGROUND_TEXTURE_MAP[this.profile.communityId % 21] = this.renderer.generateTexture(circle, PIXI.SCALE_MODES.LINEAR, 1);
        }

        const background: PIXI.Sprite = PIXI.Sprite.from(TwitterGraphProfileNode.BACKGROUND_TEXTURE_MAP[this.profile.communityId % 21]);
        background.hitArea = new PIXI.Circle(TwitterGraphProfileNode.NODE_SIZE / 2, TwitterGraphProfileNode.NODE_SIZE / 2, TwitterGraphProfileNode.NODE_SIZE / 2);

        this.addChild(background);
    }

    private addLabel() : void
    {
        const labelStyle: PIXI.TextStyle = new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: 24,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
            wordWrap: true,
            wordWrapWidth: 200,
            breakWords: true
        });
        const label: PIXI.Text = new PIXI.Text(this.profile.username.toUpperCase(), labelStyle);

        const labelBounds: PIXI.Rectangle = new PIXI.Rectangle();
        label.getLocalBounds(labelBounds);

        const labelWidth: number = labelBounds.width;
        const labelHeight: number = labelBounds.height;
        
        label.position.set((TwitterGraphProfileNode.NODE_SIZE - labelWidth) / 2, 1.65 * (TwitterGraphProfileNode.NODE_SIZE / 2) - (labelHeight / 2));

        label.cacheAsBitmap = true;

        this.label = label;

        this.addChild(label);
    }

    private addPlaceholderImage() : void
    {
        TwitterGraphResourceManager.await("assets/avatar.jpg").subscribe(((imageResource) =>
        {
            const image: PIXI.Sprite = PIXI.Sprite.from(imageResource.texture);
            
            const imageSize: number = TwitterGraphProfileNode.NODE_SIZE - TwitterGraphProfileNode.IMAGE_PADDING;
            image.width = imageSize;
            image.height = imageSize;
            
            const imageMask: PIXI.Graphics = new PIXI.Graphics();
            imageMask.beginFill(0xFFFFFF);
            imageMask.arc(imageSize / 2, imageSize / 2 + 30, imageSize / 2, 0.86 * Math.PI, 0.14 * Math.PI);
            imageMask.endFill();

            const maskedContainer: PIXI.Container = new PIXI.Container();
            maskedContainer.addChild(image);
            maskedContainer.addChild(imageMask);
            maskedContainer.mask = imageMask;

            const maskedImageTexture: PIXI.Texture = this.renderer.generateTexture(maskedContainer, PIXI.SCALE_MODES.LINEAR, 1);

            this.placeholderImage = PIXI.Sprite.from(maskedImageTexture);
            this.placeholderImage.position.x = TwitterGraphProfileNode.IMAGE_PADDING / 2;
            this.placeholderImage.position.y = TwitterGraphProfileNode.IMAGE_PADDING / 2 - 30;

            this.profileImage = this.placeholderImage;

            this.addChild(this.placeholderImage);
        }));
    }

    private addImage() : void
    {
        TwitterGraphResourceManager.await(this.profile.imageUrl).subscribe((imageResource) =>
        {
            const image: PIXI.Sprite = new PIXI.Sprite(imageResource.texture);
            
            const imageSize: number = TwitterGraphProfileNode.NODE_SIZE - TwitterGraphProfileNode.IMAGE_PADDING;
            image.width = imageSize;
            image.height = imageSize;
            
            const imageMask: PIXI.Graphics = new PIXI.Graphics();
            imageMask.beginFill(0xFFFFFF);
            imageMask.arc(imageSize / 2, imageSize / 2, imageSize / 2, 0.86 * Math.PI, 0.14 * Math.PI);
            imageMask.endFill();

            const maskedContainer: PIXI.Container = new PIXI.Container();
            maskedContainer.addChild(image);
            maskedContainer.addChild(imageMask);
            maskedContainer.mask = imageMask;

            const maskedImageTexture: PIXI.Texture = this.renderer.generateTexture(maskedContainer, PIXI.SCALE_MODES.LINEAR, 1);

            const maskedImage: PIXI.Sprite = PIXI.Sprite.from(maskedImageTexture);
            maskedImage.position.x = TwitterGraphProfileNode.IMAGE_PADDING / 2;
            maskedImage.position.y = TwitterGraphProfileNode.IMAGE_PADDING / 2;

            this.addChild(maskedImage);

            this.profileImage = maskedImage;
            
            if(this.placeholderImage) 
                this.removeChild(this.placeholderImage);
        });
    }



    public hideStuff()
    {
        if(this.profileImage) this.profileImage.visible = false;

        if(this.label) this.label.visible = false;
    }

    public hidePlaceholder()
    {
        if(this.placeholderImage) this.placeholderImage.visible = false;
    }

    public showPlaceholder()
    {
        if(this.placeholderImage) this.placeholderImage.visible = true;
    }

    public showStuff()
    {
        if(this.profileImage) this.profileImage.visible = true;

        if(this.label) this.label.visible = true;
    }


    /* CALLBACKS */

    private onClicked() : void
    {
        this.clickSubject.next();
    }


    /* GETTER & SETTER */

    public get clickedEvent() : Observable<void>
    {
        return this.clickSubject;
    }
}