// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { Position } from "src/app/shared/model/position/position";


export class TwitterGraphCamera
{
    /* CONSTANTS */

    private static readonly ANIMATION_TOLERANCE: number = 0.00001;

    public static readonly LOD0_SCALING_FACTOR: number = 10;
    public static readonly LOD1_SCALING_FACTOR: number = 5;
    public static readonly LOD2_SCALING_FACTOR: number = 1;
    public static readonly BASE_SCALING_FACTOR: number = 1;


    /* FUNCTIONS */

    public static getLodScalingFactor(lod?: number) : number
    {
        switch(lod)
        {
            case 0: 
                return TwitterGraphCamera.LOD0_SCALING_FACTOR;
            case 1: 
                return TwitterGraphCamera.LOD1_SCALING_FACTOR;
            case 2: 
                return TwitterGraphCamera.LOD2_SCALING_FACTOR;
            default: 
                return TwitterGraphCamera.BASE_SCALING_FACTOR;
        }
    }


    /* ATTRIBUTES */

    // Layers
    private _lod0Layer: PIXI.Container = new PIXI.Container();
    private _lod1Layer: PIXI.Container = new PIXI.Container();
    private _lod2Layer: PIXI.Container = new PIXI.Container();
    
    private lod0LayerVisible: boolean = true;
    private lod1LayerVisible: boolean = false;
    private lod2LayerVisible: boolean = true;

    private targetPosition?: Position;
    private targetZoom?: number;

    private positionAnimationSpeed: number = 0.1;
    private zoomAnimationSpeed: number = 0.1;

    private positionUpdater?: () => void = undefined;
    private zoomUpdater?: () => void = undefined;


    /* LIFECYCLE */

    public constructor(private app: PIXI.Application)
    {
        // 
        this.lod0Layer.sortableChildren = true;
        this.lod1Layer.sortableChildren = true;
        this.lod2Layer.sortableChildren = true;

        //
        this.lod0Layer.alpha = +this.lod0LayerVisible;
        this.lod1Layer.alpha = +this.lod1LayerVisible;
        this.lod2Layer.alpha = +this.lod2LayerVisible;

        // Add layers
        this.app.stage.addChild(this.lod2Layer);
        this.app.stage.addChild(this.lod1Layer);
        this.app.stage.addChild(this.lod0Layer);

        //
        this.app.ticker.add(this.onUtilityUpdate.bind(this), undefined, PIXI.UPDATE_PRIORITY.UTILITY);
    }


    /* CALLBACKS */

    private onUtilityUpdate() : void
    {
        // Position animations
        if(this.targetPosition && Math.abs(this.position.x - this.targetPosition.x) < TwitterGraphCamera.ANIMATION_TOLERANCE && Math.abs(this.position.y - this.targetPosition.y) < TwitterGraphCamera.ANIMATION_TOLERANCE)
        {
            // Cancel stale animations
            this.cancelPositionAnimations();
        }

        // Zoom animations
        if(this.targetZoom && Math.abs(this.zoom - this.targetZoom) < TwitterGraphCamera.ANIMATION_TOLERANCE)
        {
            // Cancel stale animations
            this.cancelZoomAnimations();
        }

        // Update layer visibility
        this.lod0LayerVisible = this.zoom < 0.02;
        this.lod1LayerVisible = this.zoom >= 0.02 && this.zoom <= 0.1;
        // this.lod2LayerVisible = this.zoom > 0.1;

        // Update layer interactivity
        this.lod0Layer.interactiveChildren = this.zoom < 0.02;
        this.lod1Layer.interactiveChildren = this.zoom >= 0.02 && this.zoom <= 0.1;
        this.lod2Layer.interactiveChildren = this.zoom >= 0.02;

        // Interpolate visibility
        this.interpolateVisibility()
    }


    /* METHODS */

    private interpolatePosition() : void
    {
        this.lod0Layer.position.x = this.lerp(this.lod0Layer.position.x, this.targetPosition!.x, this.positionAnimationSpeed);
        this.lod0Layer.position.y = this.lerp(this.lod0Layer.position.y, this.targetPosition!.y, this.positionAnimationSpeed);

        this.lod1Layer.position.x = this.lerp(this.lod1Layer.position.x, this.targetPosition!.x, this.positionAnimationSpeed);
        this.lod1Layer.position.y = this.lerp(this.lod1Layer.position.y, this.targetPosition!.y, this.positionAnimationSpeed);

        this.lod2Layer.position.x = this.lerp(this.lod2Layer.position.x, this.targetPosition!.x, this.positionAnimationSpeed);
        this.lod2Layer.position.y = this.lerp(this.lod2Layer.position.y, this.targetPosition!.y, this.positionAnimationSpeed);
    }

    private interpolateZoom() : void
    {
        this.lod0Layer.scale.x = this.lerp(this.lod0Layer.scale.x, this.targetZoom! * TwitterGraphCamera.LOD0_SCALING_FACTOR, this.zoomAnimationSpeed);
        this.lod0Layer.scale.y = this.lerp(this.lod0Layer.scale.y, this.targetZoom! * TwitterGraphCamera.LOD0_SCALING_FACTOR, this.zoomAnimationSpeed);

        this.lod1Layer.scale.x = this.lerp(this.lod1Layer.scale.x, this.targetZoom! * TwitterGraphCamera.LOD1_SCALING_FACTOR, this.zoomAnimationSpeed);
        this.lod1Layer.scale.y = this.lerp(this.lod1Layer.scale.y, this.targetZoom! * TwitterGraphCamera.LOD1_SCALING_FACTOR, this.zoomAnimationSpeed);
        
        this.lod2Layer.scale.x = this.lerp(this.lod2Layer.scale.x, this.targetZoom! * TwitterGraphCamera.LOD2_SCALING_FACTOR, this.zoomAnimationSpeed);
        this.lod2Layer.scale.y = this.lerp(this.lod2Layer.scale.y, this.targetZoom! * TwitterGraphCamera.LOD2_SCALING_FACTOR, this.zoomAnimationSpeed);
    }

    private interpolateVisibility() : void
    {
        this.lod0Layer.alpha = this.lerp(this.lod0Layer.alpha, +this.lod0LayerVisible, 0.05);
        this.lod0Layer.visible = this.lod0Layer.alpha > TwitterGraphCamera.ANIMATION_TOLERANCE;

        this.lod1Layer.alpha = this.lerp(this.lod1Layer.alpha, +this.lod1LayerVisible, 0.05);
        this.lod1Layer.visible = this.lod1Layer.alpha > TwitterGraphCamera.ANIMATION_TOLERANCE;
        
        this.lod2Layer.alpha = this.lerp(this.lod2Layer.alpha, +this.lod2LayerVisible, 0.05);
        this.lod2Layer.visible = this.lod2Layer.alpha > TwitterGraphCamera.ANIMATION_TOLERANCE;
    }

    public animatePosition(newPosition: Position, animationSpeed: number = 0.1) : void
    {
        // Update target position
        this.targetPosition = newPosition;

        // Update animation speed
        this.positionAnimationSpeed = animationSpeed;

        // Bind position updater
        if(!this.positionUpdater)
        {
            this.positionUpdater = this.interpolatePosition.bind(this);
            this.app.ticker.add(this.positionUpdater);
        }
    }

    public animateZoom(newZoom: number, animationSpeed: number = 0.1) : void
    {
        // Update target zoom
        this.targetZoom = newZoom;

        // Update animation speed
        this.zoomAnimationSpeed = animationSpeed;

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
        const x: number = -this.position.x / this.zoom;
        const y: number = -this.position.y / this.zoom;
            
        const width: number = this.app.renderer.width / this.zoom;
        const height: number = this.app.renderer.height / this.zoom;
    
        return new PIXI.Rectangle(x, y, width, height);
    }


    /* UTILITY */

    private lerp = (a: number, b: number, c: number): number => a * (1 - c) + b * c;

    
    /* GETTER & SETTER */

    public get baseLayer() : PIXI.Container
    {
        return this._lod2Layer;
    }

    public get lod2Layer() : PIXI.Container
    {
        return this._lod2Layer;
    }

    public get lod1Layer() : PIXI.Container
    {
        return this._lod1Layer;
    }

    public get lod0Layer() : PIXI.Container
    {
        return this._lod0Layer;
    }

    public get position() : Position
    {
        return { x: this.baseLayer.position.x, y: this.baseLayer.position.y };
    }

    public set position(newPosition: Position)
    {
        this.cancelPositionAnimations();

        this.lod0Layer.position.x = newPosition.x;
        this.lod0Layer.position.y = newPosition.y;

        this.lod1Layer.position.x = newPosition.x;
        this.lod1Layer.position.y = newPosition.y;

        this.lod2Layer.position.x = newPosition.x;
        this.lod2Layer.position.y = newPosition.y;
    }

    public get zoom() : number
    {
        return this.baseLayer.scale.x;
    }

    public set zoom(newZoom: number)
    {
        this.cancelZoomAnimations();

        this.lod0Layer.scale.x = newZoom * TwitterGraphCamera.LOD0_SCALING_FACTOR;
        this.lod0Layer.scale.y = newZoom * TwitterGraphCamera.LOD0_SCALING_FACTOR;

        this.lod1Layer.scale.x = newZoom * TwitterGraphCamera.LOD1_SCALING_FACTOR;
        this.lod1Layer.scale.y = newZoom * TwitterGraphCamera.LOD1_SCALING_FACTOR;

        this.lod2Layer.scale.x = newZoom * TwitterGraphCamera.LOD2_SCALING_FACTOR;
        this.lod2Layer.scale.y = newZoom * TwitterGraphCamera.LOD2_SCALING_FACTOR;
    }

    public isAnimating(tolerance: number = TwitterGraphCamera.ANIMATION_TOLERANCE) : boolean
    {
        if(this.targetPosition !== undefined && (Math.abs(this.position.x - this.targetPosition.x) > tolerance
            || Math.abs(this.position.y - this.targetPosition.y) > tolerance)) return true;

        return this.targetZoom !== undefined && Math.abs(this.zoom - this.targetZoom) > tolerance;
    }
}