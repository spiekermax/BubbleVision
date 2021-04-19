// Reactive X
import { Observable, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import Position from "src/app/shared/model/position/position";


export default class TwitterGraphCamera
{
    /* ATTRIBUTES */

    private targetPosition!: Position;
    private targetZoom!: number;

    private positionUpdater?: () => void = undefined;
    private zoomUpdater?: () => void = undefined;

    private positionUpdateSubject: Subject<void> = new Subject();
    private zoomUpdateSubject: Subject<void> = new Subject();


    /* LIFECYCLE */

    public constructor(private ticker: PIXI.Ticker, private target: PIXI.Container) {}


    /* CALLBACKS */

    private interpolatePosition() : void
    {
        this.target.position.x = this.lerp(this.target.x, this.targetPosition.x, 0.1);
        this.target.position.y = this.lerp(this.target.y, this.targetPosition.y, 0.1);

        this.positionUpdateSubject.next();
    }

    private interpolateZoom() : void
    {
        this.target.scale.x = this.lerp(this.target.scale.x, this.targetZoom, 0.1);
        this.target.scale.y = this.lerp(this.target.scale.y, this.targetZoom, 0.1);

        this.zoomUpdateSubject.next();
    }


    /* METHODS */

    public animatePosition(newPosition: Position) : void
    {
        // Update target position
        this.targetPosition = newPosition;

        // Bind position updater
        if(!this.positionUpdater)
        {
            this.positionUpdater = this.interpolatePosition.bind(this);
            this.ticker.add(this.positionUpdater);
        }
    }

    public animateZoom(newZoom: any) : void
    {
        // Update target zoom
        this.targetZoom = newZoom;

        // Bind zoom updater
        if(!this.zoomUpdater)
        {
            this.zoomUpdater = this.interpolateZoom.bind(this);
            this.ticker.add(this.zoomUpdater);
        }
    }

    public cancelPositionAnimations() : void
    {
        if(!this.positionUpdater) return;

        // Unbind position updater
        this.ticker.remove(this.positionUpdater);
        this.positionUpdater = undefined;
    }

    public cancelZoomAnimations() : void
    {
        if(!this.zoomUpdater) return;

        // Unbind zoom updater
        this.ticker.remove(this.zoomUpdater);
        this.zoomUpdater = undefined;
    }


    /* UTILITY */

    private lerp = (a: number, b: number, c: number): number => a * (1 - c) + b * c;

    
    /* GETTER & SETTER */

    public get position() : Position
    {
        return { x: this.target.position.x, y: this.target.position.y };
    }

    public set position(newPosition: Position)
    {
        this.cancelPositionAnimations();

        this.target.position.x = newPosition.x;
        this.target.position.y = newPosition.y;
    }

    public get zoom() : number
    {
        return this.target.scale.x;
    }

    public set zoom(newZoom: number)
    {
        this.cancelZoomAnimations();

        this.target.scale.x = newZoom;
        this.target.scale.y = newZoom;
    }

    public get positionUpdates() : Observable<void>
    {
        return this.positionUpdateSubject;
    }

    public get zoomUpdates() : Observable<void>
    {
        return this.zoomUpdateSubject;
    }
}