/* eslint-disable sonarjs/cognitive-complexity */
'use client';

import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

import { IYKRefResponse as IYKReferenceResponse } from '../../hooks/useIYKRef';
import { POAPMetadata } from '../../hooks/usePOAPData';
import { Creeper } from './Creeper';
import { SHOW_POAP_ANYWAYS } from './settings';
import { ClaimError } from './stages/ClaimError';
import { ExpiredPOAP } from './stages/Expired';
import { MintToProfile } from './stages/MintToProfile';
import { NameInput } from './stages/NameInput';
import { PendingApproval } from './stages/PendingApproval';

// 10 days
const HIDE_AFTER_TIME = 1000 * 60 * 60 * 24 * 100;

const PENDING_APPROVAL = 'pending-approval';
const MINT_TO = 'mint-to';
const NAME_INPUT = 'name-input';
const EXPIRED_STATE = 'expired';
const ERROR_STATE = 'error-state';

const event_names = {
    frensday2023: 'frENSday 2023',
    ethdenver2024: 'ETHDenver 2024',
};

const STORAGE_NAME_KEY = 'ens-page-default-mint';

const LocalStorage =
    // eslint-disable-next-line no-undef
    typeof window !== 'undefined' ? window.localStorage : undefined;

export const POAPModal: FC<{
    data: IYKReferenceResponse;
    name: string;
    metadata: POAPMetadata;
    event: string;
}> = ({ data, name, metadata, event }) => {
    const [dismissed, setDismissed] = useState(false);
    const [hasRendered, setHasRendered] = useState(false);
    const [mintToProfile, setMintToProfile] = useState(
        // eslint-disable-next-line no-undef
        LocalStorage?.getItem(STORAGE_NAME_KEY) || ''
    );
    const [mintToProfileError, setMintToProfileError] = useState<unknown>();

    const [poapEvent] = data.poapEvents;
    const expiry_data = metadata.attributes.find(
        (attribute) => attribute.trait_type == 'endDate'
    );

    const expiry_date = new Date(expiry_data.value).getTime();
    const current_date = Date.now();

    const shouldHideCuzExpired =
        poapEvent.status === 'expired' &&
        expiry_date - current_date + HIDE_AFTER_TIME < 0 &&
        !SHOW_POAP_ANYWAYS;

    const pendingApproval = poapEvent.status === PENDING_APPROVAL;

    const event_name = event_names[event] || 'Unknown Event';

    useEffect(() => {
        setHasRendered(true);
    }, [0]);

    if (dismissed || !hasRendered || shouldHideCuzExpired) return;

    let state = '';

    if (mintToProfileError) {
        state = ERROR_STATE;
    } else {
        if (pendingApproval) {
            state = PENDING_APPROVAL;
        } else {
            if (poapEvent.status == 'expired') {
                state = EXPIRED_STATE;
            } else {
                state = mintToProfile ? MINT_TO : NAME_INPUT;
            }
        }
    }

    return (
        <div className="fixed bottom-0 inset-x-0 px-2 pb-4">
            <div className="w-full max-w-md3 mx-auto">
                <div className="p-6 gap-4 text-center relative flex flex-col items-center card-body">
                    {event == 'frensday2023' && <Creeper />}
                    <div
                        className={clsx(
                            'absolute inset-x-0 bottom-0 top-0 rounded-3xl -z-10 card-bg'
                        )}
                    ></div>
                    <div className="w-full h-8 z-10 relative flex items-center justify-center">
                        <div className="w-28 h-28 bg-slate-100 rounded-full -translate-y-6 shadow-sm">
                            <img
                                src={metadata.image_url}
                                alt=""
                                className="w-28 h-28 object-cover"
                            />
                        </div>
                    </div>
                    <button
                        className="absolute right-4 text-xl opacity-50 p-2 z-20"
                        onClick={() => {
                            setDismissed(true);
                        }}
                    >
                        <FiX />
                    </button>
                    <div className="w-full pt-2">
                        {state === PENDING_APPROVAL && <PendingApproval />}
                        {state === MINT_TO && (
                            <MintToProfile
                                poap_name={name}
                                event_name={event_name}
                                address={mintToProfile}
                                iykData={data}
                                event_slug={event}
                                onCallChange={() => {
                                    setMintToProfile('');
                                    // eslint-disable-next-line no-undef
                                    LocalStorage?.setItem(STORAGE_NAME_KEY, '');
                                }}
                                onCallClose={() => {
                                    setDismissed(true);
                                }}
                                onMintToProfileError={(error) => {
                                    setMintToProfileError(error);
                                }}
                            />
                        )}
                        {state === NAME_INPUT && (
                            <NameInput
                                onSubmit={(name) => {
                                    setMintToProfile(name);
                                    // eslint-disable-next-line no-undef
                                    LocalStorage?.setItem(
                                        STORAGE_NAME_KEY,
                                        name
                                    );
                                }}
                                poap_name={name}
                                event_name={event_name}
                                event_slug={event}
                            />
                        )}
                        {state === EXPIRED_STATE && <ExpiredPOAP />}
                        {state === ERROR_STATE && (
                            <ClaimError
                                data={mintToProfileError}
                                recipient={mintToProfile}
                            />
                        )}
                    </div>
                    {/* {poapEvent.status} */}
                    {/* {JSON.stringify(data)} */}
                    {/* <div className="pt-2 space-y-2">
                        <div className="w-full max-w-xs mx-auto">
                            Claim your POAP to show you met {name} at frENSday!
                        </div>
                        <div className="w-full">
                            <NameInput />
                        </div>
                        M
                    </div> */}
                </div>
            </div>
        </div>
    );
};
