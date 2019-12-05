import React, { useState, useEffect } from 'react';
import { ownFetch, getInitialHtml, createSSITag, isFallbackNecessary, remountScripts } from './utils';
import { SSIFragmentProps } from './types';

const fetchFallbackHtml = (id: string, url: string, setFallbackHtml: React.Dispatch<string>, onReady?: () => void) => {
  // tslint:disable-next-line: no-console
  console.error(
    `Server Side Include of fragment ${id} with url ${url} did not work, falling back to client side include.`,
  );

  ownFetch(url)
    .then(
      fallbackHtml =>
        new Promise(resolve => {
          setFallbackHtml(fallbackHtml as string);
          if (typeof onReady !== 'undefined') {
            onReady();
            // tslint:disable-next-line: no-console
            console.log('onReady was fired after htmlFallback');
          }
          resolve();
        }),
    )
    // tslint:disable-next-line: no-console
    .catch(error => console.error(`Failed to mount fragment fallback for ${id}`, error));
};

export const SSIFragment = (props: SSIFragmentProps) => {
  const [fallbackHtml, setFallbackHtml] = useState('');
  const initialHtml = getInitialHtml(props.id, createSSITag(props.url), props.isOnClient);

  useEffect(() => {
    if (isFallbackNecessary(props.url, initialHtml) && props.isOnClient && fallbackHtml === '') {
      fetchFallbackHtml(props.id, props.url, setFallbackHtml, props.onReady);
    } else if (typeof props.onReady !== 'undefined') {
      props.onReady();
      // tslint:disable-next-line: no-console
      console.log('onReady was fired after nonFallback mount');
    }
    if (fallbackHtml !== '') {
      remountScripts(props.id);
    }
  }, [fallbackHtml]);

  const content = isFallbackNecessary(props.url, initialHtml) && props.isOnClient ? fallbackHtml : initialHtml;

  return (
    <div
      id={props.id}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
      suppressHydrationWarning={true}
    />
  );
};
