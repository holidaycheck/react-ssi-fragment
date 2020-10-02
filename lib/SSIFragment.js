"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSIFragment = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var utils_1 = require("./utils");
var fetchFallbackHtml = function (id, url, setFallbackHtml, onReady) {
    // tslint:disable-next-line: no-console
    console.error("Server Side Include of fragment " + id + " with url " + url + " did not work, falling back to client side include.");
    utils_1.ownFetch(url)
        .then(function (fallbackHtml) {
        return new Promise(function (resolve) {
            setFallbackHtml(fallbackHtml);
            if (typeof onReady !== 'undefined') {
                onReady();
            }
            resolve();
        });
    })
        // tslint:disable-next-line: no-console
        .catch(function (error) { return console.error("Failed to mount fragment fallback for " + id, error); });
};
exports.SSIFragment = function (props) {
    var _a = tslib_1.__read(react_1.useState(''), 2), fallbackHtml = _a[0], setFallbackHtml = _a[1];
    var initialHtml = utils_1.getInitialHtml(props.id, utils_1.createSSITag(props.url), props.isOnClient);
    react_1.useEffect(function () {
        if (utils_1.isFallbackNecessary(props.url, initialHtml) && props.isOnClient && fallbackHtml === '') {
            fetchFallbackHtml(props.id, props.url, setFallbackHtml, props.onReady);
        }
        else if (typeof props.onReady !== 'undefined') {
            props.onReady();
        }
        if (fallbackHtml !== '') {
            utils_1.remountScripts(props.id);
        }
    }, [fallbackHtml]);
    var content = utils_1.isFallbackNecessary(props.url, initialHtml) && props.isOnClient ? fallbackHtml : initialHtml;
    return (react_1.default.createElement("div", { id: props.id, dangerouslySetInnerHTML: {
            __html: content,
        }, suppressHydrationWarning: true }));
};
