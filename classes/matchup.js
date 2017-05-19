exports.Matchup = function () {
    var matchup = this;

    matchup.listOfChampions = {
        "ahri": "https://www.reddit.com/r/viktormains/comments/4jz0os/weekly_matchup_discussion_1_viktor_vs_ahri/ - patch 6.10",
        "akali": "https://www.reddit.com/r/viktormains/comments/665z6g/weekly_matchup_discussion_31_viktor_vs_akali/ - patch 7.8",
        "anivia": "https://www.reddit.com/r/viktormains/comments/577drz/weekly_matchup_discussion_13_viktor_vs_anivia/ - patch 6.20",
        "annie": "https://www.reddit.com/r/viktormains/comments/5z1tsn/weekly_matchup_discussion_27_viktor_vs_annie/ - patch 7.5",

        "aurelion": "https://www.reddit.com/r/viktormains/comments/64hgp7/weekly_matchup_discussion_30_viktor_vs_aurelion/ - patch 7.7",
        "aurelion sol": "https://www.reddit.com/r/viktormains/comments/64hgp7/weekly_matchup_discussion_30_viktor_vs_aurelion/ - patch 7.7",
        "asol": "https://www.reddit.com/r/viktormains/comments/64hgp7/weekly_matchup_discussion_30_viktor_vs_aurelion/ - patch 7.7",
        "ao shin": "https://www.reddit.com/r/viktormains/comments/64hgp7/weekly_matchup_discussion_30_viktor_vs_aurelion/ - patch 7.7",
        "aoshin": "https://www.reddit.com/r/viktormains/comments/64hgp7/weekly_matchup_discussion_30_viktor_vs_aurelion/ - patch 7.7",

        "azir": "https://www.reddit.com/r/viktormains/comments/4n9zim/weekly_matchup_discussion_4_viktor_vs_azir/ - patch 6.11",
        "brand": "https://www.reddit.com/r/viktormains/comments/5age0w/weekly_matchup_discussion_15_viktor_vs_brand/ - patch 6.21",
        "cassiopeia": "https://www.reddit.com/r/viktormains/comments/58vglf/weekly_matchup_discussion_14_viktor_vs_cassiopeia/ - patch 6.21",
        "corki": "https://www.reddit.com/r/viktormains/comments/5wyrzo/weekly_matchup_discussion_26_viktor_vs_corki/ - patch 7.4",
        "diana": "https://www.reddit.com/r/viktormains/comments/696sgt/weekly_matchup_discussion_33_viktor_vs_diana/ - patch 7.8",
        "ekko": "https://www.reddit.com/r/viktormains/comments/5ghrj9/weekly_matchup_discussion_18_viktor_vs_ekko/ - patch 6.23",
        "fizz": "https://www.reddit.com/r/viktormains/comments/5hzr7p/weekly_matchup_discussion_19_viktor_vs_fizz/ - patch 6.24",

        "gangplank": "https://www.reddit.com/r/viktormains/comments/5qvxtj/weekly_matchup_discussion_23_viktor_vs_gangplank/ - patch 7.2",
        "gp": "https://www.reddit.com/r/viktormains/comments/5qvxtj/weekly_matchup_discussion_23_viktor_vs_gangplank/ - patch 7.2",

        "jayce": "https://www.reddit.com/r/viktormains/comments/6bd5yt/weekly_matchup_discussion_34_viktor_vs_jayce/ - patch 7.9",

        "katarina": "https://www.reddit.com/r/viktormains/comments/5uzaqu/weekly_matchup_discussion_25_viktor_vs_katarina_2/ - patch 7.3",
        "kata": "https://www.reddit.com/r/viktormains/comments/5uzaqu/weekly_matchup_discussion_25_viktor_vs_katarina_2/ - patch 7.3",

        "leblanc": "https://www.reddit.com/r/viktormains/comments/5o0qs8/weekly_matchup_discussion_21_viktor_vs_leblanc/ - patch 7.1",
        "lb": "https://www.reddit.com/r/viktormains/comments/5o0qs8/weekly_matchup_discussion_21_viktor_vs_leblanc/ - patch 7.1",

        "lux": "https://www.reddit.com/r/viktormains/comments/4slxkv/weekly_matchup_discussion_8_viktor_vs_lux/ - patch 6.13",
        "orianna": "https://www.reddit.com/r/viktormains/comments/51bu9v/weekly_matchup_discussion_11_viktor_vs_orianna/ - patch 6.17",
        "ryze": "https://www.reddit.com/r/viktormains/comments/5jb7li/weekly_matchup_discussion_20_viktor_vs_ryze/ - patch 6.24",
        "syndra": "https://www.reddit.com/r/viktormains/comments/4vi9nw/weekly_matchup_discussion_9_viktor_vs_syndra/ - patch 6.15",
        "taliyah": "https://www.reddit.com/r/viktormains/comments/5pmxq6/weekly_matchup_discussion_21_viktor_vs_taliyah/ - patch 7.1",
        "talon": "https://www.reddit.com/r/viktormains/comments/5srelp/weekly_matchup_discussion_24_viktor_vs_talon/ - patch 7.2",

        "twistedfate": "https://www.reddit.com/r/viktormains/comments/4oes5m/weekly_matchup_discussion_5_viktor_vs_twisted_fate/ - patch 6.12",
        "tf": "https://www.reddit.com/r/viktormains/comments/4oes5m/weekly_matchup_discussion_5_viktor_vs_twisted_fate/ - patch 6.12",
        "twisted fate": "https://www.reddit.com/r/viktormains/comments/4oes5m/weekly_matchup_discussion_5_viktor_vs_twisted_fate/ - patch 6.12",

        "veigar": "https://www.reddit.com/r/viktormains/comments/5bmlxc/weekly_matchup_discussion_16_viktor_vs_veigar/ - patch 6.21",

        "velkoz": "https://www.reddit.com/r/viktormains/comments/53vaa6/weekly_matchup_discussion_12_viktor_vs_velkoz/ - patch 6.17",
        "vk": "https://www.reddit.com/r/viktormains/comments/53vaa6/weekly_matchup_discussion_12_viktor_vs_velkoz/ - patch 6.17",
        "vel'koz": "https://www.reddit.com/r/viktormains/comments/53vaa6/weekly_matchup_discussion_12_viktor_vs_velkoz/ - patch 6.17",

        "vlad": "https://www.reddit.com/r/viktormains/comments/67onps/weekly_matchup_discussion_32_viktor_vs_vladimir/ - patch 7.8",
        "vladimir": "https://www.reddit.com/r/viktormains/comments/67onps/weekly_matchup_discussion_32_viktor_vs_vladimir/ - patch 7.8",

        "xerath": "https://www.reddit.com/r/viktormains/comments/61nzof/weekly_matchup_discussion_29_viktor_vs_xerath/ - patch 7.6.",
        "yasuo": "https://www.reddit.com/r/viktormains/comments/4m9ydy/weekly_matchup_discussion_3_viktor_vs_yasuo/ - patch 6.11",
        "zed": "https://www.reddit.com/r/viktormains/comments/4rc76d/weekly_matchup_discussion_7_viktor_vs_zed/ - patch 6.13",
        "ziggs": "https://www.reddit.com/r/viktormains/comments/60flq2/weekly_matchup_discussion_28_viktor_vs_ziggs/ - patch 7.5",
        "zyra": "https://www.reddit.com/r/viktormains/comments/4q0r3f/weekly_matchup_discussion_6_viktor_vs_zyra/ - patch 6.12",
        "asshole": "https://www.reddit.com/r/viktormains/comments/6bd5yt/weekly_matchup_discussion_34_viktor_vs_jayce/ - patch 7.9"
    }
};