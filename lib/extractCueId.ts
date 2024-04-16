import { cuePrefix } from './constants';

export function extractCueId(ctx: IContextUpdate): [string, number] {
    const cueChoice = ctx.update.callback_query.data.replace(cuePrefix, '');
    const [cue, choice] = cueChoice.split('::');

    return [cue, Number.parseInt(choice, 10)];
}

export function extractCueIdFromMessage(ctx: IContextMessage): [string, number] {
    const cueChoice = ctx.message.text.replace(cuePrefix, '');
    const [cue, choice] = cueChoice.split('::');

    return [cue, Number.parseInt(choice, 10)];
}