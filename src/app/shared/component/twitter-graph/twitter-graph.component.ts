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

    private _profileResolution: number = 1;
    private _communityResolution: number = 1;

    @Output()
    public profileClicked: EventEmitter<TwitterProfile> = new EventEmitter();
    
    @Output()
    public communityClicked: EventEmitter<TwitterCommunity> = new EventEmitter();

    @Output()
    public visibleProfilesChanged: EventEmitter<TwitterProfile[]> = new EventEmitter();


    /* ATTRIBUTES */

    // Application
    private app?: PIXI.Application;

    // Components
    private camera?: TwitterGraphCamera;

    private profileViews: TwitterGraphProfileView[] = [];
    private communityViews: TwitterGraphCommunityView[] = [];
    
    // State
    private lastMouseDownPosition?: Position;
    private isDragGestureActive: boolean = false;

    private lastVisibleBounds?: PIXI.Rectangle;
    private lastVisibleProfiles: TwitterProfile[] = [];

    private highlightConditions: Record<string, (profile: TwitterProfile) => boolean> = {};


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

        if(this.camera.zoom < 0.04)
        {
            // Hide profile details when zoomed out
            for(const profileView of this.profileViews)
                profileView.hideDetails();
        }
        else
        {
            // Show profile details when zoomed in
            for(const profileView of this.profileViews)
                profileView.showDetails();
        }

        //
        if(this.lastMouseDownPosition || this.camera.isAnimating(10)) return;
        
        // Get visible bounds
        const visibleBounds: PIXI.Rectangle = this.camera.calculateVisibleBounds();
        const visibleBoundsChanged: boolean = !this.lastVisibleBounds
            || this.lastVisibleBounds.top != visibleBounds.top
            || this.lastVisibleBounds.left != visibleBounds.left
            || this.lastVisibleBounds.bottom != visibleBounds.bottom
            || this.lastVisibleBounds.right != visibleBounds.right;

        //
        if(!visibleBoundsChanged) return;
        this.lastVisibleBounds = visibleBounds;

        // Find visible profiles
        const visibleProfiles: TwitterProfile[] = this.profiles.filter(profile =>
        {
            return profile.position.x >= visibleBounds.left - TwitterGraphProfileView.DIAMETER
                && profile.position.y >= visibleBounds.top - TwitterGraphProfileView.DIAMETER
                && profile.position.x <= visibleBounds.right
                && profile.position.y <= visibleBounds.bottom;
        });
        const visibleProfilesChanged: boolean = visibleProfiles.length != this.lastVisibleProfiles.length
            || !visibleProfiles.every((value, index) => value == this.lastVisibleProfiles[index]);

        //
        if(!visibleProfilesChanged) return;
        this.lastVisibleProfiles = visibleProfiles;

        if(this.camera.zoom >= 0.1)
        {
            //
            for(const visibleProfile of visibleProfiles)
                TwitterGraphResourceManager.add(visibleProfile.imageUrl);

            // Load visible images
            TwitterGraphResourceManager.load();
        }

        //
        this.ngZone.run(() => this.visibleProfilesChanged.emit([...visibleProfiles]));
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
            const profileView: TwitterGraphProfileView = new TwitterGraphProfileView(this.app!.renderer, profile, this.profileResolution);

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

        // Remove old views
        this.camera.lod0Layer.removeChildren();
        this.camera.lod1Layer.removeChildren();

        // Add new views
        for(const community of this.communities)
        {
            // Create view
            const communityViewLOD0: TwitterGraphCommunityView = new TwitterGraphCommunityView(this.app!.renderer, community, 0, this.communityResolution);

            // Cache view reference
            this.communityViews.push(communityViewLOD0);

            // Bind callbacks
            communityViewLOD0.clickedEvent.subscribe(() => this.onCommunityClicked(community));

            // Add view
            this.camera.lod0Layer.addChild(communityViewLOD0);


            // Create view
            const communityViewLOD1: TwitterGraphCommunityView = new TwitterGraphCommunityView(this.app!.renderer, community, 1, this.communityResolution);

            // Cache view reference
            this.communityViews.push(communityViewLOD1);

            // Bind callbacks
            communityViewLOD1.clickedEvent.subscribe(() => this.onCommunityClicked(community));

            // Add view
            this.camera.lod1Layer.addChild(communityViewLOD1);
        }
    }

    private onProfileResolutionChanged() : void
    {
        for(const profileView of this.profileViews)
            profileView.updateResolution(this.profileResolution);
    }

    private onCommunityResolutionChanged() : void
    {
        for(const communityView of this.communityViews)
            communityView.updateResolution(this.communityResolution);
    }


    /* METHODS - STATE */

    public addProfile(profile: TwitterProfile) : void
    {
        //
        this.profiles.push(profile);

        //
        if(!this.camera) return;

        // Create view
        const profileView: TwitterGraphProfileView = new TwitterGraphProfileView(this.app!.renderer, profile);
    
        // Cache view reference
        this.profileViews.push(profileView);
    
        // Bind callbacks
        profileView.clickedEvent.subscribe(() => this.onProfileClicked(profile));
    
        // Add view
        this.camera.baseLayer.addChild(profileView);
    }

    public removeProfile(profile: TwitterProfile) : void
    {
        throw new Error("Unimplemented");
    }

    public putHighlightCondition(conditionId: string, condition: (profile: TwitterProfile) => boolean) : void
    {
        this.highlightConditions[conditionId] = condition;
    }

    public takeHighlightCondition(conditionId: string) : void
    {
        delete this.highlightConditions[conditionId];
    }

    public updateHighlights() : void
    {
        //
        const conditions = Object.values(this.highlightConditions);

        //
        const highlightedCommunityMemberCount: Record<number, number> = {};
        for(const profileView of this.profileViews)
        {
            if(conditions.every(condition => condition(profileView.data)))
            {
                //
                profileView.sharpen();

                //
                const profileCommunityId: number = profileView.data.communityId;
                highlightedCommunityMemberCount[profileCommunityId] = (highlightedCommunityMemberCount[profileCommunityId] || 0) + 1;
            }
            else
            {
                //
                profileView.blur();
            }
        }

        //
        for(const communityView of this.communityViews)
        {
            //
            const communityId: number = communityView.data.id;

            if(communityId in highlightedCommunityMemberCount)
            {
                //
                communityView.sharpen();
                communityView.updateSizeLabel(highlightedCommunityMemberCount[communityId]);
            }
            else
            {
                //
                communityView.blur();
            }
        }
    }


    /* METHODS - CAMERA */

    public zoomToProfile(profile: TwitterProfile) : void
    {
        if(!this.camera) return;

        const newZoom: number = 0.33;
        this.camera.animatePosition
        ({
            x: (-profile.position.x * newZoom) + (this.app!.renderer.width - TwitterGraphProfileView.DIAMETER / 2) / 2,
            y: (-profile.position.y * newZoom) + (this.app!.renderer.height - TwitterGraphProfileView.DIAMETER / 2) / 2
        }, 
        0.06);
        this.camera.animateZoom(newZoom, 0.06);
    }

    private zoomToMousePosition(scalingFactor: number, mousePosition: Position) : void
    {
        if(!this.camera) return;

        const normalizedMousePosition: Position =
        {
            x: (mousePosition.x - this.camera.position.x) / this.camera.zoom,
            y: (mousePosition.y - this.camera.position.y) / this.camera.zoom
        };

        const newZoom: number = Math.min(this.camera.zoom * scalingFactor, 1);
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

    public get profileResolution() : number
    {
        return this._profileResolution;
    }

    @Input()
    public set profileResolution(newProfileResolution: number)
    {
        //
        this._profileResolution = newProfileResolution;

        //
        this.onProfileResolutionChanged();
    }

    public get communityResolution() : number
    {
        return this._communityResolution;
    }

    @Input()
    public set communityResolution(newCommunityResolution: number)
    {
        //
        this._communityResolution = newCommunityResolution;

        //
        this.onCommunityResolutionChanged();
    }
}