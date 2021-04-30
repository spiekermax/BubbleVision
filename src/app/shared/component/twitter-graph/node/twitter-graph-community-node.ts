// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { TwitterCommunity } from "src/app/shared/model/twitter/twitter-community";


export class TwitterGraphCommunityNode extends PIXI.Container
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

    // Variables
    private static BACKGROUND_TEXTURE_MAP: PIXI.Texture[] = new Array(20);


    /* LIFECYCLE */

    public constructor(private renderer: PIXI.Renderer, private community: TwitterCommunity, private scaling: number)
    {
        super();

        // if(community.id == 0) return;

        // Configure properties
        // this.position.x = community.centroid.x * 1000;
        // this.position.y = community.centroid.y * 1000;

        this.community.size = 0;
        for(const cluster of community.clusters)
        {
            this.community.size += cluster.size;
        }

        // Add graphics
        for(const cluster of community.clusters)
        {
            if(cluster.size < this.community.size / 15) continue;
            if(this.scaling == 10 && cluster.size < 25) continue;

            this.addBackground(cluster);
            this.addLabel(cluster)
        }
    }


    /* INITIALIZATION */

    private addBackground(cluster: any) : void
    {
        const circle: PIXI.Graphics = new PIXI.Graphics();
        circle.beginFill(TwitterGraphCommunityNode.COLOR_MAP[this.community.id % 21]);
        circle.drawCircle(0, 0, 50 * cluster.size / this.scaling);
        circle.endFill();

        // circle.position.x = cluster.centroid[0] * (1000 / this.scaling);
        // circle.position.y = cluster.centroid[1] * (1000 / this.scaling);
        circle.zIndex = cluster.size * 10;
        circle.alpha = 0.77;
        // circle.cacheAsBitmap = true;

        const tex = this.renderer.generateTexture(circle, PIXI.SCALE_MODES.LINEAR, 1);
        const spr = PIXI.Sprite.from(tex);

        spr.position.x = cluster.centroid[0] * (1000 / this.scaling) - 50 * cluster.size / this.scaling;
        spr.position.y = cluster.centroid[1] * (1000 / this.scaling) - 50 * cluster.size / this.scaling;

        this.addChild(spr);
    }

    private addLabel(cluster: any) : void
    {
        const labelStyle: PIXI.TextStyle = new PIXI.TextStyle
        ({ 
            fill: "white",
            fontSize: 10 * cluster.size / this.scaling,
            fontFamily: "Roboto", 
            align: "center",
            letterSpacing: 1.5,
        });
        const label: PIXI.Text = new PIXI.Text(this.community.name?.toUpperCase() || "Missing", labelStyle);
        label.zIndex = cluster.size * 10;

        const labelBounds: PIXI.Rectangle = new PIXI.Rectangle();
        label.getLocalBounds(labelBounds);

        const labelWidth: number = labelBounds.width;
        const labelHeight: number = labelBounds.height;
        
        label.position.set(cluster.centroid[0] * (1000 / this.scaling) - labelWidth / 2, cluster.centroid[1] * (1000 / this.scaling) - labelHeight / 2);
        label.cacheAsBitmap = true;

        this.addChild(label);
    }
}