// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import TwitterProfile from "src/app/shared/model/twitter/twitter-profile";


export default class TwitterGraphProfileNode extends PIXI.Container
{
    /* STATIC */

    // Constants
    private static readonly NODE_SIZE: number = 150;

    // Variables
    private static BACKGROUND_TEXTURE?: PIXI.RenderTexture;


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

        // Add callbacks
        this.on("click", this.onClicked.bind(this));
    }


    /* INITIALIZATION */

    private addBackground() : void
    {
        if(!TwitterGraphProfileNode.BACKGROUND_TEXTURE)
        {
            // Create background graphics
            const circle: PIXI.Graphics = new PIXI.Graphics();
            circle.beginFill(0xEB5757);
            circle.drawCircle(0, 0, TwitterGraphProfileNode.NODE_SIZE);
            circle.endFill();

            // Generate texture
            TwitterGraphProfileNode.BACKGROUND_TEXTURE = this.renderer.generateTexture(circle, PIXI.SCALE_MODES.LINEAR, 1);
        }

        const background: PIXI.Sprite = PIXI.Sprite.from(TwitterGraphProfileNode.BACKGROUND_TEXTURE);
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
        
        label.position.set(TwitterGraphProfileNode.NODE_SIZE - labelWidth / 2, 1.6 * TwitterGraphProfileNode.NODE_SIZE - labelHeight / 2);

        label.cacheAsBitmap = true;

        this.addChild(label);
    }


    /* CALLBACKS */

    private onClicked() : void
    {
        console.log(this.profile);
    }
}