import {dirname, isAbsolute, resolve} from 'path';
import {stat as _stat} from 'fs';
import {promisify} from 'util';
import {IGame} from './deathline';
import * as fs from 'fs';

const stat = promisify(_stat);

interface IUrl {
    src: string;
}
interface ISource {
    source: string;
}

interface IFileSource {
    source: Buffer;
}

export interface IImage {
    source: string;
    caption: string;
    type: string;
}

interface IImageSource {
    media: IFileSource;
    caption: string;
    type: string;
}

// tslint:disable-next-line:max-classes-per-file
class NotAFileError extends Error {
    constructor(path: string) {
        super(path);
        this.message = `Path '%{path}' doesn't point to a file (most probably directory)`;
        this.name = 'NotAFileError';
    }
}

// tslint:disable-next-line:max-classes-per-file
class AbsolutePathError extends Error {
    constructor(path: string) {
        super(path);
        this.message = `Absolute paths are not allowed: '${path}'`;
        this.name = 'AbsolutePathError';
    }
}

// tslint:disable-next-line:max-classes-per-file
export class MediaRenderer {
    private pathsCache: Map<string, ISource> = new Map();

    private gameDir: string;

    constructor(game: IGame) {
        this.gameDir = dirname(game.gameFile);
    }

    private isUrl(media: string): boolean {
        return media.startsWith('http://') || media.startsWith('https://');
    }

    private resolvePath(media: string): string {
        return resolve(this.gameDir, media);
    }

    private async resolveResource(media: string): Promise<ISource> {
        if (this.isUrl(media)) {
            return {
                source: media,
            };
        } else {
            if (isAbsolute(media)) {
                throw new AbsolutePathError(media);
            } else {
                const mediaPath = this.resolvePath(media);
                const stats = await stat(mediaPath);

                if (stats.isFile()) {
                    return {
                        source: mediaPath,
                    };
                } else {
                    throw new NotAFileError(mediaPath);
                }
            }
        }
    }

    private async get(media: string): Promise<ISource> {
        const options = await this.resolveResource(media);

        //this.pathsCache.set(media, options);

        return options;
    }

    public async renderMedia(media: string): Promise<ISource> {
        /*if (this.pathsCache.has(media)) {
            const options = this.pathsCache.get(media);
            if (options instanceof Error) {
                throw options;
            } else if (options !== undefined) {
                return options;
            } else {
                return await this.get(media);
            }
        } else {*/
            return await this.get(media);
        //}
    }

    private async loadImageToBuffer(filePath: ISource): Promise<Buffer> {
        return new Promise<Buffer>((resolver, reject) => {
            fs.readFile(filePath.source, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolver(data);
                }
            });
        });
    }

    public async renderMedias(medias: IImage[]): Promise<IImageSource[]> {
        /*if (this.pathsCache.has(media)) {
            const options = this.pathsCache.get(media);
            if (options instanceof Error) {
                throw options;
            } else if (options !== undefined) {
                return options;
            } else {
                return await this.get(media);
            }
        } else {*/
        //}

        return await Promise.all(medias.map(async (rawImage) => {
            const source = await this.get(rawImage.source);

            const imageBuffer = await this.loadImageToBuffer(source);
            const fileSource: IFileSource = {
                source: imageBuffer,
            };

            return {
                media: fileSource,
                caption: rawImage.caption,
                type: 'photo',
            };
        }));
    }
}