import { formatRecord } from '@ens-tools/format';
import { FC } from 'react';
import { ReactNode } from 'react';
import { FaTelegram } from 'react-icons/fa';
import { FiGithub, FiLink, FiTwitter } from 'react-icons/fi';
import shortNumber from 'short-number';

import { EnstateResponse } from '../../hooks/useEnstate';
import { WarpcastResponse } from '../../hooks/useWarpcast';
import { AButton } from '../AButton/button';

const buttonControls = (key: string, value: string): ReactNode | undefined => {
    const formatted = formatRecord(key as any, value);

    if (key == 'com.twitter') {
        return (
            <AButton href={'https://twitter.com/' + formatted}>
                <FiTwitter />
                {formatted || value}
            </AButton>
        );
    }

    if (key == 'url') {
        const { hostname } = new URL(formatted || value);

        return (
            <AButton href={value}>
                <FiLink />
                {hostname}
            </AButton>
        );
    }

    if (key == 'com.github') {
        return (
            <AButton href={'https://github.com/' + (formatted || value)}>
                <FiGithub />
                {formatted || value}
            </AButton>
        );
    }

    if (key == 'org.telegram') {
        return (
            <AButton
                href={'https://t.me/' + (formatted || value).replace(/^@/, '')}
            >
                <FaTelegram />
                {formatted || value}
            </AButton>
        );
    }

    if (key == 'com.discord') {
        // TODO: Discord url: https://discord.com/users/1234567890 <-- userid
        // Can be done once discord implements a way to resolve user ids, or we change the record
    }

    // return <div>Unknown {key}</div>;
};

export const RecordsSection: FC<{
    enstate: EnstateResponse;
    farcaster: WarpcastResponse;
}> = ({ enstate, farcaster }) => {
    return (
        <div className="flex flex-col gap-4">
            {Object.keys(enstate.records)
                .map((key) => buttonControls(key, enstate.records[key]))
                .filter(Boolean)}
            {farcaster && farcaster.result && (
                <AButton
                    href={`https://warpcast.com/${farcaster.result.user.username}`}
                >
                    <img
                        src="/farcaster.svg"
                        alt="warpcaster"
                        style={{ height: '1em', width: '1em' }}
                    ></img>
                    @{farcaster.result.user.username} on farcaster
                    <div className="bg-white/20 text-white px-2 py-1 rounded-md absolute right-2">
                        {shortNumber(farcaster.result.user.followerCount)}
                    </div>
                </AButton>
            )}
            <AButton href={'https://ens.app/' + enstate.name}>
                <div
                    className="bg-white"
                    style={{ height: '1em', width: '1em' }}
                ></div>
                View on ENS App
            </AButton>
        </div>
    );
};
