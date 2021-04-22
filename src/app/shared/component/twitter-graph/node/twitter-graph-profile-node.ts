// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import TwitterProfile from "src/app/shared/model/twitter/twitter-profile";
import TwitterGraphResourceManager from "../resource-manager/twitter-graph-resource-manager";


export default class TwitterGraphProfileNode extends PIXI.Container
{
    /* STATIC */

    // Constants
    private static readonly NODE_SIZE: number = 300;
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
    ]

    // Variables
    private static BACKGROUND_TEXTURE_MAP: PIXI.RenderTexture[] = new Array(20);


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
        this.addProfileImage();

        // Add callbacks
        this.on("click", this.onClicked.bind(this));
    }


    /* INITIALIZATION */

    private addBackground() : void
    {
        if(!TwitterGraphProfileNode.BACKGROUND_TEXTURE_MAP[this.profile.community.id % 21])
        {
            // Create background graphics
            const circle: PIXI.Graphics = new PIXI.Graphics();
            circle.beginFill(TwitterGraphProfileNode.COLOR_MAP[this.profile.community.id % 21]);
            circle.drawCircle(0, 0, TwitterGraphProfileNode.NODE_SIZE / 2);
            circle.endFill();

            // Generate texture
            TwitterGraphProfileNode.BACKGROUND_TEXTURE_MAP[this.profile.community.id % 21] = this.renderer.generateTexture(circle, PIXI.SCALE_MODES.LINEAR, 1);
        }

        const background: PIXI.Sprite = PIXI.Sprite.from(TwitterGraphProfileNode.BACKGROUND_TEXTURE_MAP[this.profile.community.id % 21]);
        background.hitArea = new PIXI.Circle(150, 150, 150);

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
        const label: PIXI.Text = new PIXI.Text("@" + this.profile.username.toUpperCase(), labelStyle);

        const labelBounds: PIXI.Rectangle = new PIXI.Rectangle();
        label.getLocalBounds(labelBounds);

        const labelWidth: number = labelBounds.width;
        const labelHeight: number = labelBounds.height;
        
        label.position.set((TwitterGraphProfileNode.NODE_SIZE - labelWidth) / 2, 1.65 * (TwitterGraphProfileNode.NODE_SIZE / 2) - (labelHeight / 2));

        label.cacheAsBitmap = true;

        this.addChild(label);
    }

    private addProfileImage() : void
    {
        TwitterGraphResourceManager.await(`assets/profile-images/${this.profile.imageUrl.replace("https://", "").split("/").join("_")}`).subscribe((imageResource) =>
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
        });
    }


    /* CALLBACKS */

    private onClicked() : void
    {
        console.log(this.profile);
    }
}