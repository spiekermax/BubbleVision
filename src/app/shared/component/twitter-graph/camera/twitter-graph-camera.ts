// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { Position } from "src/app/shared/model/position/position";


export class TwitterGraphCamera
{
    /* CONSTANTS */

    private static readonly ANIMATION_TOLERANCE: number = 0.00001;


    /* ATTRIBUTES */

    private _baseLayer: PIXI.Container = new PIXI.Container();
    private _baseLayerVisible: boolean = true;

    private _x5Layer: PIXI.Container = new PIXI.Container();
    private _x5LayerVisible: boolean = false;

    private _x10Layer: PIXI.Container = new PIXI.Container();
    private _x10LayerVisible: boolean = false;

    private targetPosition?: Position;
    private targetZoom?: number;

    private positionUpdater?: () => void = undefined;
    private zoomUpdater?: () => void = undefined;


    /* LIFECYCLE */

    public constructor(private app: PIXI.Application)
    {
        // Add layers
        this.app.stage.addChild(this.baseLayer);
        this.app.stage.addChild(this.x5Layer);
        this.app.stage.addChild(this.x10Layer);

        //
        this.app.ticker.add(this.onUtilityUpdate.bind(this), undefined, PIXI.UPDATE_PRIORITY.UTILITY);
    }


    /* CALLBACKS */

    private onUtilityUpdate() : void
    {
        // Position animations
        if(this.targetPosition && Math.abs(this.baseLayer.position.x - this.targetPosition.x) < TwitterGraphCamera.ANIMATION_TOLERANCE && Math.abs(this.baseLayer.position.y - this.targetPosition.y) < TwitterGraphCamera.ANIMATION_TOLERANCE)
        {
            // Cancel stale animations
            this.cancelPositionAnimations();
        }

        // Zoom animations
        if(this.targetZoom && Math.abs(this.baseLayer.scale.x - this.targetZoom) < TwitterGraphCamera.ANIMATION_TOLERANCE)
        {
            // Cancel stale animations
            this.cancelZoomAnimations();
        }

        if(this.baseLayer.scale.x < 0.02)
        {
            this._x10LayerVisible = true;
        }
        else
        {
            this._x10LayerVisible = false;
        }

        if(this.baseLayer.scale.x >= 0.02 && this.baseLayer.scale.x <= 0.1)
        {
            this._x5LayerVisible = true;
        }
        else
        {
            this._x5LayerVisible = false;
        }

        this.interpolateVisibility()
    }


    /* METHODS */

    private interpolatePosition() : void
    {
        this.baseLayer.position.x = this.lerp(this.baseLayer.x, this.targetPosition!.x, 0.1);
        this.baseLayer.position.y = this.lerp(this.baseLayer.y, this.targetPosition!.y, 0.1);

        this.x5Layer.position.x = this.lerp(this.x5Layer.x, this.targetPosition!.x, 0.1);
        this.x5Layer.position.y = this.lerp(this.x5Layer.y, this.targetPosition!.y, 0.1);

        this.x10Layer.position.x = this.lerp(this.x10Layer.x, this.targetPosition!.x, 0.1);
        this.x10Layer.position.y = this.lerp(this.x10Layer.y, this.targetPosition!.y, 0.1);
    }

    private interpolateZoom() : void
    {
        this.baseLayer.scale.x = this.lerp(this.baseLayer.scale.x, this.targetZoom!, 0.1);
        this.baseLayer.scale.y = this.lerp(this.baseLayer.scale.y, this.targetZoom!, 0.1);

        this.x5Layer.scale.x = this.lerp(this.x5Layer.scale.x, this.targetZoom! * 5, 0.1);
        this.x5Layer.scale.y = this.lerp(this.x5Layer.scale.y, this.targetZoom! * 5, 0.1);

        this.x10Layer.scale.x = this.lerp(this.x10Layer.scale.x, this.targetZoom! * 10, 0.1);
        this.x10Layer.scale.y = this.lerp(this.x10Layer.scale.y, this.targetZoom! * 10, 0.1);
    }

    private interpolateVisibility() : void
    {
        this.baseLayer.alpha = this.lerp(this.baseLayer.alpha, +this._baseLayerVisible, 0.1);

        this.x5Layer.alpha = this.lerp(this.x5Layer.alpha, +this._x5LayerVisible, 0.1);

        this.x10Layer.alpha = this.lerp(this.x10Layer.alpha, +this._x10LayerVisible, 0.1);
    }

    public animatePosition(newPosition: Position) : void
    {
        // Update containerA position
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
        // Update containerA zoom
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
        const x: number = -this.baseLayer.position.x / this.baseLayer.scale.x;
        const y: number = -this.baseLayer.position.y / this.baseLayer.scale.y;
            
        const width: number = this.app.renderer.width / this.zoom;
        const height: number = this.app.renderer.height / this.zoom;
    
        return new PIXI.Rectangle(x, y, width, height);
    }


    /* UTILITY */

    private lerp = (a: number, b: number, c: number): number => a * (1 - c) + b * c;

    
    /* GETTER & SETTER */

    public get baseLayer() : PIXI.Container
    {
        return this._baseLayer;
    }

    public get x5Layer() : PIXI.Container
    {
        return this._x5Layer;
    }

    public get x10Layer() : PIXI.Container
    {
        return this._x10Layer;
    }

    public get position() : Position
    {
        return { x: this.baseLayer.position.x, y: this.baseLayer.position.y };
    }

    public set position(newPosition: Position)
    {
        this.cancelPositionAnimations();

        this.baseLayer.position.x = newPosition.x;
        this.baseLayer.position.y = newPosition.y;

        this.x5Layer.position.x = newPosition.x;
        this.x5Layer.position.y = newPosition.y;

        this.x10Layer.position.x = newPosition.x;
        this.x10Layer.position.y = newPosition.y;
    }

    public get zoom() : number
    {
        return this.baseLayer.scale.x;
    }

    public set zoom(newZoom: number)
    {
        this.cancelZoomAnimations();

        this.baseLayer.scale.x = newZoom;
        this.baseLayer.scale.y = newZoom;

        this.x5Layer.scale.x = newZoom * 5;
        this.x5Layer.scale.y = newZoom * 5;

        this.x10Layer.scale.x = newZoom * 10;
        this.x10Layer.scale.y = newZoom * 10;
    }

    public isAnimating(tolerance: number = TwitterGraphCamera.ANIMATION_TOLERANCE) : boolean
    {
        if(this.targetPosition !== undefined && (Math.abs(this.baseLayer.position.x - this.targetPosition.x) > tolerance
            || Math.abs(this.baseLayer.position.y - this.targetPosition.y) > tolerance)) return true;

        return this.targetZoom !== undefined && Math.abs(this.baseLayer.scale.x - this.targetZoom) > tolerance;
    }
}