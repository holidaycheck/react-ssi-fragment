"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remountScripts = exports.isFallbackNecessary = exports.ownFetch = exports.getInitialHtml = exports.createSSITag = void 0;
exports.createSSITag = function (url) { return "<!--#include virtual=\"" + url + "\" -->"; };
exports.getInitialHtml = function (id, defaultHtml, isOnClient) {
    if (isOnClient && window) {
        var element = window.document.getElementById(id);
        return element ? element.innerHTML : defaultHtml;
    }
    return defaultHtml;
};
exports.ownFetch = function (url) {
    var basicAuthHeader;
    try {
        var _a = new URL(url), origin_1 = _a.origin, username = _a.username, password = _a.password, pathname = _a.pathname;
        if (username && password) {
            url = "" + origin_1 + pathname;
            basicAuthHeader = { key: 'Authorization', value: 'Basic ' + btoa(username + ':' + password) };
        }
    }
    catch (_b) { }
    return new Promise(function (resolve, reject) {
        var xhr = new window.XMLHttpRequest();
        xhr.open('GET', url);
        if (basicAuthHeader)
            xhr.setRequestHeader(basicAuthHeader.key, basicAuthHeader.value);
        xhr.onload = function () { return resolve(xhr.response); };
        xhr.onerror = function () { return reject(new Error("Failed to load " + url + ". Got status " + xhr.status + ".")); };
        xhr.send();
    });
};
exports.isFallbackNecessary = function (url, initialHtml) { return exports.createSSITag(url) === initialHtml; };
exports.remountScripts = function (id) {
    var document = window.document;
    if (document) {
        var element = document.getElementById(id);
        if (element) {
            Array.prototype.slice.call(element.querySelectorAll('script'), 0).forEach(function (script) {
                var newScript = document.createElement('script');
                if (script.src) {
                    if (script.getAttribute('type')) {
                        newScript.setAttribute('type', script.getAttribute('type') || '');
                    }
                    if (script.getAttribute('nomodule') !== null) {
                        newScript.setAttribute('nomodule', script.getAttribute('nomodule') || '');
                    }
                    newScript.src = script.src;
                }
                else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });
        }
    }
};
