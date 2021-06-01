// Reactive X
import { NEVER, Observable, of, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";


/**
 * TODO: Refactoring
 */
export class TwitterGraphResourceManager
{
    /* VARIABLES */

    private static RESOURCE_QUEUE: Set<string> = new Set();


    /* FUNCTIONS */

    public static init() : void
    {
        PIXI.Loader.shared.onComplete.add(() =>
        {
            if(this.RESOURCE_QUEUE.size == 0) return;

            for(const resource of TwitterGraphResourceManager.RESOURCE_QUEUE)
            {
                if(PIXI.Loader.shared.resources[resource]) continue;

                PIXI.Loader.shared.add(resource);
            }
            TwitterGraphResourceManager.RESOURCE_QUEUE.clear();
            
            PIXI.Loader.shared.load();
        });
    }

    public static add(url: string) : void
    {
        if(!url) return;

        if(PIXI.Loader.shared.resources[url]) return;

        if(PIXI.Loader.shared.loading)
        {
            TwitterGraphResourceManager.RESOURCE_QUEUE.add(url);
        }
        else
        {
            PIXI.Loader.shared.add(url);
        }
    }

    public static load() : void
    {
        if(!PIXI.Loader.shared.loading)
        PIXI.Loader.shared.load();
    }

    public static await(url: string) : Observable<PIXI.LoaderResource>
    {
        if(!url) return NEVER;

        const subject: Subject<PIXI.LoaderResource> = new Subject<PIXI.LoaderResource>();

        if(PIXI.Loader.shared.resources[url]?.isComplete)
            return of(PIXI.Loader.shared.resources[url]);

        const id = PIXI.Loader.shared.onComplete.add(() =>
        {
            if(!PIXI.Loader.shared.resources[url]?.isComplete) return;
            
            subject.next(PIXI.Loader.shared.resources[url]);
            subject.complete();
            PIXI.Loader.shared.onComplete.detach(id);
        });

        return subject;
    }

    public static addAndAwait(url: string) : Observable<PIXI.LoaderResource>
    {
        this.add(url);
        return this.await(url);
    }
}