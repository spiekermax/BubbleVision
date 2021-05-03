// @ts-ignore
import twemoji from "twemoji";


export class Utils
{
    /**
     * See https://stackoverflow.com/a/32638472/5723449
     * @param number 
     * @returns 
     */
    public static shortenNumber(number: number, labels: string[] = ["", "K", " Mio.", " Mrd.", " Bio."]) : string
    {
        if(number === 0) return "0";

        const b: string[] = number.toPrecision(2).split("e");
        const k: number = b.length === 1 ? 0 : Math.floor(Math.min(+b[1].slice(1), 14) / 3);
        const c: number = k < 1 ? +number.toFixed(0) : +(number / Math.pow(10, k * 3)).toFixed(1);
        const d: number = c < 0 ? c : Math.abs(c);

        return d + labels[k];
    }

    /**
     * TODO
     * @param text 
     * @returns 
     */
    public static urlify(text: string) : string
    {
        const urlRegex: RegExp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, url => '<a target="_blank" rel="noopener noreferrer" href="' + url + '">' + url + '</a>');
    }

    /**
     * TODO
     * @param text
     * @returns 
     */
    public static twemojify(text: string) : string
    {
        return twemoji.parse(text, { className: "twitter-emoji" });
    }
}