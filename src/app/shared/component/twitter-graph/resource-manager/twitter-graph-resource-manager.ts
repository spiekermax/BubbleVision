// Reactive X
import { Observable, of, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";


export default class TwitterGraphResourceManager
{
    /* VARIABLES */

    // private static RESOURCE_QUEUE: string[] = [];


    /* FUNCTIONS */

    public static add(url: string) : void
    {
        if(PIXI.Loader.shared.resources[url]) return;

        // if(PIXI.Loader.shared.loading)
            // TwitterGraphResourceManager.RESOURCE_QUEUE.push(url);
        
        PIXI.Loader.shared.add(url);
    }

    public static load() : void
    {
        PIXI.Loader.shared.load();
    }

    public static await(url: string) : Observable<PIXI.LoaderResource>
    {
        const subject: Subject<PIXI.LoaderResource> = new Subject<PIXI.LoaderResource>();

        if(PIXI.Loader.shared.resources[url]?.isComplete)
            return of(PIXI.Loader.shared.resources[url]);

        PIXI.Loader.shared.onLoad.add(() =>
        {
            if(!PIXI.Loader.shared.resources[url]?.isComplete) return;
            
            subject.next(PIXI.Loader.shared.resources[url]);
            subject.complete();
        });

        return subject;
    }
}