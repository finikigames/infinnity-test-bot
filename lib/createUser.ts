import {IGame, IUser} from './deathline';
import {clone} from './clone';

export function createUser(game: IGame, ctx: IContextUpdate): IUser {
    return {
        state: clone(game.state),
        currentId: game.start,
        userName: ctx.from.username,
        displayName: `${ctx.update.message.from.last_name} ${ctx.update.message.from.first_name}`
    };
}