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
    private _profiles: TwitterProfile[] = [];


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
        if(!PIXI.utils.isWebGLSupported())
        {
            alert("Your browser or device doesn't support WebGL. This software needs WebGL in order to work properly, sorry!");
            return;
        }

        this.ngZone.runOutsideAngular(() => 
        {
            // Skip hello message
            PIXI.utils.skipHello();

            // Initialize PIXI application
            this.app = new PIXI.Application
            ({
                resizeTo: window,
                antialias: true,
                backgroundColor: 0xF2F2F2
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
        if(this.lastMouseDownPosition) return;

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

    private onProfilesChanged() : void
    {
        //
        if(!this.nodeContainer) return;

        // Remove old nodes
        this.nodeContainer.removeChildren();

        // Load placeholder avatar
        TwitterGraphResourceManager.add("assets/avatar.jpg");
        TwitterGraphResourceManager.load();

        // Add new nodes
        for(const profile of this._profiles)
        {
            const twitterProfileNode: TwitterGraphProfileNode = new TwitterGraphProfileNode(this.app.renderer, profile);
            this.nodeContainer.addChild(twitterProfileNode);
        }
    }


    /* METHODS */

    private autoLoadVisibleProfileImages() : void
    {
        this.app.ticker.add(() =>
        {
            //
            if(!this.profiles || this.lastMouseDownPosition || this.camera.zoom < 0.12 || this.camera.isAnimating(10)) return;

            // Get visible bounds
            const visibleBounds: PIXI.Rectangle = this.camera.calculateVisibleBounds();

            // Request visible images
            for(const profile of this.profiles)
            {
                if(profile.position.x < visibleBounds.left || profile.position.y < visibleBounds.top) continue;
                if(profile.position.x > visibleBounds.right || profile.position.y > visibleBounds.bottom) continue;
    
                TwitterGraphResourceManager.add(profile.imageUrl);
            }

            // Load visible images
            TwitterGraphResourceManager.load();

        }, undefined, PIXI.UPDATE_PRIORITY.UTILITY);
    }


    /* METHODS - CAMERA */

    public zoomToProfile(profile: TwitterProfile) : void
    {
        const newZoom: number = 0.33;

        this.camera.animatePosition
        ({
            x: (-profile.position.x * newZoom) + (this.app.renderer.width - TwitterGraphProfileNode.NODE_SIZE) / 2,
            y: (-profile.position.y * newZoom) + (this.app.renderer.height - TwitterGraphProfileNode.NODE_SIZE) / 2
        });
        this.camera.animateZoom(newZoom);
    }

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

    public get profiles() : TwitterProfile[]
    {
        return this._profiles;
    }

    @Input() 
    public set profiles(newProfiles: TwitterProfile[])
    {
        //
        this._profiles = newProfiles;

        //
        this.onProfilesChanged();
    }
}