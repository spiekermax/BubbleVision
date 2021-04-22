// Reactive X
import { Observable, of, Subject } from "rxjs";

// PIXI
import * as PIXI from "pixi.js";


export default class TwitterGraphResourceManager
{
    /* FUNCTIONS */

    public static add(url: string) : void
    {
        if(PIXI.Loader.shared.resources[url]) return;

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

        PIXI.Loader.shared.onProgress.add(() =>
        {
            if(!PIXI.Loader.shared.resources[url]?.isComplete) return;
            
            subject.next(PIXI.Loader.shared.resources[url]);
            subject.complete();
        });

        return subject;
    }
}