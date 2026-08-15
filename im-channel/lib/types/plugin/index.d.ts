import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { ChannelKind } from '../core/channel.ts';
export declare const name = "im-channel";
export declare const inject: string[];
/** One user-declared channel instance; key in the dict is the instance name. */
export interface ChannelInstanceConfig {
    kind: ChannelKind;
    enabled: boolean;
    displayName?: string;
}
/** Resolved section shape persisted to ~/.dsh/settings.yaml under `im-channel:`. */
export interface ImChannelSection {
    channels: Record<string, ChannelInstanceConfig>;
    commandPrefix: string;
}
export declare const Config: z<ImChannelSection>;
export declare function apply(ctx: Context, config: ImChannelSection): void;
