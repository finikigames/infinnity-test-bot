import dotenv = require('dotenv');
import { IReply, TextRenderer } from './lib/TextRenderer';
import { MediaRenderer } from './lib/MediaRenderer';
import { createBot } from './lib/createBot';
import { loadGame } from './lib/loadGame';
import { IUser, ITransition } from './lib/deathline';
import { TimeOutManager } from './lib/TimeOutManager';
import {extractCueId, extractCueIdFromMessage} from './lib/extractCueId';
import { getChoice } from './lib/getChoice';
import { createUser } from './lib/createUser';
import { cuePrefix } from './lib/constants';
import { applySetter } from './lib/applySetter';
import { extendContext, TContext } from './lib/extendContext';

dotenv.config();

const bot = createBot(process.env.BOT_TOKEN as string, 'game_db.json');

loadGame(process.env.GAME_NAME).then((game) => {
    const timeOutManager = new TimeOutManager();
    const textRenderer = new TextRenderer(game);
    const mediaRenderer = new MediaRenderer(game);
    extendContext(bot, game, textRenderer, mediaRenderer);

    bot.catch((err) => {
        console.log('Ooops', err);
    });

    bot.command('/help', (ctx) => {
        //return ctx.deathline.help(ctx);
    });

    bot.action('/restart', restart);
    bot.command('/restart', restart);

    bot.command('/start', (ctx) => {
        const username = ctx.from.username;

        if (!ctx.session[username]) {
            ctx.session[username] = createUser(game, ctx);
        }

        const transition: ITransition = {
            id: game.start,
        };

        return transitionTo(transition, ctx.session[username])
            .then(replyResolver(ctx));
    });

    bot.on('text', async (ctx) => {
        const user = ctx.deathline.getUser(ctx);
        const currentCue = ctx.deathline.getCue(ctx);

        if (currentCue.waitForInput) {
            const transition = currentCue.waitForInput;

            if (transition) {
                // clear idle timeout
                if (user !== undefined && user.timeout) {
                    timeOutManager.clear(user.timeout);
                }

                return transitionTo(transition, user, ctx.message.text)
                    .then(replyResolver(ctx));
            } else {
                console.error(`Invalid transition to ${currentCue.waitForInput.id}`);
            }
        }

        if (!game.settings.inlineKeyboard || !currentCue.inlineKeyboard) {
            const choice = extractCueIdFromMessage(currentCue, ctx);
            const transition = getChoice(currentCue, choice);

            if (transition) {
                // clear idle timeout
                if (user !== undefined && user.timeout) {
                    timeOutManager.clear(user.timeout);
                }

                return transitionTo(transition, user, undefined)
                    .then(replyResolver(ctx));
            } else {
                console.error(`Invalid transition to ${currentCue}`);
            }
        }
    });

    function replyResolver(ctx: TContext) {
        return function (reply: IReply) {
            if (reply.auto) {
                reply.auto.then(replyResolver(ctx));
            }

            return ctx.deathline.reply(ctx, reply);
        };
    }

    function restart(ctx: IContextUpdate) {
        const username = ctx.from.username;
        ctx.session[username] = createUser(game, ctx);

        const transition = {
            id: game.start,
        };

        return transitionTo(transition, ctx.session[username])
            .then(replyResolver(ctx));
    }

    function transitionTo(transition: ITransition, user: IUser, setValue?: string): Promise<IReply> {
        const targetCue = game.cues[transition.id];

        if (user === undefined) { return Promise.reject('Cant'); }
        if (transition.setter) {
            user.state = applySetter(user, transition.setter, setValue);
        }

        const reply = textRenderer.cue(targetCue, user.state, transition.id);

        user.currentId = transition.id;

        if (targetCue.autoTransition) {
            reply.auto = handleAutoTransition(targetCue.autoTransition, user);
        }

        return timeOutManager.promise(() => reply, transition.delay);
    }

    function handleAutoTransition(transition: ITransition, user: IUser): Promise<IReply> {
        return timeOutManager.promise<IReply>(
            () => transitionTo(transition, user),
            transition.delay
        );
    }

    bot.action(cuePrefix, async (ctx) => {
        const user = ctx.deathline.getUser(ctx);
        const currentCue = ctx.deathline.getCue(ctx);
        const [cue, choice] = extractCueId(ctx);
        const transition = getChoice(currentCue, choice);

        if (transition) {
            // clear idle timeout
            if (user !== undefined && user.timeout) {
                timeOutManager.clear(user.timeout);
            }

            return transitionTo(transition, user)
                .then(replyResolver(ctx));
        } else {
            console.error(`Invalid transition to ${cue}`);
        }
    });

    bot.startPolling();
    console.log('Bot started polling');
}).catch((e) => console.error(e));