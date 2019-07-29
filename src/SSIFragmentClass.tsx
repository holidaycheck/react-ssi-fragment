import React from 'react';
import { ownFetch, getInitialHtml, createSSITag, isFallbackNecessary, remountScripts } from './utils';
import { SSIFragmentProps, SSIFragmentState } from './types';

export class SSIFragmentClass extends React.PureComponent<SSIFragmentProps, SSIFragmentState> {
  private initialHtml = '';

  constructor(props: SSIFragmentProps) {
    super(props);

    const { id, url } = props;

    this.state = { fallbackHtml: '' };
    this.initialHtml = getInitialHtml(id, createSSITag(url), props.isOnClient);
  }

  public componentDidMount() {
    if (isFallbackNecessary(this.props.url, this.initialHtml)) {
      this.fetchFallbackHtml();
    }
  }

  public render() {
    const { initialHtml } = this;
    const { id, url, isOnClient } = this.props;
    const { fallbackHtml } = this.state;

    const content = isFallbackNecessary(url, initialHtml) && isOnClient ? fallbackHtml : initialHtml;

    return (
      <div
        id={id}
        dangerouslySetInnerHTML={{
          __html: content,
        }}
        suppressHydrationWarning={true}
      />
    );
  }

  private fetchFallbackHtml() {
    const { id, url } = this.props;

    // tslint:disable-next-line: no-console
    console.error(
      `Server Side Include of fragment ${id} with url ${url} did not work, falling back to client side include.`,
    );

    ownFetch(url)
      .then(
        fallbackHtml =>
          new Promise(resolve => {
            this.setState({ fallbackHtml: fallbackHtml as string }, resolve);
          }),
      )
      .then(() => remountScripts(id))
      // tslint:disable-next-line: no-console
      .catch(error => console.error(`Failed to mount fragment fallback for ${id}`, error));
  }
}
