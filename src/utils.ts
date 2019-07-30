export const createSSITag = (url: string) => `<!--#include virtual="${url}" -->`;

export const getInitialHtml = (id: string, defaultHtml: string, isOnClient?: boolean): string => {
  if (isOnClient && window) {
    const element = window.document.getElementById(id);

    return element ? element.innerHTML : defaultHtml;
  }

  return defaultHtml;
};

export const ownFetch = (url: string) => {
  return new Promise((resolve, reject) => {
    const xhr = new (window as any).XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error(`Failed to load ${url}. Got status ${xhr.status}.`));
    xhr.send();
  });
};

export const isFallbackNecessary = (url: string, initialHtml: string) => createSSITag(url) === initialHtml;

export const remountScripts = (id: string) => {
  const document = window.document;
  if (document) {
    const element = document.getElementById(id);
    if (element) {
      element.querySelectorAll('script').forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          if (script.getAttribute('type')) {
            newScript.setAttribute('type', script.getAttribute('type') || '');
          }
          if (script.getAttribute('noModule')) {
            newScript.setAttribute('noModule', script.getAttribute('noModule') || '');
          }
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
      });
    }
  }
};
