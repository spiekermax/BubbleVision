// PIXI
import * as PIXI from "pixi.js";


export default class TwitterGraphNode extends PIXI.Container
{
    /* CONSTANTS */

    private static readonly NODE_SIZE: number = 100;


    /* LIFECYCLE */

    public constructor(label?: string)
    {
        super();

        // Configure interaction
        this.cursor = "pointer";
        this.interactive = true;
        
        // Add circle
        this.addCircle();
        
        // Add label
        if(label) this.addLabel(label);
    }


    /* INITIALIZATION */

    private addCircle() : void
    {
        const circle: PIXI.Graphics = new PIXI.Graphics();
        circle.beginFill(0xFF0000);
        circle.drawCircle(0, 0, TwitterGraphNode.NODE_SIZE);
        circle.endFill();
        this.addChild(circle);
    }

    private addLabel(label: string) : void
    {
        const text: PIXI.Text = new PIXI.Text(label, new PIXI.TextStyle({ fill: "white" }));

        const textBounds: PIXI.Rectangle = new PIXI.Rectangle();
        text.getLocalBounds(textBounds);

        const textWidth: number = textBounds.width;
        const textHeight: number = textBounds.height;
        
        text.position.set(-textWidth / 2, -textHeight / 2);

        this.addChild(text);
    }
}