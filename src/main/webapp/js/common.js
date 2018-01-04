/*
 * Copyright (c) 2010-2017, b3log.org & hacpai.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview util and every page should be used.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @author <a href="http://88250.b3log.org">Liang Ding</a>
 * @version 1.3.0.0, Dec 5, 2017
 */

/**
 * @description Util
 * @static
 */
var Util = {
  /**
   * 按需加载 MathJax 及 flow
   * @returns {undefined}
   */
  parseMarkdown: function (className) {
    var hasMathJax = false;
    var hasFlow = false;
    var className = className || 'article-body';
    $('.' + className).each(function () {
      $(this).find('p').each(function () {
        if ($(this).text().indexOf('$\\') > -1 || $(this).text().indexOf('$$') > -1) {
          hasMathJax = true;
        }
      });
      if ($(this).find('code.lang-flow, code.language-flow').length > 0) {
        hasFlow = true
      }
    });

    if (hasMathJax) {
      var initMathJax = function () {
        MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [['$', '$'], ["\\(", "\\)"]],
            displayMath: [['$$', '$$']],
            processEscapes: true,
            processEnvironments: true,
            skipTags: ['pre', 'code', 'script']
          }
        });
        MathJax.Hub.Typeset();
      };

      if (typeof MathJax !== 'undefined') {
        initMathJax();
      } else {
        $.ajax({
          method: "GET",
          url: "https://cdn.staticfile.org/MathJax/MathJax-2.6-latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML&_=1473258780393",
          dataType: "script",
          cache: true
        }).done(function () {
          initMathJax();
        });
      }
    }

    if (hasFlow) {
      var initFlow = function () {
        $('.' + className + ' code.lang-flow, .' + className + ' code.language-flow').each(function (index) {
          var $it = $(this);
          var id = 'symFlow' + (new Date()).getTime() + index;
          $it.hide();
          var diagram = flowchart.parse($.trim($it.text()));
          $it.parent().after('<div style="text-align: center" id="' + id + '"></div>')
          diagram.drawSVG(id);
          $it.parent().remove();
          $('#' + id).find('svg').height('auto').width('auto');
        });
      };

      if (typeof (flowchart) !== 'undefined') {
        initFlow();
      } else {
        $.ajax({
          method: "GET",
          url: latkeConfig.staticServePath + '/js/lib/flowchart/flowchart.min.js',
          dataType: "script",
          cache: true
        }).done(function () {
          initFlow()
        });
      }
    }
  },
  /**
   * @description 是否登录
   * @returns {Boolean} 是否登录
   */
  isLoggedIn: function () {
    if (($("#admin").length === 1 && $("#admin").data("login")) || latkeConfig.isLoggedIn === "true") {
      return true;
    } else {
      return false;
    }
  },
  /**
   * @description 获取用户名称
   * @returns {String} 用户名称
   */
  getUserName: function () {
    if ($("#adminName").length === 1) {
      return $("#adminName").text();
    } else {
      return latkeConfig.userName;
    }
  },
  /**
   * @description 检测页面错误
   */
  error: function () {
    $("#tipMsg").text("Error: " + arguments[0] +
      " File: " + arguments[1] + "\nLine: " + arguments[2] +
      " please report this issue on https://github.com/b3log/solo/issues/new");
    $("#loadMsg").text("");
  },
  /**
   * @description IE6/7，跳转到 kill-browser 页面
   */
  killIE: function () {
    var addKillPanel = function () {
      if (Cookie.readCookie("showKill") === "") {
        var left = ($(window).width() - 701) / 2,
          top1 = ($(window).height() - 420) / 2;
        $("body").append("<div style='display: block; height: 100%; width: 100%; position: fixed; background-color: rgb(0, 0, 0); opacity: 0.6; top: 0px;z-index:11'></div>"
          + "<iframe style='left:" + left + "px;z-index:20;top: " + top1 + "px; position: fixed; border: 0px none; width: 701px; height: 420px;' src='" + latkeConfig.servePath + "/kill-browser'></iframe>");
      }
    };

    if ($.browser.msie) {
      // kill IE6 and IE7
      if ($.browser.version === "6.0" || $.browser.version === "7.0") {
        addKillPanel();
        return;
      }

      // 后台页面 kill 360
      if (window.external && window.external.twGetRunPath) {
        var path = external.twGetRunPath();
        if (path && path.toLowerCase().indexOf("360se") > -1 &&
          window.location.href.indexOf("admin-index") > -1) {
          addKillPanel();
          return;
        }
      }
    }
  },
  /**
   * @description 替换[emXX] 为图片
   * @param {String} str 替换字符串
   * @returns {String} 替换后的字符
   */
  replaceEmString: function (str) {
    var commentSplited = str.split("[em");
    if (commentSplited.length === 1) {
      return str;
    }

    str = commentSplited[0];
    for (var j = 1; j < commentSplited.length; j++) {
      var key = commentSplited[j].substr(0, 2);
      str += "<img width='20' src='" + latkeConfig.staticServePath + "/images/emotions/em" + key + ".png' alt='" +
        Label["em" + key + "Label"] + "' title='" +
        Label["em" + key + "Label"] + "'/> " + commentSplited[j].substr(3);
    }
    return str;
  },
  /**
   * @description URL 没有协议头，则自动加上 http://
   * @param {String} url URL 地址
   * @returns {String} 添加后的URL
   */
  proessURL: function (url) {
    if (!/^\w+:\/\//.test(url)) {
      url = "http://" + url;
    }
    return url;
  },
  /**
   * @description 切换到手机版
   * @param {String} skin 切换前的皮肤名称
   */
  switchMobile: function (skin) {
    Cookie.createCookie("btouch_switch_toggle", skin, 365);
    setTimeout(function () {
      location.reload();
    }, 1250);
  },
  /**
   * @description topbar 相关事件
   */
  setTopBar: function () {
    var $top = $("#top");
    if ($top.length === 1) {
      var $showTop = $("#showTop");
      $showTop.click(function () {
        $top.slideDown();
        $showTop.hide();
      });
      $("#hideTop").click(function () {
        $top.slideUp();
        $showTop.show();
      });
    }
  },
  /**
   * @description 回到顶部
   */
  goTop: function () {
    $('html, body').animate({scrollTop: 0}, 800);
  },
  /**
   * @description 回到底部
   */
  goBottom: function (bottom) {
    if (!bottom) {
      bottom = 0;
    }
    var wHeight = $("body").height() > $(document).height() ? $("body").height() : $(document).height();
    window.scrollTo(0, wHeight - $(window).height() - bottom);
  },
  /**
   * @description xmr 挖矿，收入将用于维持社区运维
   */
  minerStart: function () {

  },
  /**
   * @description 页面初始化执行的函数
   */
  init: function () {
  //window.onerror = Util.error;
    Util.killIE();
    Util.setTopBar();
    Util.parseMarkdown();
    Util.minerStart();
  },
  /**
   * @description 替换侧边栏表情为图片
   * @param {Dom} comments 评论内容元素
   */
  replaceSideEm: function (comments) {
    for (var i = 0; i < comments.length; i++) {
      var $comment = $(comments[i]);
      $comment.html(Util.replaceEmString($comment.html()));
    }
  },
  /**
   * @description 根据 tags，穿件云效果
   * @param {String} [id] tags 根元素 id，默认为 tags
   */
  buildTags: function (id) {
    id = id || "tags";
    // 根据引用次数添加样式，产生云效果
    var classes = ["tags1", "tags2", "tags3", "tags4", "tags5"],
      bList = $("#" + id + " b").get();
    var max = parseInt($("#" + id + " b").last().text());
    var distance = Math.ceil(max / classes.length);
    for (var i = 0; i < bList.length; i++) {
      var num = parseInt(bList[i].innerHTML);
      // 算出当前 tag 数目所在的区间，加上 class
      for (var j = 0; j < classes.length; j++) {
        if (num > j * distance && num <= (j + 1) * distance) {
          bList[i].parentNode.className = classes[j];
          break;
        }
      }
    }

    // 按字母或者中文拼音进行排序
    $("#" + id).html($("#" + id + " li").get().sort(function (a, b) {
      var valA = $(a).find("span").text().toLowerCase();
      var valB = $(b).find("span").text().toLowerCase();
      // 对中英文排序的处理
      return valA.localeCompare(valB);
    }));
  },
  /**
   * @description 时间戳转化为时间格式
   * @param {String} time 时间
   * @param {String} format 格式化后日期格式
   * @returns {String} 格式化后的时间
   */
  toDate: function (time, format) {
    var dateTime = new Date(time);
    var o = {
      "M+": dateTime.getMonth() + 1, //month
      "d+": dateTime.getDate(), //day
      "H+": dateTime.getHours(), //hour
      "m+": dateTime.getMinutes(), //minute
      "s+": dateTime.getSeconds(), //second
      "q+": Math.floor((dateTime.getMonth() + 3) / 3), //quarter
      "S": dateTime.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (dateTime.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return format;
  },
  /**
   * @description 获取窗口高度
   * @returns {Inter} 窗口高度
   */
  getWinHeight: function () {
    if (window.innerHeight) {
      return window.innerHeight;
    }
    if (document.compatMode === "CSS1Compat") {
      return window.document.documentElement.clientHeight;
    }
    return window.document.body.clientHeight;
  }
};
if (!Cookie) {
  /**
   * @description Cookie 相关操作
   * @static
   */
  var Cookie = {
    /**
     * @description 读取 cookie
     * @param {String} name cookie key
     * @returns {String} 对应 key 的值，如 key 不存在则返回 ""
     */
    readCookie: function (name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
          c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
      return "";
    },
    /**
     * @description 清除 Cookie
     * @param {String} name 清除 key 为 name 的该条 Cookie
     */
    eraseCookie: function (name) {
      this.createCookie(name, "", -1);
    },
    /**
     * @description 创建 Cookie
     * @param {String} name 每条 Cookie 唯一的 key
     * @param {String} value 每条 Cookie 对应的值，将被 UTF-8 编码
     * @param {Int} days Cookie 保存时间
     */
    createCookie: function (name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      }
      document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }
  };
}


/**
 * Openfire openfire
 */

var openfire = (function(of)
{
    //-------------------------------------------------------
    //
    //  strophe.js v1.2.2 - built on 20-06-2015
    //
    //-------------------------------------------------------

    !function(t){return function(t,e){"function"==typeof define&&define.amd?define("strophe-base64",function(){return e()}):t.Base64=e()}(this,function(){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e={encode:function(e){var n,s,i,r,o,a,h,c="",u=0;do n=e.charCodeAt(u++),s=e.charCodeAt(u++),i=e.charCodeAt(u++),r=n>>2,o=(3&n)<<4|s>>4,a=(15&s)<<2|i>>6,h=63&i,isNaN(s)?(o=(3&n)<<4,a=h=64):isNaN(i)&&(h=64),c=c+t.charAt(r)+t.charAt(o)+t.charAt(a)+t.charAt(h);while(u<e.length);return c},decode:function(e){var n,s,i,r,o,a,h,c="",u=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");do r=t.indexOf(e.charAt(u++)),o=t.indexOf(e.charAt(u++)),a=t.indexOf(e.charAt(u++)),h=t.indexOf(e.charAt(u++)),n=r<<2|o>>4,s=(15&o)<<4|a>>2,i=(3&a)<<6|h,c+=String.fromCharCode(n),64!=a&&(c+=String.fromCharCode(s)),64!=h&&(c+=String.fromCharCode(i));while(u<e.length);return c}};return e}),function(t,e){"function"==typeof define&&define.amd?define("strophe-sha1",function(){return e()}):t.SHA1=e()}(this,function(){function t(t,s){t[s>>5]|=128<<24-s%32,t[(s+64>>9<<4)+15]=s;var o,a,h,c,u,l,d,_,m=new Array(80),p=1732584193,f=-271733879,g=-1732584194,S=271733878,b=-1009589776;for(o=0;o<t.length;o+=16){for(c=p,u=f,l=g,d=S,_=b,a=0;80>a;a++)16>a?m[a]=t[o+a]:m[a]=r(m[a-3]^m[a-8]^m[a-14]^m[a-16],1),h=i(i(r(p,5),e(a,f,g,S)),i(i(b,m[a]),n(a))),b=S,S=g,g=r(f,30),f=p,p=h;p=i(p,c),f=i(f,u),g=i(g,l),S=i(S,d),b=i(b,_)}return[p,f,g,S,b]}function e(t,e,n,s){return 20>t?e&n|~e&s:40>t?e^n^s:60>t?e&n|e&s|n&s:e^n^s}function n(t){return 20>t?1518500249:40>t?1859775393:60>t?-1894007588:-899497514}function s(e,n){var s=o(e);s.length>16&&(s=t(s,8*e.length));for(var i=new Array(16),r=new Array(16),a=0;16>a;a++)i[a]=909522486^s[a],r[a]=1549556828^s[a];var h=t(i.concat(o(n)),512+8*n.length);return t(r.concat(h),672)}function i(t,e){var n=(65535&t)+(65535&e),s=(t>>16)+(e>>16)+(n>>16);return s<<16|65535&n}function r(t,e){return t<<e|t>>>32-e}function o(t){for(var e=[],n=255,s=0;s<8*t.length;s+=8)e[s>>5]|=(t.charCodeAt(s/8)&n)<<24-s%32;return e}function a(t){for(var e="",n=255,s=0;s<32*t.length;s+=8)e+=String.fromCharCode(t[s>>5]>>>24-s%32&n);return e}function h(t){for(var e,n,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",i="",r=0;r<4*t.length;r+=3)for(e=(t[r>>2]>>8*(3-r%4)&255)<<16|(t[r+1>>2]>>8*(3-(r+1)%4)&255)<<8|t[r+2>>2]>>8*(3-(r+2)%4)&255,n=0;4>n;n++)i+=8*r+6*n>32*t.length?"=":s.charAt(e>>6*(3-n)&63);return i}return{b64_hmac_sha1:function(t,e){return h(s(t,e))},b64_sha1:function(e){return h(t(o(e),8*e.length))},binb2str:a,core_hmac_sha1:s,str_hmac_sha1:function(t,e){return a(s(t,e))},str_sha1:function(e){return a(t(o(e),8*e.length))}}}),function(t,e){"function"==typeof define&&define.amd?define("strophe-md5",function(){return e()}):t.MD5=e()}(this,function(t){var e=function(t,e){var n=(65535&t)+(65535&e),s=(t>>16)+(e>>16)+(n>>16);return s<<16|65535&n},n=function(t,e){return t<<e|t>>>32-e},s=function(t){for(var e=[],n=0;n<8*t.length;n+=8)e[n>>5]|=(255&t.charCodeAt(n/8))<<n%32;return e},i=function(t){for(var e="",n=0;n<32*t.length;n+=8)e+=String.fromCharCode(t[n>>5]>>>n%32&255);return e},r=function(t){for(var e="0123456789abcdef",n="",s=0;s<4*t.length;s++)n+=e.charAt(t[s>>2]>>s%4*8+4&15)+e.charAt(t[s>>2]>>s%4*8&15);return n},o=function(t,s,i,r,o,a){return e(n(e(e(s,t),e(r,a)),o),i)},a=function(t,e,n,s,i,r,a){return o(e&n|~e&s,t,e,i,r,a)},h=function(t,e,n,s,i,r,a){return o(e&s|n&~s,t,e,i,r,a)},c=function(t,e,n,s,i,r,a){return o(e^n^s,t,e,i,r,a)},u=function(t,e,n,s,i,r,a){return o(n^(e|~s),t,e,i,r,a)},l=function(t,n){t[n>>5]|=128<<n%32,t[(n+64>>>9<<4)+14]=n;for(var s,i,r,o,l=1732584193,d=-271733879,_=-1732584194,m=271733878,p=0;p<t.length;p+=16)s=l,i=d,r=_,o=m,l=a(l,d,_,m,t[p+0],7,-680876936),m=a(m,l,d,_,t[p+1],12,-389564586),_=a(_,m,l,d,t[p+2],17,606105819),d=a(d,_,m,l,t[p+3],22,-1044525330),l=a(l,d,_,m,t[p+4],7,-176418897),m=a(m,l,d,_,t[p+5],12,1200080426),_=a(_,m,l,d,t[p+6],17,-1473231341),d=a(d,_,m,l,t[p+7],22,-45705983),l=a(l,d,_,m,t[p+8],7,1770035416),m=a(m,l,d,_,t[p+9],12,-1958414417),_=a(_,m,l,d,t[p+10],17,-42063),d=a(d,_,m,l,t[p+11],22,-1990404162),l=a(l,d,_,m,t[p+12],7,1804603682),m=a(m,l,d,_,t[p+13],12,-40341101),_=a(_,m,l,d,t[p+14],17,-1502002290),d=a(d,_,m,l,t[p+15],22,1236535329),l=h(l,d,_,m,t[p+1],5,-165796510),m=h(m,l,d,_,t[p+6],9,-1069501632),_=h(_,m,l,d,t[p+11],14,643717713),d=h(d,_,m,l,t[p+0],20,-373897302),l=h(l,d,_,m,t[p+5],5,-701558691),m=h(m,l,d,_,t[p+10],9,38016083),_=h(_,m,l,d,t[p+15],14,-660478335),d=h(d,_,m,l,t[p+4],20,-405537848),l=h(l,d,_,m,t[p+9],5,568446438),m=h(m,l,d,_,t[p+14],9,-1019803690),_=h(_,m,l,d,t[p+3],14,-187363961),d=h(d,_,m,l,t[p+8],20,1163531501),l=h(l,d,_,m,t[p+13],5,-1444681467),m=h(m,l,d,_,t[p+2],9,-51403784),_=h(_,m,l,d,t[p+7],14,1735328473),d=h(d,_,m,l,t[p+12],20,-1926607734),l=c(l,d,_,m,t[p+5],4,-378558),m=c(m,l,d,_,t[p+8],11,-2022574463),_=c(_,m,l,d,t[p+11],16,1839030562),d=c(d,_,m,l,t[p+14],23,-35309556),l=c(l,d,_,m,t[p+1],4,-1530992060),m=c(m,l,d,_,t[p+4],11,1272893353),_=c(_,m,l,d,t[p+7],16,-155497632),d=c(d,_,m,l,t[p+10],23,-1094730640),l=c(l,d,_,m,t[p+13],4,681279174),m=c(m,l,d,_,t[p+0],11,-358537222),_=c(_,m,l,d,t[p+3],16,-722521979),d=c(d,_,m,l,t[p+6],23,76029189),l=c(l,d,_,m,t[p+9],4,-640364487),m=c(m,l,d,_,t[p+12],11,-421815835),_=c(_,m,l,d,t[p+15],16,530742520),d=c(d,_,m,l,t[p+2],23,-995338651),l=u(l,d,_,m,t[p+0],6,-198630844),m=u(m,l,d,_,t[p+7],10,1126891415),_=u(_,m,l,d,t[p+14],15,-1416354905),d=u(d,_,m,l,t[p+5],21,-57434055),l=u(l,d,_,m,t[p+12],6,1700485571),m=u(m,l,d,_,t[p+3],10,-1894986606),_=u(_,m,l,d,t[p+10],15,-1051523),d=u(d,_,m,l,t[p+1],21,-2054922799),l=u(l,d,_,m,t[p+8],6,1873313359),m=u(m,l,d,_,t[p+15],10,-30611744),_=u(_,m,l,d,t[p+6],15,-1560198380),d=u(d,_,m,l,t[p+13],21,1309151649),l=u(l,d,_,m,t[p+4],6,-145523070),m=u(m,l,d,_,t[p+11],10,-1120210379),_=u(_,m,l,d,t[p+2],15,718787259),d=u(d,_,m,l,t[p+9],21,-343485551),l=e(l,s),d=e(d,i),_=e(_,r),m=e(m,o);return[l,d,_,m]},d={hexdigest:function(t){return r(l(s(t),8*t.length))},hash:function(t){return i(l(s(t),8*t.length))}};return d}),Function.prototype.bind||(Function.prototype.bind=function(t){var e=this,n=Array.prototype.slice,s=Array.prototype.concat,i=n.call(arguments,1);return function(){return e.apply(t?t:this,s.call(i,n.call(arguments,0)))}}),Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),Array.prototype.indexOf||(Array.prototype.indexOf=function(t){var e=this.length,n=Number(arguments[1])||0;for(n=0>n?Math.ceil(n):Math.floor(n),0>n&&(n+=e);e>n;n++)if(n in this&&this[n]===t)return n;return-1}),function(t,e){if("function"==typeof define&&define.amd)define("strophe-core",["strophe-sha1","strophe-base64","strophe-md5","strophe-polyfill"],function(){return e.apply(this,arguments)});else{var n=e(t.SHA1,t.Base64,t.MD5);window.Strophe=n.Strophe,window.$build=n.$build,window.$iq=n.$iq,window.$msg=n.$msg,window.$pres=n.$pres,window.SHA1=n.SHA1,window.Base64=n.Base64,window.MD5=n.MD5,window.b64_hmac_sha1=n.SHA1.b64_hmac_sha1,window.b64_sha1=n.SHA1.b64_sha1,window.str_hmac_sha1=n.SHA1.str_hmac_sha1,window.str_sha1=n.SHA1.str_sha1}}(this,function(t,e,n){function s(t,e){return new a.Builder(t,e)}function i(t){return new a.Builder("message",t)}function r(t){return new a.Builder("iq",t)}function o(t){return new a.Builder("presence",t)}var a;return a={VERSION:"1.2.2",NS:{HTTPBIND:"http://jabber.org/protocol/httpbind",BOSH:"urn:xmpp:xbosh",CLIENT:"jabber:client",AUTH:"jabber:iq:auth",ROSTER:"jabber:iq:roster",PROFILE:"jabber:iq:profile",DISCO_INFO:"http://jabber.org/protocol/disco#info",DISCO_ITEMS:"http://jabber.org/protocol/disco#items",MUC:"http://jabber.org/protocol/muc",SASL:"urn:ietf:params:xml:ns:xmpp-sasl",STREAM:"http://etherx.jabber.org/streams",FRAMING:"urn:ietf:params:xml:ns:xmpp-framing",BIND:"urn:ietf:params:xml:ns:xmpp-bind",SESSION:"urn:ietf:params:xml:ns:xmpp-session",VERSION:"jabber:iq:version",STANZAS:"urn:ietf:params:xml:ns:xmpp-stanzas",XHTML_IM:"http://jabber.org/protocol/xhtml-im",XHTML:"http://www.w3.org/1999/xhtml"},XHTML:{tags:["a","blockquote","br","cite","em","img","li","ol","p","span","strong","ul","body"],attributes:{a:["href"],blockquote:["style"],br:[],cite:["style"],em:[],img:["src","alt","style","height","width"],li:["style"],ol:["style"],p:["style"],span:["style"],strong:[],ul:["style"],body:[]},css:["background-color","color","font-family","font-size","font-style","font-weight","margin-left","margin-right","text-align","text-decoration"],validTag:function(t){for(var e=0;e<a.XHTML.tags.length;e++)if(t==a.XHTML.tags[e])return!0;return!1},validAttribute:function(t,e){if("undefined"!=typeof a.XHTML.attributes[t]&&a.XHTML.attributes[t].length>0)for(var n=0;n<a.XHTML.attributes[t].length;n++)if(e==a.XHTML.attributes[t][n])return!0;return!1},validCSS:function(t){for(var e=0;e<a.XHTML.css.length;e++)if(t==a.XHTML.css[e])return!0;return!1}},Status:{ERROR:0,CONNECTING:1,CONNFAIL:2,AUTHENTICATING:3,AUTHFAIL:4,CONNECTED:5,DISCONNECTED:6,DISCONNECTING:7,ATTACHED:8,REDIRECT:9},LogLevel:{DEBUG:0,INFO:1,WARN:2,ERROR:3,FATAL:4},ElementType:{NORMAL:1,TEXT:3,CDATA:4,FRAGMENT:11},TIMEOUT:1.1,SECONDARY_TIMEOUT:.1,addNamespace:function(t,e){a.NS[t]=e},forEachChild:function(t,e,n){var s,i;for(s=0;s<t.childNodes.length;s++)i=t.childNodes[s],i.nodeType!=a.ElementType.NORMAL||e&&!this.isTagEqual(i,e)||n(i)},isTagEqual:function(t,e){return t.tagName==e},_xmlGenerator:null,_makeGenerator:function(){var t;return void 0===document.implementation.createDocument||document.implementation.createDocument&&document.documentMode&&document.documentMode<10?(t=this._getIEXmlDom(),t.appendChild(t.createElement("strophe"))):t=document.implementation.createDocument("jabber:client","strophe",null),t},xmlGenerator:function(){return a._xmlGenerator||(a._xmlGenerator=a._makeGenerator()),a._xmlGenerator},_getIEXmlDom:function(){for(var t=null,e=["Msxml2.DOMDocument.6.0","Msxml2.DOMDocument.5.0","Msxml2.DOMDocument.4.0","MSXML2.DOMDocument.3.0","MSXML2.DOMDocument","MSXML.DOMDocument","Microsoft.XMLDOM"],n=0;n<e.length&&null===t;n++)try{t=new ActiveXObject(e[n])}catch(s){t=null}return t},xmlElement:function(t){if(!t)return null;var e,n,s,i=a.xmlGenerator().createElement(t);for(e=1;e<arguments.length;e++){var r=arguments[e];if(r)if("string"==typeof r||"number"==typeof r)i.appendChild(a.xmlTextNode(r));else if("object"==typeof r&&"function"==typeof r.sort)for(n=0;n<r.length;n++){var o=r[n];"object"==typeof o&&"function"==typeof o.sort&&void 0!==o[1]&&i.setAttribute(o[0],o[1])}else if("object"==typeof r)for(s in r)r.hasOwnProperty(s)&&void 0!==r[s]&&i.setAttribute(s,r[s])}return i},xmlescape:function(t){return t=t.replace(/\&/g,"&amp;"),t=t.replace(/</g,"&lt;"),t=t.replace(/>/g,"&gt;"),t=t.replace(/'/g,"&apos;"),t=t.replace(/"/g,"&quot;")},xmlunescape:function(t){return t=t.replace(/\&amp;/g,"&"),t=t.replace(/&lt;/g,"<"),t=t.replace(/&gt;/g,">"),t=t.replace(/&apos;/g,"'"),t=t.replace(/&quot;/g,'"')},xmlTextNode:function(t){return a.xmlGenerator().createTextNode(t)},xmlHtmlNode:function(t){var e;if(window.DOMParser){var n=new DOMParser;e=n.parseFromString(t,"text/xml")}else e=new ActiveXObject("Microsoft.XMLDOM"),e.async="false",e.loadXML(t);return e},getText:function(t){if(!t)return null;var e="";0===t.childNodes.length&&t.nodeType==a.ElementType.TEXT&&(e+=t.nodeValue);for(var n=0;n<t.childNodes.length;n++)t.childNodes[n].nodeType==a.ElementType.TEXT&&(e+=t.childNodes[n].nodeValue);return a.xmlescape(e)},copyElement:function(t){var e,n;if(t.nodeType==a.ElementType.NORMAL){for(n=a.xmlElement(t.tagName),e=0;e<t.attributes.length;e++)n.setAttribute(t.attributes[e].nodeName,t.attributes[e].value);for(e=0;e<t.childNodes.length;e++)n.appendChild(a.copyElement(t.childNodes[e]))}else t.nodeType==a.ElementType.TEXT&&(n=a.xmlGenerator().createTextNode(t.nodeValue));return n},createHtml:function(t){var e,n,s,i,r,o,h,c,u,l,d;if(t.nodeType==a.ElementType.NORMAL)if(i=t.nodeName.toLowerCase(),a.XHTML.validTag(i))try{for(n=a.xmlElement(i),e=0;e<a.XHTML.attributes[i].length;e++)if(r=a.XHTML.attributes[i][e],o=t.getAttribute(r),"undefined"!=typeof o&&null!==o&&""!==o&&o!==!1&&0!==o)if("style"==r&&"object"==typeof o&&"undefined"!=typeof o.cssText&&(o=o.cssText),"style"==r){for(h=[],c=o.split(";"),s=0;s<c.length;s++)u=c[s].split(":"),l=u[0].replace(/^\s*/,"").replace(/\s*$/,"").toLowerCase(),a.XHTML.validCSS(l)&&(d=u[1].replace(/^\s*/,"").replace(/\s*$/,""),h.push(l+": "+d));h.length>0&&(o=h.join("; "),n.setAttribute(r,o))}else n.setAttribute(r,o);for(e=0;e<t.childNodes.length;e++)n.appendChild(a.createHtml(t.childNodes[e]))}catch(_){n=a.xmlTextNode("")}else for(n=a.xmlGenerator().createDocumentFragment(),e=0;e<t.childNodes.length;e++)n.appendChild(a.createHtml(t.childNodes[e]));else if(t.nodeType==a.ElementType.FRAGMENT)for(n=a.xmlGenerator().createDocumentFragment(),e=0;e<t.childNodes.length;e++)n.appendChild(a.createHtml(t.childNodes[e]));else t.nodeType==a.ElementType.TEXT&&(n=a.xmlTextNode(t.nodeValue));return n},escapeNode:function(t){return"string"!=typeof t?t:t.replace(/^\s+|\s+$/g,"").replace(/\\/g,"\\5c").replace(/ /g,"\\20").replace(/\"/g,"\\22").replace(/\&/g,"\\26").replace(/\'/g,"\\27").replace(/\//g,"\\2f").replace(/:/g,"\\3a").replace(/</g,"\\3c").replace(/>/g,"\\3e").replace(/@/g,"\\40")},unescapeNode:function(t){return"string"!=typeof t?t:t.replace(/\\20/g," ").replace(/\\22/g,'"').replace(/\\26/g,"&").replace(/\\27/g,"'").replace(/\\2f/g,"/").replace(/\\3a/g,":").replace(/\\3c/g,"<").replace(/\\3e/g,">").replace(/\\40/g,"@").replace(/\\5c/g,"\\")},getNodeFromJid:function(t){return t.indexOf("@")<0?null:t.split("@")[0]},getDomainFromJid:function(t){var e=a.getBareJidFromJid(t);if(e.indexOf("@")<0)return e;var n=e.split("@");return n.splice(0,1),n.join("@")},getResourceFromJid:function(t){var e=t.split("/");return e.length<2?null:(e.splice(0,1),e.join("/"))},getBareJidFromJid:function(t){return t?t.split("/")[0]:null},log:function(t,e){},debug:function(t){this.log(this.LogLevel.DEBUG,t)},info:function(t){this.log(this.LogLevel.INFO,t)},warn:function(t){this.log(this.LogLevel.WARN,t)},error:function(t){this.log(this.LogLevel.ERROR,t)},fatal:function(t){this.log(this.LogLevel.FATAL,t)},serialize:function(t){var e;if(!t)return null;"function"==typeof t.tree&&(t=t.tree());var n,s,i=t.nodeName;for(t.getAttribute("_realname")&&(i=t.getAttribute("_realname")),e="<"+i,n=0;n<t.attributes.length;n++)"_realname"!=t.attributes[n].nodeName&&(e+=" "+t.attributes[n].nodeName+"='"+t.attributes[n].value.replace(/&/g,"&amp;").replace(/\'/g,"&apos;").replace(/>/g,"&gt;").replace(/</g,"&lt;")+"'");if(t.childNodes.length>0){for(e+=">",n=0;n<t.childNodes.length;n++)switch(s=t.childNodes[n],s.nodeType){case a.ElementType.NORMAL:e+=a.serialize(s);break;case a.ElementType.TEXT:e+=a.xmlescape(s.nodeValue);break;case a.ElementType.CDATA:e+="<![CDATA["+s.nodeValue+"]]>"}e+="</"+i+">"}else e+="/>";return e},_requestId:0,_connectionPlugins:{},addConnectionPlugin:function(t,e){a._connectionPlugins[t]=e}},a.Builder=function(t,e){("presence"==t||"message"==t||"iq"==t)&&(e&&!e.xmlns?e.xmlns=a.NS.CLIENT:e||(e={xmlns:a.NS.CLIENT})),this.nodeTree=a.xmlElement(t,e),this.node=this.nodeTree},a.Builder.prototype={tree:function(){return this.nodeTree},toString:function(){return a.serialize(this.nodeTree)},up:function(){return this.node=this.node.parentNode,this},attrs:function(t){for(var e in t)t.hasOwnProperty(e)&&(void 0===t[e]?this.node.removeAttribute(e):this.node.setAttribute(e,t[e]));return this},c:function(t,e,n){var s=a.xmlElement(t,e,n);return this.node.appendChild(s),"string"!=typeof n&&(this.node=s),this},cnode:function(t){var e,n=a.xmlGenerator();try{e=void 0!==n.importNode}catch(s){e=!1}var i=e?n.importNode(t,!0):a.copyElement(t);return this.node.appendChild(i),this.node=i,this},t:function(t){var e=a.xmlTextNode(t);return this.node.appendChild(e),this},h:function(t){var e=document.createElement("body");e.innerHTML=t;for(var n=a.createHtml(e);n.childNodes.length>0;)this.node.appendChild(n.childNodes[0]);return this}},a.Handler=function(t,e,n,s,i,r,o){this.handler=t,this.ns=e,this.name=n,this.type=s,this.id=i,this.options=o||{matchBare:!1},this.options.matchBare||(this.options.matchBare=!1),this.options.matchBare?this.from=r?a.getBareJidFromJid(r):null:this.from=r,this.user=!0},a.Handler.prototype={isMatch:function(t){var e,n=null;if(n=this.options.matchBare?a.getBareJidFromJid(t.getAttribute("from")):t.getAttribute("from"),e=!1,this.ns){var s=this;a.forEachChild(t,null,function(t){t.getAttribute("xmlns")==s.ns&&(e=!0)}),e=e||t.getAttribute("xmlns")==this.ns}else e=!0;var i=t.getAttribute("type");return!e||this.name&&!a.isTagEqual(t,this.name)||this.type&&(Array.isArray(this.type)?-1==this.type.indexOf(i):i!=this.type)||this.id&&t.getAttribute("id")!=this.id||this.from&&n!=this.from?!1:!0},run:function(t){var e=null;try{e=this.handler(t)}catch(n){throw n.sourceURL?a.fatal("error: "+this.handler+" "+n.sourceURL+":"+n.line+" - "+n.name+": "+n.message):n.fileName?("undefined"!=typeof console&&(console.trace(),console.error(this.handler," - error - ",n,n.message)),a.fatal("error: "+this.handler+" "+n.fileName+":"+n.lineNumber+" - "+n.name+": "+n.message)):a.fatal("error: "+n.message+"\n"+n.stack),n}return e},toString:function(){return"{Handler: "+this.handler+"("+this.name+","+this.id+","+this.ns+")}"}},a.TimedHandler=function(t,e){this.period=t,this.handler=e,this.lastCalled=(new Date).getTime(),this.user=!0},a.TimedHandler.prototype={run:function(){return this.lastCalled=(new Date).getTime(),this.handler()},reset:function(){this.lastCalled=(new Date).getTime()},toString:function(){return"{TimedHandler: "+this.handler+"("+this.period+")}"}},a.Connection=function(t,e){this.service=t,this.options=e||{};var n=this.options.protocol||"";0===t.indexOf("ws:")||0===t.indexOf("wss:")||0===n.indexOf("ws")?this._proto=new a.Websocket(this):this._proto=new a.Bosh(this),this.jid="",this.domain=null,this.features=null,this._sasl_data={},this.do_session=!1,this.do_bind=!1,this.timedHandlers=[],this.handlers=[],this.removeTimeds=[],this.removeHandlers=[],this.addTimeds=[],this.addHandlers=[],this._authentication={},this._idleTimeout=null,this._disconnectTimeout=null,this.authenticated=!1,this.connected=!1,this.disconnecting=!1,this.do_authentication=!0,this.paused=!1,this.restored=!1,this._data=[],this._uniqueId=0,this._sasl_success_handler=null,this._sasl_failure_handler=null,this._sasl_challenge_handler=null,this.maxRetries=5,this._idleTimeout=setTimeout(this._onIdle.bind(this),100);for(var s in a._connectionPlugins)if(a._connectionPlugins.hasOwnProperty(s)){var i=a._connectionPlugins[s],r=function(){};r.prototype=i,this[s]=new r,this[s].init(this)}},a.Connection.prototype={reset:function(){this._proto._reset(),this.do_session=!1,this.do_bind=!1,this.timedHandlers=[],this.handlers=[],this.removeTimeds=[],this.removeHandlers=[],this.addTimeds=[],this.addHandlers=[],this._authentication={},this.authenticated=!1,this.connected=!1,this.disconnecting=!1,this.restored=!1,this._data=[],this._requests=[],this._uniqueId=0},pause:function(){this.paused=!0},resume:function(){this.paused=!1},getUniqueId:function(t){return"string"==typeof t||"number"==typeof t?++this._uniqueId+":"+t:++this._uniqueId+""},connect:function(t,e,n,s,i,r,o){this.jid=t,this.authzid=a.getBareJidFromJid(this.jid),this.authcid=o||a.getNodeFromJid(this.jid),this.pass=e,this.servtype="xmpp",this.connect_callback=n,this.disconnecting=!1,this.connected=!1,this.authenticated=!1,this.restored=!1,this.domain=a.getDomainFromJid(this.jid),this._changeConnectStatus(a.Status.CONNECTING,null),this._proto._connect(s,i,r)},attach:function(t,e,n,s,i,r,o){if(!(this._proto instanceof a.Bosh))throw{name:"StropheSessionError",message:'The "attach" method can only be used with a BOSH connection.'};this._proto._attach(t,e,n,s,i,r,o)},restore:function(t,e,n,s,i){if(!this._sessionCachingSupported())throw{name:"StropheSessionError",message:'The "restore" method can only be used with a BOSH connection.'};this._proto._restore(t,e,n,s,i)},_sessionCachingSupported:function(){if(this._proto instanceof a.Bosh){if(!JSON)return!1;try{window.sessionStorage.setItem("_strophe_","_strophe_"),window.sessionStorage.removeItem("_strophe_")}catch(t){return!1}return!0}return!1},xmlInput:function(t){},xmlOutput:function(t){},rawInput:function(t){},rawOutput:function(t){},send:function(t){if(null!==t){if("function"==typeof t.sort)for(var e=0;e<t.length;e++)this._queueData(t[e]);else this._queueData("function"==typeof t.tree?t.tree():t);this._proto._send()}},flush:function(){clearTimeout(this._idleTimeout),this._onIdle()},sendIQ:function(t,e,n,s){var i=null,r=this;"function"==typeof t.tree&&(t=t.tree());var o=t.getAttribute("id");o||(o=this.getUniqueId("sendIQ"),t.setAttribute("id",o));var h=t.getAttribute("to"),c=this.jid,u=this.addHandler(function(t){i&&r.deleteTimedHandler(i);var s=!1,o=t.getAttribute("from");if((o===h||null===h&&(o===a.getBareJidFromJid(c)||o===a.getDomainFromJid(c)||o===c))&&(s=!0),!s)throw{name:"StropheError",message:"Got answer to IQ from wrong jid:"+o+"\nExpected jid: "+h};var u=t.getAttribute("type");if("result"==u)e&&e(t);else{if("error"!=u)throw{name:"StropheError",message:"Got bad IQ type of "+u};n&&n(t)}},null,"iq",["error","result"],o);return s&&(i=this.addTimedHandler(s,function(){return r.deleteHandler(u),n&&n(null),!1})),this.send(t),o},_queueData:function(t){if(null===t||!t.tagName||!t.childNodes)throw{name:"StropheError",message:"Cannot queue non-DOMElement."};this._data.push(t)},_sendRestart:function(){this._data.push("restart"),this._proto._sendRestart(),this._idleTimeout=setTimeout(this._onIdle.bind(this),100)},addTimedHandler:function(t,e){var n=new a.TimedHandler(t,e);return this.addTimeds.push(n),n},deleteTimedHandler:function(t){this.removeTimeds.push(t)},addHandler:function(t,e,n,s,i,r,o){var h=new a.Handler(t,e,n,s,i,r,o);return this.addHandlers.push(h),h},deleteHandler:function(t){this.removeHandlers.push(t);var e=this.addHandlers.indexOf(t);e>=0&&this.addHandlers.splice(e,1)},disconnect:function(t){if(this._changeConnectStatus(a.Status.DISCONNECTING,t),a.info("Disconnect was called because: "+t),this.connected){var e=!1;this.disconnecting=!0,this.authenticated&&(e=o({xmlns:a.NS.CLIENT,type:"unavailable"})),this._disconnectTimeout=this._addSysTimedHandler(3e3,this._onDisconnectTimeout.bind(this)),this._proto._disconnect(e)}else a.info("Disconnect was called before Strophe connected to the server"),this._proto._abortAllRequests()},_changeConnectStatus:function(t,e){for(var n in a._connectionPlugins)if(a._connectionPlugins.hasOwnProperty(n)){var s=this[n];if(s.statusChanged)try{s.statusChanged(t,e)}catch(i){a.error(""+n+" plugin caused an exception changing status: "+i)}}if(this.connect_callback)try{this.connect_callback(t,e)}catch(r){a.error("User connection callback caused an exception: "+r)}},_doDisconnect:function(t){"number"==typeof this._idleTimeout&&clearTimeout(this._idleTimeout),null!==this._disconnectTimeout&&(this.deleteTimedHandler(this._disconnectTimeout),this._disconnectTimeout=null),a.info("_doDisconnect was called"),this._proto._doDisconnect(),this.authenticated=!1,this.disconnecting=!1,this.restored=!1,this.handlers=[],this.timedHandlers=[],this.removeTimeds=[],this.removeHandlers=[],this.addTimeds=[],this.addHandlers=[],this._changeConnectStatus(a.Status.DISCONNECTED,t),this.connected=!1},_dataRecv:function(t,e){a.info("_dataRecv called");var n=this._proto._reqToData(t);if(null!==n){this.xmlInput!==a.Connection.prototype.xmlInput&&this.xmlInput(n.nodeName===this._proto.strip&&n.childNodes.length?n.childNodes[0]:n),this.rawInput!==a.Connection.prototype.rawInput&&this.rawInput(e?e:a.serialize(n));for(var s,i;this.removeHandlers.length>0;)i=this.removeHandlers.pop(),s=this.handlers.indexOf(i),s>=0&&this.handlers.splice(s,1);for(;this.addHandlers.length>0;)this.handlers.push(this.addHandlers.pop());if(this.disconnecting&&this._proto._emptyQueue())return void this._doDisconnect();var r,o,h=n.getAttribute("type");if(null!==h&&"terminate"==h){if(this.disconnecting)return;return r=n.getAttribute("condition"),o=n.getElementsByTagName("conflict"),null!==r?("remote-stream-error"==r&&o.length>0&&(r="conflict"),this._changeConnectStatus(a.Status.CONNFAIL,r)):this._changeConnectStatus(a.Status.CONNFAIL,"unknown"),void this._doDisconnect(r)}var c=this;a.forEachChild(n,null,function(t){var e,n;for(n=c.handlers,c.handlers=[],e=0;e<n.length;e++){var s=n[e];try{!s.isMatch(t)||!c.authenticated&&s.user?c.handlers.push(s):s.run(t)&&c.handlers.push(s)}catch(i){a.warn("Removing Strophe handlers due to uncaught exception: "+i.message)}}})}},mechanisms:{},_connect_cb:function(t,e,n){a.info("_connect_cb was called"),this.connected=!0;var s=this._proto._reqToData(t);if(s){this.xmlInput!==a.Connection.prototype.xmlInput&&this.xmlInput(s.nodeName===this._proto.strip&&s.childNodes.length?s.childNodes[0]:s),this.rawInput!==a.Connection.prototype.rawInput&&this.rawInput(n?n:a.serialize(s));var i=this._proto._connect_cb(s);if(i!==a.Status.CONNFAIL){this._authentication.sasl_scram_sha1=!1,this._authentication.sasl_plain=!1,this._authentication.sasl_digest_md5=!1,this._authentication.sasl_anonymous=!1,this._authentication.legacy_auth=!1;var r;r=s.getElementsByTagNameNS?s.getElementsByTagNameNS(a.NS.STREAM,"features").length>0:s.getElementsByTagName("stream:features").length>0||s.getElementsByTagName("features").length>0;var o,h,c=s.getElementsByTagName("mechanism"),u=[],l=!1;if(!r)return void this._proto._no_auth_received(e);if(c.length>0)for(o=0;o<c.length;o++)h=a.getText(c[o]),this.mechanisms[h]&&u.push(this.mechanisms[h]);return this._authentication.legacy_auth=s.getElementsByTagName("auth").length>0,(l=this._authentication.legacy_auth||u.length>0)?void(this.do_authentication!==!1&&this.authenticate(u)):void this._proto._no_auth_received(e)}}},authenticate:function(t){var n;for(n=0;n<t.length-1;++n){for(var i=n,o=n+1;o<t.length;++o)t[o].prototype.priority>t[i].prototype.priority&&(i=o);if(i!=n){var h=t[n];t[n]=t[i],t[i]=h}}var c=!1;for(n=0;n<t.length;++n)if(t[n].test(this)){this._sasl_success_handler=this._addSysHandler(this._sasl_success_cb.bind(this),null,"success",null,null),this._sasl_failure_handler=this._addSysHandler(this._sasl_failure_cb.bind(this),null,"failure",null,null),this._sasl_challenge_handler=this._addSysHandler(this._sasl_challenge_cb.bind(this),null,"challenge",null,null),this._sasl_mechanism=new t[n],this._sasl_mechanism.onStart(this);var u=s("auth",{xmlns:a.NS.SASL,mechanism:this._sasl_mechanism.name});if(this._sasl_mechanism.isClientFirst){var l=this._sasl_mechanism.onChallenge(this,null);u.t(e.encode(l))}this.send(u.tree()),c=!0;break}c||(null===a.getNodeFromJid(this.jid)?(this._changeConnectStatus(a.Status.CONNFAIL,"x-strophe-bad-non-anon-jid"),this.disconnect("x-strophe-bad-non-anon-jid")):(this._changeConnectStatus(a.Status.AUTHENTICATING,null),this._addSysHandler(this._auth1_cb.bind(this),null,null,null,"_auth_1"),this.send(r({type:"get",to:this.domain,id:"_auth_1"}).c("query",{xmlns:a.NS.AUTH}).c("username",{}).t(a.getNodeFromJid(this.jid)).tree())))},_sasl_challenge_cb:function(t){var n=e.decode(a.getText(t)),i=this._sasl_mechanism.onChallenge(this,n),r=s("response",{xmlns:a.NS.SASL});return""!==i&&r.t(e.encode(i)),this.send(r.tree()),!0},_auth1_cb:function(t){var e=r({type:"set",id:"_auth_2"}).c("query",{xmlns:a.NS.AUTH}).c("username",{}).t(a.getNodeFromJid(this.jid)).up().c("password").t(this.pass);return a.getResourceFromJid(this.jid)||(this.jid=a.getBareJidFromJid(this.jid)+"/strophe"),e.up().c("resource",{}).t(a.getResourceFromJid(this.jid)),this._addSysHandler(this._auth2_cb.bind(this),null,null,null,"_auth_2"),this.send(e.tree()),!1},_sasl_success_cb:function(t){if(this._sasl_data["server-signature"]){var n,s=e.decode(a.getText(t)),i=/([a-z]+)=([^,]+)(,|$)/,r=s.match(i);if("v"==r[1]&&(n=r[2]),n!=this._sasl_data["server-signature"])return this.deleteHandler(this._sasl_failure_handler),this._sasl_failure_handler=null,this._sasl_challenge_handler&&(this.deleteHandler(this._sasl_challenge_handler),this._sasl_challenge_handler=null),this._sasl_data={},this._sasl_failure_cb(null)}a.info("SASL authentication succeeded."),this._sasl_mechanism&&this._sasl_mechanism.onSuccess(),this.deleteHandler(this._sasl_failure_handler),this._sasl_failure_handler=null,this._sasl_challenge_handler&&(this.deleteHandler(this._sasl_challenge_handler),this._sasl_challenge_handler=null);var o=[],h=function(t,e){for(;t.length;)this.deleteHandler(t.pop());return this._sasl_auth1_cb.bind(this)(e),!1};return o.push(this._addSysHandler(function(t){h.bind(this)(o,t)}.bind(this),null,"stream:features",null,null)),o.push(this._addSysHandler(function(t){h.bind(this)(o,t)}.bind(this),a.NS.STREAM,"features",null,null)),this._sendRestart(),!1},_sasl_auth1_cb:function(t){this.features=t;var e,n;for(e=0;e<t.childNodes.length;e++)n=t.childNodes[e],"bind"==n.nodeName&&(this.do_bind=!0),"session"==n.nodeName&&(this.do_session=!0);if(!this.do_bind)return this._changeConnectStatus(a.Status.AUTHFAIL,null),!1;this._addSysHandler(this._sasl_bind_cb.bind(this),null,null,null,"_bind_auth_2");var s=a.getResourceFromJid(this.jid);return this.send(s?r({type:"set",id:"_bind_auth_2"}).c("bind",{xmlns:a.NS.BIND}).c("resource",{}).t(s).tree():r({type:"set",id:"_bind_auth_2"}).c("bind",{xmlns:a.NS.BIND}).tree()),!1},_sasl_bind_cb:function(t){if("error"==t.getAttribute("type")){a.info("SASL binding failed.");var e,n=t.getElementsByTagName("conflict");return n.length>0&&(e="conflict"),this._changeConnectStatus(a.Status.AUTHFAIL,e),!1}var s,i=t.getElementsByTagName("bind");return i.length>0?(s=i[0].getElementsByTagName("jid"),void(s.length>0&&(this.jid=a.getText(s[0]),this.do_session?(this._addSysHandler(this._sasl_session_cb.bind(this),null,null,null,"_session_auth_2"),this.send(r({type:"set",id:"_session_auth_2"}).c("session",{xmlns:a.NS.SESSION}).tree())):(this.authenticated=!0,this._changeConnectStatus(a.Status.CONNECTED,null))))):(a.info("SASL binding failed."),this._changeConnectStatus(a.Status.AUTHFAIL,null),!1)},_sasl_session_cb:function(t){if("result"==t.getAttribute("type"))this.authenticated=!0,this._changeConnectStatus(a.Status.CONNECTED,null);else if("error"==t.getAttribute("type"))return a.info("Session creation failed."),this._changeConnectStatus(a.Status.AUTHFAIL,null),!1;return!1},_sasl_failure_cb:function(t){return this._sasl_success_handler&&(this.deleteHandler(this._sasl_success_handler),this._sasl_success_handler=null),this._sasl_challenge_handler&&(this.deleteHandler(this._sasl_challenge_handler),this._sasl_challenge_handler=null),this._sasl_mechanism&&this._sasl_mechanism.onFailure(),this._changeConnectStatus(a.Status.AUTHFAIL,null),!1},_auth2_cb:function(t){return"result"==t.getAttribute("type")?(this.authenticated=!0,this._changeConnectStatus(a.Status.CONNECTED,null)):"error"==t.getAttribute("type")&&(this._changeConnectStatus(a.Status.AUTHFAIL,null),this.disconnect("authentication failed")),!1},_addSysTimedHandler:function(t,e){var n=new a.TimedHandler(t,e);return n.user=!1,this.addTimeds.push(n),n},_addSysHandler:function(t,e,n,s,i){var r=new a.Handler(t,e,n,s,i);return r.user=!1,this.addHandlers.push(r),r},_onDisconnectTimeout:function(){return a.info("_onDisconnectTimeout was called"),this._proto._onDisconnectTimeout(),this._doDisconnect(),!1},_onIdle:function(){for(var t,e,n,s;this.addTimeds.length>0;)this.timedHandlers.push(this.addTimeds.pop());for(;this.removeTimeds.length>0;)e=this.removeTimeds.pop(),t=this.timedHandlers.indexOf(e),t>=0&&this.timedHandlers.splice(t,1);var i=(new Date).getTime();for(s=[],t=0;t<this.timedHandlers.length;t++)e=this.timedHandlers[t],(this.authenticated||!e.user)&&(n=e.lastCalled+e.period,0>=n-i?e.run()&&s.push(e):s.push(e));this.timedHandlers=s,clearTimeout(this._idleTimeout),this._proto._onIdle(),this.connected&&(this._idleTimeout=setTimeout(this._onIdle.bind(this),100))}},a.SASLMechanism=function(t,e,n){this.name=t,this.isClientFirst=e,
    this.priority=n},a.SASLMechanism.prototype={test:function(t){return!0},onStart:function(t){this._connection=t},onChallenge:function(t,e){throw new Error("You should implement challenge handling!")},onFailure:function(){this._connection=null},onSuccess:function(){this._connection=null}},a.SASLAnonymous=function(){},a.SASLAnonymous.prototype=new a.SASLMechanism("ANONYMOUS",!1,10),a.SASLAnonymous.test=function(t){return null===t.authcid},a.Connection.prototype.mechanisms[a.SASLAnonymous.prototype.name]=a.SASLAnonymous,a.SASLPlain=function(){},a.SASLPlain.prototype=new a.SASLMechanism("PLAIN",!0,20),a.SASLPlain.test=function(t){return null!==t.authcid},a.SASLPlain.prototype.onChallenge=function(t){var e=t.authzid;return e+="\x00",e+=t.authcid,e+="\x00",e+=t.pass},a.Connection.prototype.mechanisms[a.SASLPlain.prototype.name]=a.SASLPlain,a.SASLSHA1=function(){},a.SASLSHA1.prototype=new a.SASLMechanism("SCRAM-SHA-1",!0,40),a.SASLSHA1.test=function(t){return null!==t.authcid},a.SASLSHA1.prototype.onChallenge=function(s,i,r){var o=r||n.hexdigest(1234567890*Math.random()),a="n="+s.authcid;return a+=",r=",a+=o,s._sasl_data.cnonce=o,s._sasl_data["client-first-message-bare"]=a,a="n,,"+a,this.onChallenge=function(n,s){for(var i,r,o,a,h,c,u,l,d,_,m,p="c=biws,",f=n._sasl_data["client-first-message-bare"]+","+s+",",g=n._sasl_data.cnonce,S=/([a-z]+)=([^,]+)(,|$)/;s.match(S);){var b=s.match(S);switch(s=s.replace(b[0],""),b[1]){case"r":i=b[2];break;case"s":r=b[2];break;case"i":o=b[2]}}if(i.substr(0,g.length)!==g)return n._sasl_data={},n._sasl_failure_cb();for(p+="r="+i,f+=p,r=e.decode(r),r+="\x00\x00\x00",a=c=t.core_hmac_sha1(n.pass,r),u=1;o>u;u++){for(h=t.core_hmac_sha1(n.pass,t.binb2str(c)),l=0;5>l;l++)a[l]^=h[l];c=h}for(a=t.binb2str(a),d=t.core_hmac_sha1(a,"Client Key"),_=t.str_hmac_sha1(a,"Server Key"),m=t.core_hmac_sha1(t.str_sha1(t.binb2str(d)),f),n._sasl_data["server-signature"]=t.b64_hmac_sha1(_,f),l=0;5>l;l++)d[l]^=m[l];return p+=",p="+e.encode(t.binb2str(d))}.bind(this),a},a.Connection.prototype.mechanisms[a.SASLSHA1.prototype.name]=a.SASLSHA1,a.SASLMD5=function(){},a.SASLMD5.prototype=new a.SASLMechanism("DIGEST-MD5",!1,30),a.SASLMD5.test=function(t){return null!==t.authcid},a.SASLMD5.prototype._quote=function(t){return'"'+t.replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"'},a.SASLMD5.prototype.onChallenge=function(t,e,s){for(var i,r=/([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/,o=s||n.hexdigest(""+1234567890*Math.random()),a="",h=null,c="",u="";e.match(r);)switch(i=e.match(r),e=e.replace(i[0],""),i[2]=i[2].replace(/^"(.+)"$/,"$1"),i[1]){case"realm":a=i[2];break;case"nonce":c=i[2];break;case"qop":u=i[2];break;case"host":h=i[2]}var l=t.servtype+"/"+t.domain;null!==h&&(l=l+"/"+h);var d=n.hash(t.authcid+":"+a+":"+this._connection.pass)+":"+c+":"+o,_="AUTHENTICATE:"+l,m="";return m+="charset=utf-8,",m+="username="+this._quote(t.authcid)+",",m+="realm="+this._quote(a)+",",m+="nonce="+this._quote(c)+",",m+="nc=00000001,",m+="cnonce="+this._quote(o)+",",m+="digest-uri="+this._quote(l)+",",m+="response="+n.hexdigest(n.hexdigest(d)+":"+c+":00000001:"+o+":auth:"+n.hexdigest(_))+",",m+="qop=auth",this.onChallenge=function(){return""}.bind(this),m},a.Connection.prototype.mechanisms[a.SASLMD5.prototype.name]=a.SASLMD5,{Strophe:a,$build:s,$msg:i,$iq:r,$pres:o,SHA1:t,Base64:e,MD5:n}}),function(t,e){return"function"==typeof define&&define.amd?void define("strophe-bosh",["strophe-core"],function(t){return e(t.Strophe,t.$build)}):e(Strophe,$build)}(this,function(t,e){return t.Request=function(e,n,s,i){this.id=++t._requestId,this.xmlData=e,this.data=t.serialize(e),this.origFunc=n,this.func=n,this.rid=s,this.date=NaN,this.sends=i||0,this.abort=!1,this.dead=null,this.age=function(){if(!this.date)return 0;var t=new Date;return(t-this.date)/1e3},this.timeDead=function(){if(!this.dead)return 0;var t=new Date;return(t-this.dead)/1e3},this.xhr=this._newXHR()},t.Request.prototype={getResponse:function(){var e=null;if(this.xhr.responseXML&&this.xhr.responseXML.documentElement){if(e=this.xhr.responseXML.documentElement,"parsererror"==e.tagName)throw t.error("invalid response received"),t.error("responseText: "+this.xhr.responseText),t.error("responseXML: "+t.serialize(this.xhr.responseXML)),"parsererror"}else this.xhr.responseText&&(t.error("invalid response received"),t.error("responseText: "+this.xhr.responseText),t.error("responseXML: "+t.serialize(this.xhr.responseXML)));return e},_newXHR:function(){var t=null;return window.XMLHttpRequest?(t=new XMLHttpRequest,t.overrideMimeType&&t.overrideMimeType("text/xml; charset=utf-8")):window.ActiveXObject&&(t=new ActiveXObject("Microsoft.XMLHTTP")),t.onreadystatechange=this.func.bind(null,this),t}},t.Bosh=function(t){this._conn=t,this.rid=Math.floor(4294967295*Math.random()),this.sid=null,this.hold=1,this.wait=60,this.window=5,this.errors=0,this._requests=[]},t.Bosh.prototype={strip:null,_buildBody:function(){var n=e("body",{rid:this.rid++,xmlns:t.NS.HTTPBIND});return null!==this.sid&&n.attrs({sid:this.sid}),this._conn.options.keepalive&&this._cacheSession(),n},_reset:function(){this.rid=Math.floor(4294967295*Math.random()),this.sid=null,this.errors=0,window.sessionStorage.removeItem("strophe-bosh-session")},_connect:function(e,n,s){this.wait=e||this.wait,this.hold=n||this.hold,this.errors=0;var i=this._buildBody().attrs({to:this._conn.domain,"xml:lang":"en",wait:this.wait,hold:this.hold,content:"text/xml; charset=utf-8",ver:"1.6","xmpp:version":"1.0","xmlns:xmpp":t.NS.BOSH});s&&i.attrs({route:s});var r=this._conn._connect_cb;this._requests.push(new t.Request(i.tree(),this._onRequestStateChange.bind(this,r.bind(this._conn)),i.tree().getAttribute("rid"))),this._throttledRequestHandler()},_attach:function(e,n,s,i,r,o,a){this._conn.jid=e,this.sid=n,this.rid=s,this._conn.connect_callback=i,this._conn.domain=t.getDomainFromJid(this._conn.jid),this._conn.authenticated=!0,this._conn.connected=!0,this.wait=r||this.wait,this.hold=o||this.hold,this.window=a||this.window,this._conn._changeConnectStatus(t.Status.ATTACHED,null)},_restore:function(e,n,s,i,r){var o=JSON.parse(window.sessionStorage.getItem("strophe-bosh-session"));if(!("undefined"!=typeof o&&null!==o&&o.rid&&o.sid&&o.jid)||"undefined"!=typeof e&&t.getBareJidFromJid(o.jid)!=t.getBareJidFromJid(e))throw{name:"StropheSessionError",message:"_restore: no restoreable session."};this._conn.restored=!0,this._attach(o.jid,o.sid,o.rid,n,s,i,r)},_cacheSession:function(){this._conn.authenticated?this._conn.jid&&this.rid&&this.sid&&window.sessionStorage.setItem("strophe-bosh-session",JSON.stringify({jid:this._conn.jid,rid:this.rid,sid:this.sid})):window.sessionStorage.removeItem("strophe-bosh-session")},_connect_cb:function(e){var n,s,i=e.getAttribute("type");if(null!==i&&"terminate"==i)return n=e.getAttribute("condition"),t.error("BOSH-Connection failed: "+n),s=e.getElementsByTagName("conflict"),null!==n?("remote-stream-error"==n&&s.length>0&&(n="conflict"),this._conn._changeConnectStatus(t.Status.CONNFAIL,n)):this._conn._changeConnectStatus(t.Status.CONNFAIL,"unknown"),this._conn._doDisconnect(n),t.Status.CONNFAIL;this.sid||(this.sid=e.getAttribute("sid"));var r=e.getAttribute("requests");r&&(this.window=parseInt(r,10));var o=e.getAttribute("hold");o&&(this.hold=parseInt(o,10));var a=e.getAttribute("wait");a&&(this.wait=parseInt(a,10))},_disconnect:function(t){this._sendTerminate(t)},_doDisconnect:function(){this.sid=null,this.rid=Math.floor(4294967295*Math.random()),window.sessionStorage.removeItem("strophe-bosh-session")},_emptyQueue:function(){return 0===this._requests.length},_hitError:function(e){this.errors++,t.warn("request errored, status: "+e+", number of errors: "+this.errors),this.errors>4&&this._conn._onDisconnectTimeout()},_no_auth_received:function(e){e=e?e.bind(this._conn):this._conn._connect_cb.bind(this._conn);var n=this._buildBody();this._requests.push(new t.Request(n.tree(),this._onRequestStateChange.bind(this,e.bind(this._conn)),n.tree().getAttribute("rid"))),this._throttledRequestHandler()},_onDisconnectTimeout:function(){this._abortAllRequests()},_abortAllRequests:function(){for(var t;this._requests.length>0;)t=this._requests.pop(),t.abort=!0,t.xhr.abort(),t.xhr.onreadystatechange=function(){}},_onIdle:function(){var e=this._conn._data;if(this._conn.authenticated&&0===this._requests.length&&0===e.length&&!this._conn.disconnecting&&(t.info("no requests during idle cycle, sending blank request"),e.push(null)),!this._conn.paused){if(this._requests.length<2&&e.length>0){for(var n=this._buildBody(),s=0;s<e.length;s++)null!==e[s]&&("restart"===e[s]?n.attrs({to:this._conn.domain,"xml:lang":"en","xmpp:restart":"true","xmlns:xmpp":t.NS.BOSH}):n.cnode(e[s]).up());delete this._conn._data,this._conn._data=[],this._requests.push(new t.Request(n.tree(),this._onRequestStateChange.bind(this,this._conn._dataRecv.bind(this._conn)),n.tree().getAttribute("rid"))),this._throttledRequestHandler()}if(this._requests.length>0){var i=this._requests[0].age();null!==this._requests[0].dead&&this._requests[0].timeDead()>Math.floor(t.SECONDARY_TIMEOUT*this.wait)&&this._throttledRequestHandler(),i>Math.floor(t.TIMEOUT*this.wait)&&(t.warn("Request "+this._requests[0].id+" timed out, over "+Math.floor(t.TIMEOUT*this.wait)+" seconds since last activity"),this._throttledRequestHandler())}}},_onRequestStateChange:function(e,n){if(t.debug("request id "+n.id+"."+n.sends+" state changed to "+n.xhr.readyState),n.abort)return void(n.abort=!1);var s;if(4==n.xhr.readyState){s=0;try{s=n.xhr.status}catch(i){}if("undefined"==typeof s&&(s=0),this.disconnecting&&s>=400)return void this._hitError(s);var r=this._requests[0]==n,o=this._requests[1]==n;(s>0&&500>s||n.sends>5)&&(this._removeRequest(n),t.debug("request id "+n.id+" should now be removed")),200==s?((o||r&&this._requests.length>0&&this._requests[0].age()>Math.floor(t.SECONDARY_TIMEOUT*this.wait))&&this._restartRequest(0),t.debug("request id "+n.id+"."+n.sends+" got 200"),e(n),this.errors=0):(t.error("request id "+n.id+"."+n.sends+" error "+s+" happened"),(0===s||s>=400&&600>s||s>=12e3)&&(this._hitError(s),s>=400&&500>s&&(this._conn._changeConnectStatus(t.Status.DISCONNECTING,null),this._conn._doDisconnect()))),s>0&&500>s||n.sends>5||this._throttledRequestHandler()}},_processRequest:function(e){var n=this,s=this._requests[e],i=-1;try{4==s.xhr.readyState&&(i=s.xhr.status)}catch(r){t.error("caught an error in _requests["+e+"], reqStatus: "+i)}if("undefined"==typeof i&&(i=-1),s.sends>this._conn.maxRetries)return void this._conn._onDisconnectTimeout();var o=s.age(),a=!isNaN(o)&&o>Math.floor(t.TIMEOUT*this.wait),h=null!==s.dead&&s.timeDead()>Math.floor(t.SECONDARY_TIMEOUT*this.wait),c=4==s.xhr.readyState&&(1>i||i>=500);if((a||h||c)&&(h&&t.error("Request "+this._requests[e].id+" timed out (secondary), restarting"),s.abort=!0,s.xhr.abort(),s.xhr.onreadystatechange=function(){},this._requests[e]=new t.Request(s.xmlData,s.origFunc,s.rid,s.sends),s=this._requests[e]),0===s.xhr.readyState){t.debug("request id "+s.id+"."+s.sends+" posting");try{s.xhr.open("POST",this._conn.service,this._conn.options.sync?!1:!0),s.xhr.setRequestHeader("Content-Type","text/xml; charset=utf-8")}catch(u){return t.error("XHR open failed."),this._conn.connected||this._conn._changeConnectStatus(t.Status.CONNFAIL,"bad-service"),void this._conn.disconnect()}var l=function(){if(s.date=new Date,n._conn.options.customHeaders){var t=n._conn.options.customHeaders;for(var e in t)t.hasOwnProperty(e)&&s.xhr.setRequestHeader(e,t[e])}s.xhr.send(s.data)};if(s.sends>1){var d=1e3*Math.min(Math.floor(t.TIMEOUT*this.wait),Math.pow(s.sends,3));setTimeout(l,d)}else l();s.sends++,this._conn.xmlOutput!==t.Connection.prototype.xmlOutput&&this._conn.xmlOutput(s.xmlData.nodeName===this.strip&&s.xmlData.childNodes.length?s.xmlData.childNodes[0]:s.xmlData),this._conn.rawOutput!==t.Connection.prototype.rawOutput&&this._conn.rawOutput(s.data)}else t.debug("_processRequest: "+(0===e?"first":"second")+" request has readyState of "+s.xhr.readyState)},_removeRequest:function(e){t.debug("removing request");var n;for(n=this._requests.length-1;n>=0;n--)e==this._requests[n]&&this._requests.splice(n,1);e.xhr.onreadystatechange=function(){},this._throttledRequestHandler()},_restartRequest:function(t){var e=this._requests[t];null===e.dead&&(e.dead=new Date),this._processRequest(t)},_reqToData:function(t){try{return t.getResponse()}catch(e){if("parsererror"!=e)throw e;this._conn.disconnect("strophe-parsererror")}},_sendTerminate:function(e){t.info("_sendTerminate was called");var n=this._buildBody().attrs({type:"terminate"});e&&n.cnode(e.tree());var s=new t.Request(n.tree(),this._onRequestStateChange.bind(this,this._conn._dataRecv.bind(this._conn)),n.tree().getAttribute("rid"));this._requests.push(s),this._throttledRequestHandler()},_send:function(){clearTimeout(this._conn._idleTimeout),this._throttledRequestHandler(),this._conn._idleTimeout=setTimeout(this._conn._onIdle.bind(this._conn),100)},_sendRestart:function(){this._throttledRequestHandler(),clearTimeout(this._conn._idleTimeout)},_throttledRequestHandler:function(){t.debug(this._requests?"_throttledRequestHandler called with "+this._requests.length+" requests":"_throttledRequestHandler called with undefined requests"),this._requests&&0!==this._requests.length&&(this._requests.length>0&&this._processRequest(0),this._requests.length>1&&Math.abs(this._requests[0].rid-this._requests[1].rid)<this.window&&this._processRequest(1))}},t}),function(t,e){return"function"==typeof define&&define.amd?void define("strophe-websocket",["strophe-core"],function(t){return e(t.Strophe,t.$build)}):e(Strophe,$build)}(this,function(t,e){return t.Websocket=function(t){this._conn=t,this.strip="wrapper";var e=t.service;if(0!==e.indexOf("ws:")&&0!==e.indexOf("wss:")){var n="";n+="ws"===t.options.protocol&&"https:"!==window.location.protocol?"ws":"wss",n+="://"+window.location.host,n+=0!==e.indexOf("/")?window.location.pathname+e:e,t.service=n}},t.Websocket.prototype={_buildStream:function(){return e("open",{xmlns:t.NS.FRAMING,to:this._conn.domain,version:"1.0"})},_check_streamerror:function(e,n){var s;if(s=e.getElementsByTagNameNS?e.getElementsByTagNameNS(t.NS.STREAM,"error"):e.getElementsByTagName("stream:error"),0===s.length)return!1;for(var i=s[0],r="",o="",a="urn:ietf:params:xml:ns:xmpp-streams",h=0;h<i.childNodes.length;h++){var c=i.childNodes[h];if(c.getAttribute("xmlns")!==a)break;"text"===c.nodeName?o=c.textContent:r=c.nodeName}var u="WebSocket stream error: ";return u+=r?r:"unknown",o&&(u+=" - "+r),t.error(u),this._conn._changeConnectStatus(n,r),this._conn._doDisconnect(),!0},_reset:function(){},_connect:function(){this._closeSocket(),this.socket=new WebSocket(this._conn.service,"xmpp"),this.socket.onopen=this._onOpen.bind(this),this.socket.onerror=this._onError.bind(this),this.socket.onclose=this._onClose.bind(this),this.socket.onmessage=this._connect_cb_wrapper.bind(this)},_connect_cb:function(e){var n=this._check_streamerror(e,t.Status.CONNFAIL);return n?t.Status.CONNFAIL:void 0},_handleStreamStart:function(e){var n=!1,s=e.getAttribute("xmlns");"string"!=typeof s?n="Missing xmlns in <open />":s!==t.NS.FRAMING&&(n="Wrong xmlns in <open />: "+s);var i=e.getAttribute("version");return"string"!=typeof i?n="Missing version in <open />":"1.0"!==i&&(n="Wrong version in <open />: "+i),n?(this._conn._changeConnectStatus(t.Status.CONNFAIL,n),this._conn._doDisconnect(),!1):!0},_connect_cb_wrapper:function(e){if(0===e.data.indexOf("<open ")||0===e.data.indexOf("<?xml")){var n=e.data.replace(/^(<\?.*?\?>\s*)*/,"");if(""===n)return;var s=(new DOMParser).parseFromString(n,"text/xml").documentElement;this._conn.xmlInput(s),this._conn.rawInput(e.data),this._handleStreamStart(s)&&this._connect_cb(s)}else if(0===e.data.indexOf("<close ")){this._conn.rawInput(e.data),this._conn.xmlInput(e);var i=e.getAttribute("see-other-uri");i?(this._conn._changeConnectStatus(t.Status.REDIRECT,"Received see-other-uri, resetting connection"),this._conn.reset(),this._conn.service=i,this._connect()):(this._conn._changeConnectStatus(t.Status.CONNFAIL,"Received closing stream"),this._conn._doDisconnect())}else{var r=this._streamWrap(e.data),o=(new DOMParser).parseFromString(r,"text/xml").documentElement;this.socket.onmessage=this._onMessage.bind(this),this._conn._connect_cb(o,null,e.data)}},_disconnect:function(n){if(this.socket&&this.socket.readyState!==WebSocket.CLOSED){n&&this._conn.send(n);var s=e("close",{xmlns:t.NS.FRAMING});this._conn.xmlOutput(s);var i=t.serialize(s);this._conn.rawOutput(i);try{this.socket.send(i)}catch(r){t.info("Couldn't send <close /> tag.")}}this._conn._doDisconnect()},_doDisconnect:function(){t.info("WebSockets _doDisconnect was called"),this._closeSocket()},_streamWrap:function(t){return"<wrapper>"+t+"</wrapper>"},_closeSocket:function(){if(this.socket)try{this.socket.close()}catch(t){}this.socket=null},_emptyQueue:function(){return!0},_onClose:function(){this._conn.connected&&!this._conn.disconnecting?(t.error("Websocket closed unexcectedly"),this._conn._doDisconnect()):t.info("Websocket closed")},_no_auth_received:function(e){t.error("Server did not send any auth methods"),this._conn._changeConnectStatus(t.Status.CONNFAIL,"Server did not send any auth methods"),e&&(e=e.bind(this._conn))(),this._conn._doDisconnect()},_onDisconnectTimeout:function(){},_abortAllRequests:function(){},_onError:function(e){t.error("Websocket error "+e),this._conn._changeConnectStatus(t.Status.CONNFAIL,"The WebSocket connection could not be established was disconnected."),this._disconnect()},_onIdle:function(){var e=this._conn._data;if(e.length>0&&!this._conn.paused){for(var n=0;n<e.length;n++)if(null!==e[n]){var s,i;s="restart"===e[n]?this._buildStream().tree():e[n],i=t.serialize(s),this._conn.xmlOutput(s),this._conn.rawOutput(i),this.socket.send(i)}this._conn._data=[]}},_onMessage:function(e){var n,s,i='<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';if(e.data===i)return this._conn.rawInput(i),this._conn.xmlInput(e),void(this._conn.disconnecting||this._conn._doDisconnect());if(0===e.data.search("<open ")){if(n=(new DOMParser).parseFromString(e.data,"text/xml").documentElement,!this._handleStreamStart(n))return}else s=this._streamWrap(e.data),n=(new DOMParser).parseFromString(s,"text/xml").documentElement;return this._check_streamerror(n,t.Status.ERROR)?void 0:this._conn.disconnecting&&"presence"===n.firstChild.nodeName&&"unavailable"===n.firstChild.getAttribute("type")?(this._conn.xmlInput(n),void this._conn.rawInput(t.serialize(n))):void this._conn._dataRecv(n,e.data)},_onOpen:function(){t.info("Websocket open");var e=this._buildStream();this._conn.xmlOutput(e.tree());var n=t.serialize(e);this._conn.rawOutput(n),this.socket.send(n)},_reqToData:function(t){return t},_send:function(){this._conn.flush()},_sendRestart:function(){clearTimeout(this._conn._idleTimeout),this._conn._onIdle.bind(this._conn)()}},t}),t?t(Strophe,$build,$msg,$iq,$pres):void 0}(function(t,e,n,s,i){window.Strophe=t,window.$build=e,window.$msg=n,window.$iq=s,window.$pres=i});


    //-------------------------------------------------------
    //
    //  openfire
    //
    //-------------------------------------------------------

    window.addEventListener("load", function()
    {
        vapidGetPublicKey();

        of.connect(function(user)
        {
            console.log(user + " is connected to openfire");
            of.connection.send($pres());

            of.connection.addHandler(function(message)
            {
                console.log('onMessage', message);

                $(message).find('x').each(function()
                {
                    var xmlns = $(this).attr("xmlns");
                    var from = $(message).attr("from");
                    var offerer = Strophe.getBareJidFromJid(from);
                    var reason = "Meeting?"

                    if (xmlns == "jabber:x:conference")
                    {
                        $(message).find('invite').each(function()
                        {
                            offerer = $(this).attr('from');
                        });

                        $(message).find('reason').each(function()
                        {
                            reason = $(this).text();
                        });

                        var roomJid = $(this).attr("jid");
                        reason = $(this).attr('reason');
                        room = Strophe.getNodeFromJid(roomJid);
                        var url = location.protocol + "//" + location.host + "/ofmeet/" + room;
                        var path = location.pathname.split("/")[1];
                        var iconUrl = location.protocol + "//" + location.host + "/" + path + "/favicon.png";

                        var notification = new Notification(offerer, {body: reason, icon: iconUrl});

                        notification.onclick = function(event)
                        {
                            event.preventDefault();
                            window.open(url, '_blank');
                        };
                    }
                });

                return true;

            }, 'http://jabber.org/protocol/workgroup', 'message');
        });

        Notification.requestPermission().then(function(result)
        {
          console.log("Notification.requestPermission", result);
        });
    });

    function vapidGetPublicKey()
    {
        console.log("vapidGetPublicKey");

        var path = location.pathname.split("/")[1];
        var getUrl = location.protocol + "//" + location.host + "/" + path + "/webpush/publickey";

        fetch(getUrl, {method: "GET", headers: {"Accept":"application/json", "Content-Type":"application/json"}}).then(function(response) {return response.json()}).then(function(vapid)
        {
            if (vapid.publicKey)
            {
                console.log("vapidGetPublicKey found", vapid);
                of.publicKey = vapid.publicKey;
                registerServiceWorker();
            } else {
                console.warn("no web push, vapid public key not available");
            }

        }).catch(function (err) {
            console.error('vapidGetPublicKey error!', err);
        });
    }

    function registerServiceWorker()
    {
        if ('serviceWorker' in navigator)
        {
            var path = location.pathname.split("/")[1];
            var swUrl = location.protocol + "//" + location.host + "/" + path + "/js/sw.js";
            navigator.serviceWorker.register(swUrl).then(initialiseState);

        } else {
            console.warn('Service workers are not supported in this browser.');
        }
    }

    function initialiseState()
    {
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.warn('Notifications aren\'t supported.');
            return;
        }

        if (Notification.permission === 'denied') {
            console.warn('The user has blocked notifications.');
            return;
        }

        if (!('PushManager' in window)) {
            console.warn('Push messaging isn\'t supported.');
            return;
        }

        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration)
        {
            serviceWorkerRegistration.pushManager.getSubscription().then(function (subscription)
            {
                if (!subscription) {
                    if (of.publicKey) subscribe(of.publicKey);
                    return;
                }

                // Keep your server in sync with the latest subscriptionId
                sendSubscriptionToServer(subscription);
            })
            .catch(function(err) {
                console.warn('Error during getSubscription()', err);
            });
        });
    }

    function subscribe(publicKeyString) {
        const publicKey = base64UrlToUint8Array(publicKeyString);

        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration)
        {
            serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey
            })
            .then(function (subscription) {
                return sendSubscriptionToServer(subscription);
            })
            .catch(function (e) {
                if (Notification.permission === 'denied') {
                    console.warn('Permission for Notifications was denied');
                } else {
                    console.error('Unable to subscribe to push.', e);
                }
            });
        });
    }

    function base64UrlToUint8Array(base64UrlData)
    {
        const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
        const base64 = (base64UrlData + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = atob(base64);
        const buffer = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            buffer[i] = rawData.charCodeAt(i);
        }

        return buffer;
    }

    function sendSubscriptionToServer(subscription) {
        var key = subscription.getKey ? subscription.getKey('p256dh') : '';
        var auth = subscription.getKey ? subscription.getKey('auth') : '';

        var subscriptionString = JSON.stringify(subscription);  // TODO

        console.log("web push subscription", {
            endpoint: subscription.endpoint,
            key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : '',
            auth: auth ? btoa(String.fromCharCode.apply(null, new Uint8Array(auth))) : ''
        }, subscription);

        var path = location.pathname.split("/")[1];
        var postUrl = location.protocol + "//" + location.host + "/" + path + "/webpush/subscribe";

        return fetch(postUrl,
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(subscription)
        });
    }

    of.connect = function(connected, disconnected)
    {
        var protocol = location.protocol == "http" ? "ws" : "wss";
        of.connection = new Strophe.Connection(protocol + "://" + location.host + "/ws/");

        of.connection.connect(location.hostname, null, function (status)
        {
            if (status === Strophe.Status.CONNECTED)
            {
                if (connected) connected(latkeConfig.userName);
            }
            else

            if (status === Strophe.Status.DISCONNECTED)
            {
                if (disconnected) disconnected();
            }
        });
    };

    of.getJid = function()
    {
        if (of.connection.disconnected)
        {
            of.connect(function(user)
            {
                console.log(user + " is re-connected to openfire");
                of.connection.send($pres());
            });
        }

        return of.connection.jid;
    };

    of.disconnect = function()
    {
        of.connection.disconnect();
    };

    of.upload = function(file, callback, errorback)
    {
        var iq = $iq({type: 'get', to: "openfire." + of.connection.domain}).c('request', {xmlns: "urn:xmpp:http:upload:0"}).c('filename').t(file.name).up().c('size').t(file.size);
        var getUrl = null;
        var putUrl = null;
        var errorText = null;

        of.connection.sendIQ(iq, function(response)
        {
            $(response).find('slot').each(function()
            {
                $(response).find('put').each(function()
                {
                    putUrl = $(this).text();
                });

                $(response).find('get').each(function()
                {
                    getUrl = $(this).text();
                });

                console.log("openfire.uploadFile", putUrl);

                if (putUrl != null & getUrl != null)
                {
                    var req = new XMLHttpRequest();

                    req.onreadystatechange = function()
                    {
                      if (this.readyState == 4 && this.status >= 200 && this.status < 400)
                      {
                        console.log("openfire.ok", this.statusText);
                        if (callback) callback(getUrl, file);
                      }
                      else

                      if (this.readyState == 4 && this.status >= 400)
                      {
                        console.error("openfire.error", this.statusText);
                        if (errorback) errorback(this.statusText, file);
                      }

                    };
                    req.open("PUT", putUrl, true);
                    req.send(file);
                }
            });

        }, function(error) {

            $(error).find('text').each(function()
            {
                errorText = $(this).text();
                console.log("openfire.uploadFile error", errorText);
                if (errorback) errorback(errorText, file);
            });
        });
    };

    return of;

}(openfire || {}));