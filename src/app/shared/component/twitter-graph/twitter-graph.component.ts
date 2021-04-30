// Angular
import { OnInit, Component, ElementRef, NgZone, OnDestroy, Input, EventEmitter, Output } from "@angular/core";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { Position } from "../../model/position/position";
import { TwitterCommunity } from "../../model/twitter/twitter-community";
import { TwitterProfile } from "../../model/twitter/twitter-profile";
import { TwitterGraphCamera } from "./camera/twitter-graph-camera";
import { TwitterGraphCommunityNode } from "./node/twitter-graph-community-node";
import { TwitterGraphProfileNode } from "./node/twitter-graph-profile-node";
import { TwitterGraphResourceManager } from "./resource-manager/twitter-graph-resource-manager";


@Component
({
    selector: "twitter-graph",
    template: ""
})
export class TwitterGraphComponent implements OnInit, OnDestroy
{
    /* DIRECTIVES */

    // Inputs
    private _profiles: TwitterProfile[] = [];
    private _communities0: TwitterCommunity[] = [];
    private _communities1: TwitterCommunity[] = [];

    @Output()
    public profileClicked: EventEmitter<TwitterProfile> = new EventEmitter();


    /* ATTRIBUTES */

    // Application
    private app?: PIXI.Application;

    // Components
    private camera?: TwitterGraphCamera;

    private profileNodes: TwitterGraphProfileNode[] = [];
    
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
        this.camera = new TwitterGraphCamera(this.app!);
        this.camera.position = { x: 900, y: 400 };
        this.camera.zoom = 0.012;

        // Load profile images on demand
        this.autoLoadVisibleProfileImages();

        this.app!.ticker.add(() =>
        {
            if(!this.camera) return;

            if(this.camera.zoom < 0.04)
            {
                for(const pr of this.profileNodes)
                    pr.hideStuff();
            }
            else
            {
                for(const pr of this.profileNodes)
                    pr.showStuff();
            }

            
        });
    }

    public ngOnDestroy() : void 
    {
        // Destroy PIXI application
        this.app!.destroy();
    }


    /* CALLBACKS - EVENTS */

    private onMouseDown(event: MouseEvent) : void
    {
        // Cancel camera animations
        this.camera?.cancelPositionAnimations();
        this.camera?.cancelZoomAnimations();

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
        if(!this.lastMouseDownPosition || !this.camera) return;

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

    private onProfileClicked(profile: TwitterProfile) : void
    {
        this.ngZone.run(() => this.profileClicked.emit(profile));
    }


    /* CALLBACKS - STATE */

    private onProfilesChanged() : void
    {
        //
        if(!this.camera) return;

        // Remove old nodes
        this.camera.baseLayer.removeChildren();

        // Load placeholder avatar
        TwitterGraphResourceManager.add("assets/avatar.jpg");
        TwitterGraphResourceManager.load();

        // Add new nodes
        for(const profile of this._profiles)
        {
            // Create node
            const profileNode: TwitterGraphProfileNode = new TwitterGraphProfileNode(this.app!.renderer, profile);

            // Bind callbacks
            profileNode.clickedEvent.subscribe(() => this.onProfileClicked(profile));

            this.profileNodes.push(profileNode);

            // Add node
            this.camera.baseLayer.addChild(profileNode);
        }
    }

    private onCommunities0Changed() : void
    {
        if(!this.camera) return;

        // Remove old nodes
        this.camera.x10Layer.removeChildren();

        // Add new nodes
        for(const community of this.communities0)
        {
            // Create node
            const communityNode: TwitterGraphCommunityNode = new TwitterGraphCommunityNode(this.app!.renderer, community, 10);

            // Add node
            this.camera.x10Layer.addChild(communityNode);
        }
    }

    private onCommunities1Changed() : void
    {
        if(!this.camera) return;

        // Remove old nodes
        this.camera.x5Layer.removeChildren();

        // Add new nodes
        for(const community of this.communities1)
        {
            // Create node
            const communityNode: TwitterGraphCommunityNode = new TwitterGraphCommunityNode(this.app!.renderer, community, 5);

            // Add node
            this.camera.x5Layer.addChild(communityNode);
        }
    }


    /* METHODS */

    private autoLoadVisibleProfileImages() : void
    {
        this.app?.ticker.add(() =>
        {
            //
            if(this.lastMouseDownPosition || !this.camera || this.camera.zoom < 0.1 || this.camera.isAnimating(10)) return;

            //
            if(!this.profiles) return;

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
        if(!this.camera) return;

        const newZoom: number = 0.33;
        this.camera.animatePosition
        ({
            x: (-profile.position.x * newZoom) + (this.app!.renderer.width - TwitterGraphProfileNode.NODE_SIZE / 2) / 2,
            y: (-profile.position.y * newZoom) + (this.app!.renderer.height - TwitterGraphProfileNode.NODE_SIZE / 2) / 2
        });
        this.camera.animateZoom(newZoom);
    }

    private zoomToMousePosition(scalingFactor: number, mousePosition: Position) : void
    {
        if(!this.camera) return;

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

    public get communities0() : TwitterCommunity[]
    {
        return this._communities0;
    }

    @Input() 
    public set communities0(newCommunities: TwitterCommunity[])
    {
        //
        this._communities0 = newCommunities;

        //
        this.onCommunities0Changed();
    }

    public get communities1() : TwitterCommunity[]
    {
        return this._communities1;
    }

    @Input() 
    public set communities1(newCommunities: TwitterCommunity[])
    {
        //
        this._communities1 = newCommunities;

        //
        this.onCommunities1Changed();
    }
}