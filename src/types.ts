import React from 'react';
export interface SSIFragmentProps {
  isOnClient?: boolean;
  id: string;
  url: string;
}

export interface SSIFragmentState {
  fallbackHtml: string;
}

export declare const SSIFragment: (props: SSIFragmentProps) => JSX.Element;

export declare class SSIFragmentClass extends React.PureComponent<SSIFragmentProps, SSIFragmentState> {
  private initialHtml;
  private fetchFallbackHtml;
  constructor(props: SSIFragmentProps);
  public componentDidMount(): void;
  public render(): JSX.Element;
}
