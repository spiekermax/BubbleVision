// Angular
import { OnInit, Component, ElementRef, NgZone, OnDestroy, Input } from "@angular/core";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import Position from "../../model/position/position";
import TwitterProfile from "../../model/twitter/twitter-profile";
import TwitterGraphCamera from "./camera/twitter-graph-camera";
import TwitterGraphProfileNode from "./node/twitter-graph-profile-node";
import TwitterGraphResourceManager from "./resource-manager/twitter-graph-resource-manager";


@Component
({
    selector: "twitter-graph",
    template: ""
})
export class TwitterGraph implements OnInit, OnDestroy
{
    /* DIRECTIVES */

    // Inputs
    private _twitterProfiles: TwitterProfile[] = [];


    /* ATTRIBUTES */

    // Application
    private app!: PIXI.Application;

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
            // Skip hello message
            PIXI.utils.skipHello();

            // Initialize PIXI application
            this.app = new PIXI.Application
            ({
                resizeTo: window,
                antialias: true,
                backgroundColor: 0xFAFAFA
            });
            this.elementRef.nativeElement.appendChild(this.app.view);

            // Bind listeners
            this.app.view.addEventListener("mousedown", this.onMouseDown.bind(this));
            this.app.view.addEventListener("mouseup", this.onMouseUp.bind(this));
            this.app.view.addEventListener("mousemove", this.onMouseMove.bind(this));
            this.app.view.addEventListener("wheel", this.onMouseWheel.bind(this));
        });

        // Initialize camera
        this.camera = new TwitterGraphCamera(this.app.stage, this.app.ticker);
        this.camera.position = { x: 900, y: 400 };
        this.camera.zoom = 0.012;

        // Initialize containers
        this.nodeContainer = new PIXI.Container();
        this.app.stage.addChild(this.nodeContainer);
    }

    public ngOnDestroy() : void 
    {
        // Destroy PIXI application
        this.app.destroy();
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


    /* GETTER & SETTER */

    public get twitterProfiles() : TwitterProfile[]
    {
        return this._twitterProfiles;
    }

    @Input() 
    public set twitterProfiles(newTwitterProfiles: TwitterProfile[])
    {
        //
        this._twitterProfiles = newTwitterProfiles;

        //
        if(!this.nodeContainer) return;

        // Remove old nodes
        this.nodeContainer.removeChildren();

        // Add new nodes
        for(const twitterProfile of this._twitterProfiles)
        {
            //
            const twitterProfileNode: TwitterGraphProfileNode = new TwitterGraphProfileNode(this.app.renderer, twitterProfile);
            this.nodeContainer.addChild(twitterProfileNode);

            //
            if(twitterProfile.imageUrl)
            {
                const imagePath: string = `assets/profile-images/${twitterProfile.imageUrl.replace("https://", "").split("/").join("_")}`;
                TwitterGraphResourceManager.add(imagePath);
            }
        }

        //
        TwitterGraphResourceManager.load();
    }
}