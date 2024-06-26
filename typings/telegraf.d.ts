// tslint:disable:max-classes-per-file

interface IMessage {
    text: string;
}

interface IUpdate {
    update_id: number;
    callback_query: {
        from: object;
        message: object;
        data: any;
    };
    message: {
        message_id: number;
        from: {
            id: number;
            first_name: string;
            last_name: string;
            is_premium: boolean;
        };
        chat: object;
        date: number;
        text: string;
        entities: object[];
    };
}

interface IContext {
    reply(message: string, opts?: any): void;
    replyWithMarkdown(message: string, opts?: any): void;
    replyWithHTML(message: string, opts?: any): void;
    replyWithPhoto(message: object, opts?: any): void;
    replyWithAudio(message: object, opts?: any): void;
    replyWithVideo(message: object, opts?: any): void;
    replyWithMediaGroup(message: object, opts?: any): void;
    session?: any;
    from: {
        username: string;
    };
    deathline: any;
}

interface IContextMessage extends IContext {
    message: IMessage;
}

interface IContextUpdate extends IContext {
    update: IUpdate;
}

interface IHandler<T extends IContext> {
    (ctx: T): void;
}

declare class Telegraf {
    constructor(token: string, options?: object);

    public command(cmd: string, handler: IHandler<IContextUpdate>): void;
    public hears(msg: string | RegExp, handler: IHandler<IContextMessage>): void;
    public action(msg: string | RegExp, handler: IHandler<IContextUpdate>): void;
    public startPolling(): void;
    public use(...middlware: Function[]): void;
    public catch(erro: (err: any) => void): void;
    public on(msg: string, handler: IHandler<IContextMessage>): void;
    public context: any;
}

declare namespace Telegraf {
    export class Markup {
        public static keyboard(desc: any): any;
    }

    export class Extra {
        public static HTML(): any;
        public static markdown(): any;

        public static markup<T>(markup: ((m: Markup) => T) | T): Extra;
    }
}

declare module 'telegraf' {
    export = Telegraf;
}