// Angular
import { OnInit, Component, ElementRef, NgZone, OnDestroy } from "@angular/core";

// PIXI
import * as PIXI from "pixi.js";


@Component({
    selector: "twitter-graph",
    template: ""
})
export class TwitterGraph implements OnInit, OnDestroy 
{
    /* ATTRIBUTES */

    public pixiApp!: PIXI.Application;


    /* LIFECYCLE */

    public constructor(private elementRef: ElementRef, private ngZone: NgZone) {}

    public ngOnInit() : void 
    {
        // Initialize PIXI application
        this.ngZone.runOutsideAngular(() => 
        {
            this.pixiApp = new PIXI.Application({ resizeTo: window });
        });
        this.elementRef.nativeElement.appendChild(this.pixiApp.view);
    }

    public ngOnDestroy() : void 
    {
        // Destroy PIXI application
        this.pixiApp.destroy();
    }
}