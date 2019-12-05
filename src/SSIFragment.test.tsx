// tslint:disable: no-console
import React from 'react';
import { render, cleanup } from '@testing-library/react';

import { SSIFragment } from './SSIFragment';

const createXHR = () => {
  return {
    open: jest.fn(),
    send: jest.fn(),
  };
};

const createGetElementById = () => jest.fn().mockReturnValue(undefined);

const mockWindow = (xhr, getElementById = createGetElementById()) => {
  (window as any).XMLHttpRequest = jest.fn().mockImplementation(() => xhr);
  Object.defineProperty(window.document, 'getElementById', { writable: true, value: getElementById });
};

const unMockWindow = (initialXhr, initialGetElementById) => {
  (window as any).XMLHttpRequest = initialXhr;
  Object.defineProperty(window.document, 'getElementById', { writable: true, value: initialGetElementById });
};

describe('SSIFragment Component', () => {
  const initialGetElementById = window.document.getElementById;
  const initialXhr = window.XMLHttpRequest;
  let consoleError;

  beforeEach(() => {
    consoleError = console.error;
    console.error = () => 'error';
  });

  afterEach(() => {
    cleanup();
    console.error = consoleError;
    unMockWindow(initialXhr, initialGetElementById);
  });

  it('should render the SSI', () => {
    const fragment = render(<SSIFragment id="the-id" url="/the-url" />);
    const containerWithId = fragment.container.querySelector('#the-id');
    expect(containerWithId).not.toBeNull();
    expect(containerWithId.innerHTML).toEqual('<!--#include virtual="/the-url" -->');
  });

  it('should keep the content which is already there', () => {
    const xhr = createXHR();
    const getElementById = jest.fn().mockReturnValueOnce({ innerHTML: 'foo' });
    mockWindow(xhr, getElementById);
    const fragment = render(<SSIFragment id="the-id" url="/the-url" isOnClient={true} />);
    const containerWithId = fragment.container.querySelector('#the-id');

    expect(containerWithId.innerHTML).toBe('foo');
    expect(xhr.open).not.toHaveBeenCalled();
  });

  it('should fetch the url on the client when SSI did not happen', done => {
    const xhr = createXHR();
    mockWindow(xhr);

    const { container, rerender } = render(<SSIFragment id="the-id" url="/the-url" isOnClient={true} />);
    const containerWithId = container.querySelector('#the-id');

    expect(xhr.open).toHaveBeenCalledWith('GET', '/the-url');
    expect(xhr.send).toHaveBeenCalledTimes(1);

    (xhr as any).status = 200;
    (xhr as any).response = '<div>Foo</div>';
    (xhr as any).onload();

    rerender(<SSIFragment id="the-id" url="/the-url" isOnClient={true} />);

    return new Promise(setImmediate).then(() => {
      expect(containerWithId.innerHTML).toBe((xhr as any).response);
      done();
    });
  });

  it('should render nothing when fetching the url on the client fails ', () => {
    const xhr = createXHR();
    mockWindow(xhr);

    const { container, rerender } = render(<SSIFragment id="the-id" url="/the-url" isOnClient={true} />);
    const containerWithId = container.querySelector('#the-id');

    (xhr as any).status = 500;
    (xhr as any).onerror();
    rerender(<SSIFragment id="the-id" url="/the-url" isOnClient={true} />);

    return new Promise(setImmediate).then(() => {
      expect(containerWithId.innerHTML).toBe('');
    });
  });

  it('should call the onReady callback of the SSI', () => {
    const onReady = jest.fn();
    const xhr = createXHR();
    const getElementById = jest.fn().mockReturnValueOnce({ innerHTML: 'foo' });
    mockWindow(xhr, getElementById);
    render(<SSIFragment id="the-id" url="/the-url" isOnClient={true} onReady={onReady} />);

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('should call the onReady callback after fetching the html fallback', done => {
    const onReady = jest.fn();
    const xhr = createXHR();
    mockWindow(xhr);

    const { container } = render(<SSIFragment id="the-id" url="/the-url" isOnClient={true} onReady={onReady} />);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          id="the-id"
        />
      </div>
    `);

    (xhr as any).status = 200;
    (xhr as any).response = '<div>Foo</div>';
    (xhr as any).onload();

    return new Promise(setImmediate).then(() => {
      expect(onReady).toHaveBeenCalled();
      done();
    });
  });
});
