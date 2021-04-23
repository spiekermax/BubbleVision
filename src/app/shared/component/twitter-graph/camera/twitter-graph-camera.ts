// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import Position from "src/app/shared/model/position/position";


export default class TwitterGraphCamera
{
    /* ATTRIBUTES */

    private targetPosition?: Position;
    private targetZoom?: number;

    private positionUpdater?: () => void = undefined;
    private zoomUpdater?: () => void = undefined;


    /* LIFECYCLE */

    public constructor(private app: PIXI.Application)
    {
        this.app.ticker.add(this.onUtilityUpdate.bind(this), undefined, PIXI.UPDATE_PRIORITY.UTILITY);
    }


    /* CALLBACKS */

    private onUtilityUpdate() : void
    {
        // Position animations
        if(this.targetPosition && Math.abs(this.app.stage.position.x - this.targetPosition.x) < 0.00001 && Math.abs(this.app.stage.position.y - this.targetPosition.y) < 0.00001)
        {
            // Cancel stale animations
            this.cancelPositionAnimations();
        }

        // Zoom animations
        if(this.targetZoom && Math.abs(this.app.stage.scale.x - this.targetZoom) < 0.00001)
        {
            // Cancel stale animations
            this.cancelZoomAnimations();
        }
    }


    /* METHODS */

    private interpolatePosition() : void
    {
        this.app.stage.position.x = this.lerp(this.app.stage.x, this.targetPosition!.x, 0.1);
        this.app.stage.position.y = this.lerp(this.app.stage.y, this.targetPosition!.y, 0.1);
    }

    private interpolateZoom() : void
    {
        this.app.stage.scale.x = this.lerp(this.app.stage.scale.x, this.targetZoom!, 0.1);
        this.app.stage.scale.y = this.lerp(this.app.stage.scale.y, this.targetZoom!, 0.1);
    }

    public animatePosition(newPosition: Position) : void
    {
        // Update app.stage position
        this.targetPosition = newPosition;

        // Bind position updater
        if(!this.positionUpdater)
        {
            this.positionUpdater = this.interpolatePosition.bind(this);
            this.app.ticker.add(this.positionUpdater);
        }
    }

    public animateZoom(newZoom: any) : void
    {
        // Update app.stage zoom
        this.targetZoom = newZoom;

        // Bind zoom updater
        if(!this.zoomUpdater)
        {
            this.zoomUpdater = this.interpolateZoom.bind(this);
            this.app.ticker.add(this.zoomUpdater);
        }
    }

    public cancelPositionAnimations() : void
    {
        if(!this.positionUpdater) return;

        // Unbind position updater
        this.app.ticker.remove(this.positionUpdater);
        this.positionUpdater = undefined;
        this.targetPosition = undefined;
    }

    public cancelZoomAnimations() : void
    {
        if(!this.zoomUpdater) return;

        // Unbind zoom updater
        this.app.ticker.remove(this.zoomUpdater);
        this.zoomUpdater = undefined;
        this.targetZoom = undefined;
    }

    public calculateVisibleBounds() : PIXI.Rectangle
    {
        const x: number = -this.app.stage.position.x / this.app.stage.scale.x;
        const y: number = -this.app.stage.position.y / this.app.stage.scale.y;
            
        const width: number = this.app.renderer.width / this.zoom;
        const height: number = this.app.renderer.height / this.zoom;
    
        return new PIXI.Rectangle(x, y, width, height);
    }


    /* UTILITY */

    private lerp = (a: number, b: number, c: number): number => a * (1 - c) + b * c;

    
    /* GETTER & SETTER */

    public get position() : Position
    {
        return { x: this.app.stage.position.x, y: this.app.stage.position.y };
    }

    public set position(newPosition: Position)
    {
        this.cancelPositionAnimations();

        this.app.stage.position.x = newPosition.x;
        this.app.stage.position.y = newPosition.y;
    }

    public get zoom() : number
    {
        return this.app.stage.scale.x;
    }

    public set zoom(newZoom: number)
    {
        this.cancelZoomAnimations();

        this.app.stage.scale.x = newZoom;
        this.app.stage.scale.y = newZoom;
    }
}