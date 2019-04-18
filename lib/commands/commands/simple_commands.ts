import Discord from "discord.js";

export const rito = (msg:Discord.Message) => {
    const rito = `
    :white_sun_small_cloud:
                  <:rito:323416307414335488>
                     |:open_hands:
                    / _
    ━━━━━┓ ＼＼
    ┓┓┓┓┓┃
    ┓┓┓┓┓┃ ヽ<:viktor:232941841815830536>ノ
    ┓┓┓┓┓┃      /
    ┓┓┓┓┓┃  ノ)
    ┓┓┓┓┓┃
    ┓┓┓┓┓┃
    `;
    msg.channel.send(rito);
}