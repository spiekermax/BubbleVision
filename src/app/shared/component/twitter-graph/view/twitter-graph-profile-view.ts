// Reactive X
import { Observable, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { TwitterProfile } from "src/app/shared/model/twitter/profile/twitter-profile";
import { TwitterGraphResourceManager } from "../resource/twitter-graph-resource-manager";


export class TwitterGraphProfileView extends PIXI.Container
{
    /* STATIC */

    // Constants
    public static readonly DIAMETER: number = 300;
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
    private label?: PIXI.Text;
    private image?: PIXI.Sprite;

    // Events
    private clickSubject: Subject<void> = new Subject();


    /* LIFECYCLE */

    public constructor(private renderer: PIXI.Renderer, private profile: TwitterProfile)
    {
        super();

        // Initialize position
        this.position.x = profile.position.x;
        this.position.y = profile.position.y;

        // Configure interaction properties
        this.cursor = "pointer";
        this.interactive = true;
        this.interactiveChildren = false;
        this.hitArea = new PIXI.Circle(TwitterGraphProfileView.DIAMETER / 2, TwitterGraphProfileView.DIAMETER / 2, TwitterGraphProfileView.DIAMETER / 2);
        
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
        if(!TwitterGraphProfileView.BACKGROUND_TEXTURE_MAP[this.profile.communityId % 21])
        {
            // Create background graphics
            const circle: PIXI.Graphics = new PIXI.Graphics();
            circle.beginFill(TwitterGraphProfileView.COLOR_MAP[this.profile.communityId % 21]);
            circle.drawCircle(0, 0, TwitterGraphProfileView.DIAMETER / 2);
            circle.endFill();

            // Generate texture
            TwitterGraphProfileView.BACKGROUND_TEXTURE_MAP[this.profile.communityId % 21] = this.renderer.generateTexture(circle, PIXI.SCALE_MODES.LINEAR, 1);
        }

        const background: PIXI.Sprite = PIXI.Sprite.from(TwitterGraphProfileView.BACKGROUND_TEXTURE_MAP[this.profile.communityId % 21]);

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

        const labelBounds: PIXI.Rectangle = label.getLocalBounds(new PIXI.Rectangle());
        const labelWidth: number = labelBounds.width;
        const labelHeight: number = labelBounds.height;
        
        label.position.x = (1.00 * TwitterGraphProfileView.DIAMETER - labelWidth) / 2;
        label.position.y = (1.65 * TwitterGraphProfileView.DIAMETER - labelHeight) / 2;
        label.cacheAsBitmap = true;
        
        this.label = label;
        this.addChild(label);
    }

    private addPlaceholderImage() : void
    {
        TwitterGraphResourceManager.await("assets/avatar.jpg").subscribe(((imageResource) =>
        {
            const image: PIXI.Sprite = PIXI.Sprite.from(imageResource.texture);
            
            const imageSize: number = TwitterGraphProfileView.DIAMETER - TwitterGraphProfileView.IMAGE_PADDING;
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

            const placeholderImage = PIXI.Sprite.from(maskedImageTexture);
            placeholderImage.position.x = TwitterGraphProfileView.IMAGE_PADDING / 2;
            placeholderImage.position.y = TwitterGraphProfileView.IMAGE_PADDING / 2 - 30;

            this.image = placeholderImage;
            this.addChild(placeholderImage);
        }));
    }

    private addImage() : void
    {
        TwitterGraphResourceManager.await(this.profile.imageUrl).subscribe((imageResource) =>
        {
            const image: PIXI.Sprite = new PIXI.Sprite(imageResource.texture);
            
            const imageSize: number = TwitterGraphProfileView.DIAMETER - TwitterGraphProfileView.IMAGE_PADDING;
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
            maskedImage.position.x = TwitterGraphProfileView.IMAGE_PADDING / 2;
            maskedImage.position.y = TwitterGraphProfileView.IMAGE_PADDING / 2;

            this.addChild(maskedImage);

            if(this.image) this.removeChild(this.image);
            this.image = maskedImage;
        });
    }


    /* METHODS */

    public blur() : void
    {
        this.alpha = 0.2;
    }

    public sharpen() : void
    {
        this.alpha = 1;
    }

    public hideDetails() : void
    {
        if(this.image)
            this.image.visible = false;

        if(this.label)
            this.label.visible = false;
    }

    public showDetails() : void
    {
        if(this.image)
            this.image.visible = true;

        if(this.label)
            this.label.visible = true;
    }


    /* CALLBACKS */

    private onClicked() : void
    {
        this.clickSubject.next();
    }


    /* GETTER & SETTER */

    public get data() : TwitterProfile
    {
        return this.profile;
    }

    public get clickedEvent() : Observable<void>
    {
        return this.clickSubject;
    }
}