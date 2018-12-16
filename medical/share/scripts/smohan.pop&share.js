;(function ($) {
    $.fn.SmohanPopLayer = function (options) {
        var Config = {Shade: true, Event: "click", Content: "Content", Title: "Smohan.net"};
        var options = $.extend(Config, options);
        var layer_width = $('#' + options.Content).outerWidth(true);
        var layer_height = $('#' + options.Content).outerHeight(true)
        var layer_top = (layer_height + 40) / 2;
        var layer_left = (layer_width + 40) / 2;
        var load_left = (layer_width - 36) / 2;
        var load_top = (layer_height - 100) / 2;
        var layerhtml = "";
        if (options.Shade == true) {
            layerhtml += '<div class="Smohan_Layer_Shade" style="display:none;"></div>';
        }
        layerhtml += '<div class="Smohan_Layer_box" style="width:' + layer_width + 'px;height:' + layer_height + 'px; margin-top:-' + layer_top + 'px;margin-left:-' + layer_left + 'px;display:none;" id="layer_' + options.Content + '">';
        layerhtml += '<h3><b class="text">' + options.Title + '</b><a href="javascript:void(0)" class="close"></a></h3>';
        layerhtml += '<div class="layer_content">';
        layerhtml += '<div class="loading" style="left:' + load_left + 'px;top:' + load_top + 'px;"></div>';
        layerhtml += '<div id="' + options.Content + '" style="display:block;">' + $("#" + options.Content).html() + '</div>';
        layerhtml += '</div>';
        layerhtml += '</div>';
        $('body').prepend(layerhtml);
        if (options.Event == "unload") {
            $('#layer_' + options.Content).animate({
                opacity: 'show',
                marginTop: '-' + layer_top + 'px'
            }, "slow", function () {
                $('.Smohan_Layer_Shade').show();
                $('.Smohan_Layer_box .loading').hide();
            });
        } else {
            $(this).live(options.Event, function (e) {
                $('#layer_' + options.Content).animate({
                    opacity: 'show',
                    marginTop: '-' + layer_top + 'px'
                }, "fast", function () {
                    $('.Smohan_Layer_Shade').show();
                    $('.Smohan_Layer_box .loading').hide();
                });
            });
        }
        $('.Smohan_Layer_box .close').click(function (e) {
            $('.Smohan_Layer_box').animate({opacity: 'hide', marginTop: '-300px'}, "fast", function () {
                $('.Smohan_Layer_Shade').hide();
                $('.Smohan_Layer_box .loading').show();
            });
        });
    };
})(jQuery);
$(document).ready(function (e) {
    var share_html = "";
    share_html += '<div id="Share"><ul>';
    share_html += '<li title="分享到QQ空间"><a href="javascript:void(0)" class="share1"></a><span></span></li>';
    share_html += '<li title="分享到微信"><a href="javascript:void(0)" class="share6"></a><span></span></li>';
    share_html += '<li title="分享到新浪微博"><a href="javascript:void(0)" class="share2"></a><span></span></li>';
    share_html += '<li title="分享到人人网"><a href="javascript:void(0)" class="share3" ></a><span></span></li>';
    share_html += '<li title="分享到朋友网"><a href="javascript:void(0)" class="share4"></a><span></span></li>';
    share_html += '<li title="分享到腾讯微博"><a href="javascript:void(0)" class="share5"></a><span></span></li>';
    share_html += '</ul></div>';
    $('body').prepend(share_html);
    (!!$(".qrcode").length || $('body').append($('<div id="qrcode" class="qrcode none"></div>')))
    $('.share').SmohanPopLayer({Shade: true, Event: 'click', Content: 'Share', Title: '分享本站到各大社区'});
    $('#Share li').each(function () {
        $(this).hover(function (e) {
            $(this).find('a').animate({marginTop: 2}, 'easeInOutExpo');
            $(this).find('span').animate({opacity: 0.2}, 'easeInOutExpo');
        }, function () {
            $(this).find('a').animate({marginTop: 12}, 'easeInOutExpo');
            $(this).find('span').animate({opacity: 1}, 'easeInOutExpo');
        });
    });
    var share_url = encodeURIComponent(location.href);
    var share_title = encodeURIComponent(document.title);
    var share_pic = "http://www.jq22.com/img/cs/500x300b.png";
    var share_from = encodeURIComponent("jQuery插件库");
    $('#Share li a.share1').click(function (e) {
        window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + share_url + "&title=" + share_title + "&pics=" + share_pic + "&site=" + share_from + "", "newwindow");
    });
    $('#Share li a.share2').click(function (e) {
        var param = {
            url: share_url,
            appkey: '678438995',
            title: share_title,
            pic: share_pic,
            ralateUid: '3061825921',
            rnd: new Date().valueOf()
        }
        var temp = [];
        for (var p in param) {
            temp.push(p + '=' + encodeURIComponent(param[p] || ''))
        }
        window.open('http://v.t.sina.com.cn/share/share.php?' + temp.join('&'));
    });
    $('#Share li a.share3').click(function (e) {
        window.open('http://widget.renren.com/dialog/share?resourceUrl=' + share_url + '&title=' + share_title + '&images=' + share_pic + '', 'newwindow');
    });
    $('#Share li a.share4').click(function (e) {
        window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&url=' + share_url + '&pics=' + share_pic + '&title=' + share_title + '&site=' + share_from + '', 'newwindow');
    });
    $('#Share li a.share5').click(function (e) {
        window.open('http://share.v.t.qq.com/index.php?c=share&a=index&title=' + share_title + '&site=' + share_from + '&pic=' + share_pic + '&url=' + share_url + '', 'newwindow');
    });
    $('#Share li a.share6').click(function (e) {
        if (!$('#qrcode img').length) {
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                text: location.href,
                width: 180,
                height: 180,
                colorDark: "#7CBDD0",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        !!$('.qrcode_msg').length || $("#qrcode").append('<p class="t_c qrcode_msg">点击右上角【...】开始分享</p><a class="weixin_close" href="javascript:;">暂不分享</a>')
        $('.Smohan_Layer_box').animate({'margin-top': '-200px',}).fadeOut(300)
        $("#qrcode").fadeIn(0);
    });
});
$(document).delegate(".weixin_close", 'click', function () {
    $('.qrcode,.Smohan_Layer_Shade').fadeOut(300);
})