import { cuePrefix } from './constants';
import {ICue} from './deathline';

const ELEMENT_NOT_FOUND = -1;

export function extractCueId(ctx: IContextUpdate): [string, number] {
    const cueChoice = ctx.update.callback_query.data.replace(cuePrefix, '');
    const [cue, choice] = cueChoice.split('::');

    return [cue, Number.parseInt(choice, 10)];
}

export function extractCueIdFromMessage(currentCue: ICue, ctx: IContextMessage): number {
    const cueChoice = ctx.message.text.replace(cuePrefix, '');

    if (!currentCue.choices) { return NaN; }
    const index = currentCue.choices.findIndex((cue) => cue.label === cueChoice);

    return index !== ELEMENT_NOT_FOUND ? index : NaN;
}