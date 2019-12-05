import React from 'react';
export interface SSIFragmentProps {
  isOnClient?: boolean;
  id: string;
  url: string;
  onReady?: () => void;
}

export declare const SSIFragment: React.FunctionComponent<SSIFragmentProps>;
