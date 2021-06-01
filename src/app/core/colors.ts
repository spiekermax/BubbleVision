export class Colors
{
    private static readonly TWITTER_COMMUNITY_COLOR_NUMBERS: number[] =
    [
        0xe6194B,
        0x3cb44b,
        0xf57920,
        0x4363d8,
        0xffe119,
        0x911eb4,
        0x42d4f4,
        0xf032e6,
        0xa6d13b,
        0xfabed4,
        0x469990,
        0x9c6ad4,
        0x9A6324,
        0xd4c74c,
        0x800000,
        0x137040,
        0x808000,
        0xffd8b1,
        0x000075,
        0xa9a9a9,
    ];

    private static readonly TWITTER_COMMUNITY_COLOR_STRINGS: string[] =
    [
        "#e6194B",
        "#3cb44b",
        "#f57920",
        "#4363d8",
        "#ffe119",
        "#911eb4",
        "#42d4f4",
        "#f032e6",
        "#a6d13b",
        "#fabed4",
        "#469990",
        "#9c6ad4",
        "#9A6324",
        "#d4c74c",
        "#800000",
        "#137040",
        "#808000",
        "#ffd8b1",
        "#000075",
        "#a9a9a9",
    ];
    
    public static getTwitterCommunityColor(communityId?: number) : { asNumber: number, asString: string }
    {
        if(communityId === undefined || communityId === null)
            return { asNumber: 0x000000, asString: "#000000" };

        const color =
        {
            asNumber: Colors.TWITTER_COMMUNITY_COLOR_NUMBERS[communityId % Colors.TWITTER_COMMUNITY_COLOR_NUMBERS.length],
            asString: Colors.TWITTER_COMMUNITY_COLOR_STRINGS[communityId % Colors.TWITTER_COMMUNITY_COLOR_STRINGS.length]
        }

        return color;
    }
}