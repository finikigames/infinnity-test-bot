import { IGame, IUser, TCue} from './deathline';
import { IReply, TextRenderer } from './TextRenderer';
import { TContext } from './extendContext';
import { MediaRenderer } from './MediaRenderer';
import {Extra} from 'telegraf';

export class DeathlineContext {
    private tgBot: Telegraf;
    private game: IGame;
    private textRenderer: TextRenderer;
    private mediaRenderer: MediaRenderer;

    constructor(tgBot: Telegraf, game: IGame, textRenderer: TextRenderer, mediaRenderer: MediaRenderer) {
        this.tgBot = tgBot;
        this.game = game;
        this.textRenderer = textRenderer;
        this.mediaRenderer = mediaRenderer;
    }

    public getUser(ctx: TContext): IUser {
        const username = ctx.from.username;
        const user = ctx.session[username];

        return user;
    }

    public getCue(ctx: TContext, cueId?: string): TCue {
        const user = this.getUser(ctx);
        if (user === undefined) {
            return this.game.cues['test:1'];
        }

        return this.game.cues[cueId || this.getUser(ctx).currentId];
    }

    public reply(ctx: TContext, reply: IReply) {
        if (reply.img) {
            return this.mediaRenderer.renderMedia(reply.img).then((options) => {
                return ctx.replyWithPhoto(options, {
                    caption: reply.message,
                    ...reply.buttons,
                });
            }).catch((e) => {
                console.error(e);

                return ctx.reply('Bad image', reply.buttons);
            });
        } else if (reply.audio) {
            return this.mediaRenderer.renderMedia(reply.audio).then((options) => {
                return ctx.replyWithAudio(options, {
                    caption: reply.message,
                    ...reply.buttons,
                });
            }).catch((e) => {
                console.error(e);

                return ctx.reply('Bad audio', reply.buttons);
            });
        } else if (reply.video) {
            return this.mediaRenderer.renderMedia(reply.video).then((options) => {
                return ctx.replyWithVideo(options, {
                    caption: reply.message,
                    ...reply.buttons,
                });
            }).catch((e) => {
                console.error(e);

                return ctx.reply('Bad video, reply.buttons', reply.buttons);
            });
        } else if (reply.images) {
            return this.mediaRenderer.renderMedias(reply.images).then((options) => {
                ctx.replyWithMediaGroup(options);

                return ctx.replyWithMarkdown(reply.message, reply.buttons);
            }).catch((e) => {
                console.error(e);

                return ctx.reply('Bad images, reply.buttons', reply.buttons);
            });
        } else {
            if (this.game.settings.markdown) {
                if (!reply.buttons) {
                    const text = Extra.markup((markup: any) => markup.removeKeyboard());

                    return ctx.replyWithMarkdown(reply.message, text);
                }

                return ctx.replyWithMarkdown(reply.message, reply.buttons);
            } else {
                return ctx.replyWithHTML(reply.message, reply.buttons);
            }
        }
    }

    public help(ctx: TContext, user: IUser) {
        this.game.state.

        return (this.game.settings.markdown ? ctx.replyWithMarkdown : ctx.replyWithHTML)(this.textRenderer.help(user.state || this.game.state));
    }
}