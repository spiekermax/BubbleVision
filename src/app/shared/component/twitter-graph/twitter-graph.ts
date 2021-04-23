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
    private lastMouseDownPosition?: Position;


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
            this.app.view.addEventListener("mouseleave", this.onMouseLeave.bind(this));
        });

        // Initialize resource manager
        TwitterGraphResourceManager.init();

        // Initialize camera
        this.camera = new TwitterGraphCamera(this.app);
        this.camera.position = { x: 900, y: 400 };
        this.camera.zoom = 0.012;

        // Initialize containers
        this.nodeContainer = new PIXI.Container();
        this.app.stage.addChild(this.nodeContainer);

        // Load profile images on demand
        this.autoLoadVisibleProfileImages();
    }

    public ngOnDestroy() : void 
    {
        // Destroy PIXI application
        this.app.destroy();
    }


    /* CALLBACKS - EVENTS */

    private onMouseDown(event: MouseEvent) : void
    {
        // Cancel camera animations
        this.camera.cancelPositionAnimations();
        this.camera.cancelZoomAnimations();

        // Update mouse position state
        this.lastMouseDownPosition =
        {
            x: event.offsetX,
            y: event.offsetY
        };
    }

    private onMouseUp(event: MouseEvent) : void
    {
        // Clear mouse position state
        this.lastMouseDownPosition = undefined;
    }

    private onMouseMove(event: MouseEvent) : void
    {
        if(!this.lastMouseDownPosition) return;

        // Update camera position
        this.camera.position =
        {
            x: this.camera.position.x + event.offsetX - this.lastMouseDownPosition.x,
            y: this.camera.position.y + event.offsetY - this.lastMouseDownPosition.y
        };

        // Update mouse position state
        this.lastMouseDownPosition = 
        { 
            x: event.offsetX, 
            y: event.offsetY 
        };
    }

    private onMouseWheel(event: WheelEvent) : void
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

    private onMouseLeave(event: MouseEvent) : void
    {
        // Clear mouse position state
        this.lastMouseDownPosition = undefined;
    }


    /* CALLBACKS - STATE */

    private onTwitterProfilesChanged() : void
    {
        //
        if(!this.nodeContainer) return;

        // Remove old nodes
        this.nodeContainer.removeChildren();

        // Load placeholder avatar
        TwitterGraphResourceManager.add("assets/avatar.jpg");
        TwitterGraphResourceManager.load();

        // Add new nodes
        for(const twitterProfile of this._twitterProfiles)
        {
            const twitterProfileNode: TwitterGraphProfileNode = new TwitterGraphProfileNode(this.app.renderer, twitterProfile);
            this.nodeContainer.addChild(twitterProfileNode);
        }
    }


    /* METHODS */

    private autoLoadVisibleProfileImages() : void
    {
        this.app.ticker.add(() =>
        {
            //
            if(!this.twitterProfiles || this.lastMouseDownPosition || this.camera.zoom < 0.12) return;

            // Get visible bounds
            const visibleBounds: PIXI.Rectangle = this.camera.calculateVisibleBounds();

            // Request visible images
            for(const twitterProfile of this.twitterProfiles)
            {
                if(twitterProfile.position.x < visibleBounds.left || twitterProfile.position.y < visibleBounds.top) continue;
                if(twitterProfile.position.x > visibleBounds.right || twitterProfile.position.y > visibleBounds.bottom) continue;
    
                TwitterGraphResourceManager.add(twitterProfile.imageUrl);
            }

            // Load visible images
            TwitterGraphResourceManager.load();

        }, undefined, PIXI.UPDATE_PRIORITY.UTILITY);
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
        this.onTwitterProfilesChanged();
    }
}