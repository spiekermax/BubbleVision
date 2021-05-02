// Angular
import { OnInit, Component, ElementRef, NgZone, OnDestroy, Input, EventEmitter, Output } from "@angular/core";

// PIXI
import * as PIXI from "pixi.js";

// Internal dependencies
import { Position } from "../../model/position/position";

import { TwitterCommunity } from "../../model/twitter/community/twitter-community";
import { TwitterProfile } from "../../model/twitter/profile/twitter-profile";

import { TwitterGraphCamera } from "./camera/twitter-graph-camera";
import { TwitterGraphResourceManager } from "./resource/twitter-graph-resource-manager";

import { TwitterGraphCommunityView } from "./view/twitter-graph-community-view";
import { TwitterGraphProfileView } from "./view/twitter-graph-profile-view";


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
    private _communities: TwitterCommunity[] = [];

    @Output()
    public profileClicked: EventEmitter<TwitterProfile> = new EventEmitter();
    
    @Output()
    public communityClicked: EventEmitter<TwitterCommunity> = new EventEmitter();


    /* ATTRIBUTES */

    // Application
    private app?: PIXI.Application;

    // Components
    private camera?: TwitterGraphCamera;
    private profileViews: TwitterGraphProfileView[] = [];
    
    // State
    private lastMouseDownPosition?: Position;
    private isDragGestureActive: boolean = false;


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
        this.camera.position = { x: 900, y: 450 };
        this.camera.zoom = 0.01;

        // Register update loop
        this.app?.ticker.add(this.onUtilityUpdate.bind(this), undefined, PIXI.UPDATE_PRIORITY.UTILITY);
    }

    public ngOnDestroy() : void 
    {
        // Destroy PIXI application
        this.app!.destroy();
    }


    /* CALLBACKS - LIFECYCLE */

    private onUtilityUpdate() : void
    {
        if(!this.camera) return;

        // Hide profile details when zoomed out
        if(this.camera.zoom < 0.04)
        {
            for(const profileView of this.profileViews)
                profileView.hideDetails();

            return;
        }

        // Show profile details when zoomed in
        for(const profileView of this.profileViews)
            profileView.showDetails();

        //
        if(this.lastMouseDownPosition || this.camera.zoom < 0.1 || this.camera.isAnimating(10)) return;

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

        //
        this.isDragGestureActive = false;
    }

    private onMouseMove(event: MouseEvent) : void
    {
        if(!this.camera || !this.lastMouseDownPosition) return;

        //
        this.isDragGestureActive = true;

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
        if(this.isDragGestureActive) return;

        this.ngZone.run(() => this.profileClicked.emit(profile));
    }

    private onCommunityClicked(community: TwitterCommunity) : void
    {
        if(this.isDragGestureActive) return;
        
        this.ngZone.run(() => this.communityClicked.emit(community));
    }


    /* CALLBACKS - STATE */

    private onProfilesChanged() : void
    {
        //
        if(!this.camera) return;

        // Remove old views
        this.camera.baseLayer.removeChildren();

        // Load placeholder avatar
        TwitterGraphResourceManager.add("assets/avatar.jpg");
        TwitterGraphResourceManager.load();

        // Add new views
        for(const profile of this._profiles)
        {
            // Create view
            const profileView: TwitterGraphProfileView = new TwitterGraphProfileView(this.app!.renderer, profile);

            // Cache view reference
            this.profileViews.push(profileView);

            // Bind callbacks
            profileView.clickedEvent.subscribe(() => this.onProfileClicked(profile));

            // Add view
            this.camera.baseLayer.addChild(profileView);
        }
    }

    private onCommunitiesChanged() : void
    {
        if(!this.camera) return;

        // Remove old nodes
        this.camera.lod0Layer.removeChildren();
        this.camera.lod1Layer.removeChildren();

        // Add new nodes
        for(const community of this.communities)
        {
            // Create node
            const communityNodeLod0: TwitterGraphCommunityView = new TwitterGraphCommunityView(this.app!.renderer, community, 0);

            // Bind callbacks
            communityNodeLod0.clickedEvent.subscribe(() => this.onCommunityClicked(community));

            // Add node
            this.camera.lod0Layer.addChild(communityNodeLod0);

            // Create node
            const communityNodeLod1: TwitterGraphCommunityView = new TwitterGraphCommunityView(this.app!.renderer, community, 1);

            // Bind callbacks
            communityNodeLod1.clickedEvent.subscribe(() => this.onCommunityClicked(community));

            // Add node
            this.camera.lod1Layer.addChild(communityNodeLod1);
        }
    }


    /* METHODS  */

    public zoomToProfile(profile: TwitterProfile) : void
    {
        if(!this.camera) return;

        const newZoom: number = 0.33;
        this.camera.animatePosition
        ({
            x: (-profile.position.x * newZoom) + (this.app!.renderer.width - TwitterGraphProfileView.DIAMETER / 2) / 2,
            y: (-profile.position.y * newZoom) + (this.app!.renderer.height - TwitterGraphProfileView.DIAMETER / 2) / 2
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

    public get communities() : TwitterCommunity[]
    {
        return this._communities;
    }

    @Input() 
    public set communities(newCommunities: TwitterCommunity[])
    {
        //
        this._communities = newCommunities;

        //
        this.onCommunitiesChanged();
    }
}