export class Utils
{
    /**
     * See https://stackoverflow.com/a/32638472/5723449
     * @param number 
     * @returns 
     */
    public static shortenNumber(number: number) : string
    {
        if(number === 0) return "0";

        const b: string[] = number.toPrecision(2).split("e");
        const k: number = b.length === 1 ? 0 : Math.floor(Math.min(+b[1].slice(1), 14) / 3);
        const c: number = k < 1 ? +number.toFixed(0) : +(number / Math.pow(10, k * 3)).toFixed(1);
        const d: number = c < 0 ? c : Math.abs(c);

        return d + ["", "K", " Mio.", " Mrd.", " Bio."][k];
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
        const flagRegex: RegExp = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g;
        const emojiRegex: RegExp = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;

        return text.replace(flagRegex, flagEmoji =>
        {
            const twemojiCode = flagEmoji.codePointAt(0)?.toString(16) + "-" + flagEmoji.codePointAt(2)?.toString(16);
            return `<img class="twitter-emoji" src="https://abs-0.twimg.com/emoji/v2/svg/${twemojiCode}.svg">`;
        })
        .replace(emojiRegex, emoji =>
        {
            const twemojiCode = emoji.codePointAt(0)?.toString(16);
            return `<img class="twitter-emoji" src="https://abs-0.twimg.com/emoji/v2/svg/${twemojiCode}.svg">`;
        });
    }
}