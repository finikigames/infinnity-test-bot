import Telegraf = require('telegraf');
import template = require('lodash.template');

import {IImage} from './MediaRenderer';

import { TemplateExecutor } from 'lodash';
import { IAudioCue, IChoice, TCue, IGame, IImgCue, ITemplateSettings, IUser, TState, IGameSettings, IVideoCue, IMultipleImgCue } from './deathline';
import { restartConfirmation, restartRequest, waitingMessage } from './constants';
import { runSafeExpression } from './safeExpression';
import { IDict } from './IDict';

interface IButton {
    action: string;
    label: string;
}

export interface IReply {
    message: string;
    buttons?: any;
    auto?: Promise<IReply>;
    img?: string;
    audio?: string;
    video?: string;
    images?: IImage[];
}

/**
 * Responsible for all text rendering in game
 */
export class TextRenderer {
    private game: IGame;
    private markupRenderer: Function;

    private templateSettings: ITemplateSettings<RegExp>;
    private templateCache: IDict<TemplateExecutor>;

    private restartRequest: string;
    private restartConfirmation: string;
    private waitingMessage: string;

    constructor(game: IGame) {
        this.game = game;
        const settings = game.settings;

        this.markupRenderer = settings.markdown ? Telegraf.Extra.markdown : Telegraf.Extra.HTML;

        this.initTemplate(settings.templateSettings);

        this.initServiceMessages(settings);
    }

    private initTemplate(templateSettings?: ITemplateSettings<string>): void {
        this.templateSettings = {};

        if (templateSettings) {
            if (templateSettings.escape) {
                this.templateSettings.escape = new RegExp(templateSettings.escape);
            }

            if (templateSettings.evaluate) {
                this.templateSettings.evaluate = new RegExp(templateSettings.evaluate);
            }

            if (templateSettings.interpolate) {
                this.templateSettings.evaluate = new RegExp(templateSettings.interpolate);
            }
        }

        this.templateCache = {};
    }

    private initServiceMessages(settings: IGameSettings) {
        this.restartRequest = settings.restartRequest || restartRequest;
        this.restartConfirmation = settings.restartConfirmation || restartConfirmation;
    }

    private template(str: string, data?: object): string {
        if (!this.templateCache[str]) {
            this.templateCache[str] = template(str, data);
        }

        return this.templateCache[str](data);
    }

    private renderButton(button: IButton, m: any): any[] {
        return [m.callbackButton(button.label, button.action)];
    }

    private choiceLabel(choice: IChoice, state: TState): string {
        return this.template(choice.label, state);
    }

    private choiceAction(cueId: string, index: number): string {
        return `/cue::${cueId}::${index}`;
    }

    private choiceButton(choice: IChoice, state: TState, cueId: string, index: number, markup: any): any { // TODO: reduce amount of args
        return this.renderButton(
            {
                label: this.choiceLabel(choice, state),
                action: this.choiceAction(cueId, index),
            },
            markup
        );
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffledArray = array.slice(); // Создаем копию исходного массива

        // Функция сравнения для перемешивания элементов
        const compareFunction = () => Math.random() - 0.5;

        // Используем функцию сравнения для перемешивания элементов
        shuffledArray.sort(compareFunction);

        return shuffledArray;
    }

    private inlineKeyboard(buttons: IButton[]): any {
        return this.markupRenderer().markup((markup: any) => {
            buttons = this.shuffleArray(buttons);
            const keyboard = buttons.map(
                (button) => this.renderButton(button, markup)
            );

            if (this.game.settings.inlineKeyboard) {
                return markup.inlineKeyboard(keyboard);
            } else {
                return markup.keyboard(keyboard);
            }
        });
    }

    public choices(choices: IChoice[], state: TState, cueId: string): any {
        return this.markupRenderer().markup((markup: any) => {
            const renderButton = (choice: IChoice, index: number) => {
                return this.choiceButton(choice, state, cueId, index, markup);
            };

            let keyboard = choices.reduce<any[]>((buttons, choice, index) => {
                if (this.isChoiceVisible(choice, state)) {
                    buttons.push(renderButton(choice, index));
                }

                return buttons;
            }, []);

            keyboard = this.shuffleArray(keyboard);

            const newCue = this.game.cues[cueId];

            if (newCue.onlyOneButton) {
                keyboard = keyboard.slice(0, 1);
            }

            if (this.game.settings.inlineKeyboard || newCue.inlineKeyboard) {
                markup.removeKeyboard();

                return markup.inlineKeyboard(keyboard);
            } else {
                return markup.keyboard(keyboard);
            }
        });
    }

    private isChoiceVisible(choice: IChoice, state: TState): boolean {
        if (choice.visible !== undefined) {
            const isVisible = runSafeExpression(choice.visible, state);

            return isVisible;
        } else {
            return true;
        }
    }

    private isImgCue(cue: TCue): cue is IImgCue {
        return (<IImgCue>cue).img !== undefined;
    }

    private isMultipleImgCue(cue: TCue): cue is IMultipleImgCue {
        return (<IMultipleImgCue>cue).images !== undefined;
    }

    private isVideoCue(cue: TCue): cue is IVideoCue {
        return (<IVideoCue>cue).video !== undefined;
    }

    private isAudioCue(cue: TCue): cue is IAudioCue {
        return (<IAudioCue>cue).audio !== undefined;
    }

    public cue(cue: TCue, state: TState, id: string): IReply {
        const reply: IReply = {
            message: this.template(cue.text, state),
            buttons: cue.choices ? this.choices(cue.choices, state, id) : null,
        };

        if (this.isImgCue(cue)) {
            reply.img = cue.img;
        } else if (this.isAudioCue(cue)) {
            reply.audio = cue.audio;
        } else if (this.isVideoCue(cue)) {
            reply.video = cue.video;
        } else if (this.isMultipleImgCue(cue)) {
            reply.images = cue.images;
        }

        return reply;
    }

    public help(state: TState): string {
        return this.template(this.game.description, state);
    }

    public restart(user: IUser): IReply {
        const message = this.template(
            this.restartRequest,
            user.state
        );
        const buttons = this.inlineKeyboard([{
            label: this.template(this.restartConfirmation, user.state),
            action: '/restart',
        }]);

        return {
            message,
            buttons,
        };
    }

    public waiting(user: IUser): IReply {
        const message = this.template(
            this.waitingMessage,
            user.state
        );

        return {
            message,
        };
    }
}