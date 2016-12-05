// ==UserScript==
// @name         Youku
// @namespace    https://github.com/sqwwqw5/
// @version      0.1
// @description  kill AD
// @author       jiangyusheng
// @match        http://v.youku.com/*
// @match        http://tv.sohu.com/*
// @match        http://www.le.com/ptv/vplay/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    function run(callback) {
        var script = document.createElement('script');
        script.textContent = '(' + callback.toString() + ')();';
        document.body.appendChild(script);
    }
    function main() {
		urlloader="http://120.25.151.196/player.swf";
	var sohuloader="http://120.25.151.196/sohu/Main.swf";
	console.log(sohuloader);
        var CONSTANTS = {
            PLAYER_DOM: 'object[data],embed[src],iframe[src]',
            PLAYERS: [
                {
                    find: /http:\/\/player\.letvcdn\.com\/.*\LetvPlayer.swf/,
                    replace: "http://code.taobao.org/svn/noadsplayer/trunk/Player/letvcat.swf"
                },
                {
                    find: /http:\/\/static\.youku\.com\/.*q?(player|loader|player_yknpsv)(_taobao)?\.swf/,
                    replace: urlloader
                },
				{
                    find: /http:\/\/tv\.sohu\.com\/upload\/swf\/(.*)\d*\/Main.swf/,
                    replace: sohuloader
                },
                {
                    find: /http:\/\/js\.tudouui\.com\/.*\/PortalPladfgdfyer_49.swf/,
                    replace: 'http://tshao.sinaapp.com/tudou.swf'
                },
                {
                    find: /http:\/\/player\.youku\.com\/player\.php\/sid\/(.*)\//,
                    replace: urlloader+'?VideoIDS=$1'
                },
             
            ],
            SHARE_DOM: '#panel_share input,input#copyInput.txt',
            SHARES: [
                {
					find: /http:\/\/player\.youku\.com\/player\.php\/sid\/(.*)\//,
                    replace: urlloader+'?VideoIDS=$1'
                }
            ],
            NODEINSERTED_HACK: '@-moz-keyframes nodeInserted{from{opacity:0;}to{opacity:1;}}@-webkit-keyframes nodeInserted{from{opacity:0;}to{opacity:1;}}@-o-keyframes nodeInserted{from{opacity:0;}to{opacity:1;}}@keyframes nodeInserted{from{opacity:0;}to{opacity:1;}}embed,object{animation-duration:.001s;-ms-animation-duration:.001s;-moz-animation-duration:.001s;-webkit-animation-duration:.001s;-o-animation-duration:.001s;animation-name:nodeInserted;-ms-animation-name:nodeInserted;-moz-animation-name:nodeInserted;-webkit-animation-name:nodeInserted;-o-animation-name:nodeInserted;}',
            TOGGLE_BTN: '#toggleGoogle'
        };
        var DONE = [];
        var UTIL = {
            addCss: function (str) {
                var style = document.createElement('style');
                style.textContent = str;
                document.head.appendChild(style);
            },
            reloadFlash: function (elem) {
                var nextSibling = elem.nextSibling;
                var parentNode = elem.parentNode;
                parentNode.removeChild(elem);
                if (nextSibling) {
                    parentNode.insertBefore(elem, nextSibling);
                } else {
                    parentNode.appendChild(elem);
                }
            },
            initFlash: function (elem) {
                // console.log(elem);
                if (DONE.indexOf(elem) !== -1) {
                    return;
                }
                if (this.rewriteFlash(elem)) {
                    this.reloadFlash(elem);
                    DONE.push(elem);
                }
            },
            rewriteFlash: function (elem) {
                var atrs = ['data', 'src'];
                var players = CONSTANTS.PLAYERS;
                var needReload = false;
                UTIL.forEach(atrs, function (atr) {
                    UTIL.forEach(players, function (player) {
                        if (elem[atr] && player.find.test(elem[atr])) {
                            elem[atr] = elem[atr].replace(player.find, player.replace);
                            needReload = true;
                        }
                    });
                });
                return needReload;
            },
            forEach: function (arr, callback) {
                if (this.isArrayLike(arr)) {
                    if (Array.prototype.forEach) {
                        Array.prototype.forEach.call(arr, callback);
                    } else {
                        var i = 0;
                        for (i = 0; i < arr.length; ++i) {
                            callback.call(arr[i], arr[i]);
                        }
                    }
                }
            },
            isArrayLike: function (obj) {
                if (typeof obj !== 'object') {
                    return false;
                }
                var types = ['Array', 'NodeList', 'HTMLCollection'];
                var i = 0;
                for (i = 0; i < types.length; ++i) {
                    if (Object.prototype.toString.call(obj).indexOf(types[i]) !== -1) {
                        return true;
                    }
                }
                return false;
            }
        };
        function init() {
            function onDOMNodeInsertedHandler(e) {
                var target = e.target;
                if (target.nodeType === 1 && /OBJECT|EMBED|IFRAME/ig.test(target.nodeName)) {
                    UTIL.initFlash(target);
                }
            }
            function onAnimationStartHandler(e) {
                if (e.animationName === 'nodeInserted') {
                    var target = e.target;
                    // console.log(target);
                    if (target.nodeType === 1 && /OBJECT|EMBED|IFRAME/ig.test(target.nodeName)) {
                        UTIL.initFlash(target);
                    }
                }
            }
            UTIL.addCss(CONSTANTS.NODEINSERTED_HACK);
            /*Firefox*/
            document.body.addEventListener('animationstart', onAnimationStartHandler, false);
            /*/Firefox*/
            /*Chrome*/
            document.body.addEventListener('webkitAnimationEnd', onAnimationStartHandler, false);
            /*/Chrome*/
            /*Opera 12+*/
            document.body.addEventListener('oAnimationStart', onAnimationStartHandler, false);
            /*/Opera 12+*/
            /*IE, but I never tested this*/
            document.body.addEventListener('msAnimationStart', onAnimationStartHandler, false);
            /*/IE, but I never tested this*/
            if (/Opera/.test(navigator.userAgent) && !(/Version\/12/.test(navigator.userAgent))) {
                /*Old fashion, slower maybe*/
                document.body.addEventListener('DOMNodeInserted', onDOMNodeInsertedHandler, false);
                var matches = document.body.querySelectorAll(CONSTANTS.PLAYER_DOM);
                UTIL.forEach(matches, function (elem) {
                    UTIL.initFlash(elem);
                });
            }
        }
        function share(elem) {
            var pairs = CONSTANTS.SHARES;
            UTIL.forEach(pairs, function (item) {
                elem.value = elem.value.replace(item.find, item.replace);
            });
        }
        var CONTROLLER = [
            {
                host: '.',
                fn: function () {
                    init();
                }
            },
            {
                host: 'youku.com',
                fn: function () {
                    // UTIL.addCss(CONSTANTS.STYLE);

                    var matches = document.body.querySelectorAll(CONSTANTS.SHARE_DOM);
                    UTIL.forEach(matches, share);


                    // var youkuPlayer = document.body.querySelector('.playBox');
                    // var notWide = !document.body.querySelector('.playBox_thx');
                    // if (youkuPlayer && notWide) {
                    //     youkuPlayer.className += ' playBox_thx';
                    // }
                }
            },
            {
                host: 'tudou.com',
                fn: function () {
                    // UTIL.addCss(CONSTANTS.STYLE);
                    //tips();
                    var tudouPlayer = document.body.querySelector('#playerObject');
                    var normalDom = document.querySelector('.normal');
                    if (tudouPlayer && normalDom) {
                        normalDom.className = normalDom.className.replace('normal','widescreen');
                    }
                    var g = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
                    var TUI_copyToClip = g.TUI.copyToClip;
                    g.TUI.copyToClip = function () {
                        var matches = document.body.querySelectorAll(CONSTANTS.SHARE_DOM);
                        UTIL.forEach(matches, share);
                        TUI_copyToClip.apply(g.TUI, arguments);
                    };
                }
            }
        ];
        var host = location.host;
        function PROC(item) {
            if (host.indexOf(item.host) !== -1) {
                item.fn();
                return;
            }
        }
        UTIL.forEach(CONTROLLER, PROC);
    }
    if (typeof unsafeWindow !== 'undefined') {
        main();
    } else {
        run(main);
    }
//====================================CSS injector
function addStyleString(str) {
    var node = document.createElement('style');
    node.innerHTML = str;
    document.body.appendChild(node);
}
//====================================


if (/youku\.com/i.test(window.location)) {//此为修复优酷CCS代码。

addStyleString('.danmuoff .vpactionv5_iframe_wrap {top: auto !important;} .play_area{margin-bottom: 70px !important;}');

}
})();
