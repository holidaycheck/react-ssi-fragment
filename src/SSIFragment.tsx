import React, { useState, useEffect } from 'react';

interface SSIFragmentProps {
  isOnClient?: boolean;
  id: string;
  url: string;
}

const createSSITag = (url: string) => `<!--#include virtual="${url}" -->`;

const getInitialHtml = (id: string, defaultHtml: string, isOnClient?: boolean): string => {
  if (isOnClient && window) {
    const element = window.document.getElementById(id);

    return element ? element.innerHTML : defaultHtml;
  }

  return defaultHtml;
};

const fetch = (url: string) => {
  return new Promise((resolve, reject) => {
    const xhr = new (window as any).XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error(`Failed to load ${url}. Got status ${xhr.status}.`));
    xhr.send();
  });
};

const isFallbackNecessary = (url: string, initialHtml: string) => createSSITag(url) === initialHtml;

const remountScripts = (id: string) => {
  const document = window.document;
  if (document) {
    const element = document.getElementById(id);
    if (element) {
      element.querySelectorAll('script').forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
      });
    }
  }
};

const fetchFallbackHtml = (id: string, url: string, setFallbackHtml: React.Dispatch<string>) => {
  // tslint:disable-next-line: no-console
  console.error(
    `Server Side Include of fragment ${id} with url ${url} did not work, falling back to client side include.`,
  );

  fetch(url)
    .then(
      fallbackHtml =>
        new Promise(resolve => {
          setFallbackHtml(fallbackHtml as string);
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
      fetchFallbackHtml(props.id, props.url, setFallbackHtml);
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
