// tslint:disable: no-console
import React from 'react';
import { render } from '@testing-library/react';

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

describe('SSIFragment Component', () => {
  let consoleError;

  beforeEach(() => {
    consoleError = console.error;
    console.error = () => 'error';
  });

  afterEach(() => {
    console.error = consoleError;
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
});
