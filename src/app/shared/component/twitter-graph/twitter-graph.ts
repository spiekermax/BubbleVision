// Angular
import { OnInit, Component, ElementRef, NgZone, OnDestroy } from "@angular/core";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import Position from "../../model/position/position";
import TwitterGraphCamera from "./camera/twitter-graph-camera";
import TwitterGraphNode from "./node/twitter-graph-node";


@Component
({
    selector: "twitter-graph",
    template: ""
})
export class TwitterGraph implements OnInit, OnDestroy
{
    /* ATTRIBUTES */

    // Application
    private pixiApp!: PIXI.Application;

    // Containers
    private nodeContainer!: PIXI.Container;

    // Components
    private camera!: TwitterGraphCamera;
    
    // State
    private lastMousePosition?: Position;


    /* LIFECYCLE */

    public constructor(private elementRef: ElementRef, private ngZone: NgZone) {}

    public ngOnInit() : void 
    {
        this.ngZone.runOutsideAngular(() => 
        {
            // Initialize PIXI application
            this.pixiApp = new PIXI.Application
            ({
                resizeTo: window,
                antialias: true,
                transparent: true
            });
            this.elementRef.nativeElement.appendChild(this.pixiApp.view);

            // Bind listeners
            this.pixiApp.view.addEventListener("mousedown", this.onMouseDown.bind(this));
            this.pixiApp.view.addEventListener("mouseup", this.onMouseUp.bind(this));
            this.pixiApp.view.addEventListener("mousemove", this.onMouseMove.bind(this));
            this.pixiApp.view.addEventListener("wheel", this.onMouseWheel.bind(this));
        });

        // Initialize camera
        this.camera = new TwitterGraphCamera(this.pixiApp.ticker, this.pixiApp.stage);
        
        // Initialize containers
        this.nodeContainer = new PIXI.Container();
        this.pixiApp.stage.addChild(this.nodeContainer);

        // Add nodes
        this.nodeContainer.addChild(new TwitterGraphNode("Hello Graph!"))
    }

    public ngOnDestroy() : void 
    {
        // Destroy PIXI application
        this.pixiApp.destroy();
    }


    /* CALLBACKS */

    public onMouseDown(event: MouseEvent) : void
    {
        // Cancel camera animations
        this.camera.cancelPositionAnimations();
        this.camera.cancelZoomAnimations();

        // Update mouse position state
        this.lastMousePosition =
        {
            x: event.offsetX,
            y: event.offsetY
        };
    }

    public onMouseUp(event: MouseEvent) : void
    {
        // Clear mouse position state
        this.lastMousePosition = undefined;
    }

    public onMouseMove(event: MouseEvent) : void
    {
        if(!this.lastMousePosition) return;

        // Update camera position
        this.camera.position =
        {
            x: this.camera.position.x + event.offsetX - this.lastMousePosition.x,
            y: this.camera.position.y + event.offsetY - this.lastMousePosition.y
        };

        // Update mouse position state
        this.lastMousePosition = 
        { 
            x: event.offsetX, 
            y: event.offsetY 
        };
    }

    public onMouseWheel(event: WheelEvent) : void
    {
        // Zoom to mouse position
        const scalingFactor: number = event.deltaY < 0 ? 2 : 0.5;
        const mousePosition: Position =
        { 
            x: event.offsetX,
            y: event.offsetY 
        };
        this.zoomToMousePosition(scalingFactor, mousePosition);
    }


    /* METHODS - CAMERA */

    private zoomToMousePosition(scalingFactor: number, mousePosition: Position) : void
    {
        const normalizedMousePosition: Position =
        {
            x: (mousePosition.x - this.camera.position.x) / this.camera.zoom,
            y: (mousePosition.y - this.camera.position.y) / this.camera.zoom
        };

        const newZoom: number = this.camera.zoom * scalingFactor;
        const newPosition: Position =
        {
            x: mousePosition.x - (normalizedMousePosition.x * newZoom),
            y: mousePosition.y - (normalizedMousePosition.y * newZoom)
        };

        this.camera.animatePosition(newPosition);
        this.camera.animateZoom(newZoom);
    }
}