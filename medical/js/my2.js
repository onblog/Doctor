$(function () {
    //初始化个人信息
    if (GetQueryString("sex")!=null&&GetQueryString("sex").length>0) {
        $("#s2_sex_show").text(GetQueryString("sex"));
    }
    if (GetQueryString("age")!=null&&GetQueryString("sex").length>0) {
        $("#s2_age_show").text(GetQueryString("age"));
    }
    if (GetQueryString("job")!=null&&GetQueryString("sex").length>0) {
        $("#s2 > div > div.myBox2 > div.workBox > div.workSelect > input").val(GetQueryString("job"));
    }
    if (GetQueryString("sex")=="女"){
        $("#femaleMapBtn,#femaleMapFront,#femaleMapBack").show();
        $("#maleMapBtn,#maleMapFront,#maleMapBack").hide()
    }
    //点击监听身体某部位后
    $("#mapBox a").click(function () {
        //清空缓存内容
        $("#mapSearResult").html("");
        //清空缓存内容
        $(".myB312Order a").each(function () {
            $(this).attr("class", "");
        })
        //弹出症状列表
        $(".myBox2_2").hide();
        $(".myBox3_12").show();
        //加载动画
        $("#letterLoading").show();
        //标题
        var val = $(this).attr("v");
        $("div.myB312_top > strong").attr("v", val);
        $("div.myB312_top > strong").text(val + "症状");
        //异步加载症状
        $.ajax({
            url: host+"/part",
            data: "word=" + val,
            async: true,
            dataType: "json",
            type: "post",
            success: function (d) {
                var data = d;
                //检测是否为空
                if (data.length<1){
                    layer.alert('数据库暂无该部位相关疾病，请等待管理员添加！', {
                        skin: 'layui-layer-molv'
                        ,closeBtn: 0
                        ,anim: 0 //动画类型
                    });
                }
                //渲染表格
                var table = "<tbody>";
                $.each(data, function (index, item) {
                    if (index % 4 == 0) {
                        table += "<tr>";
                    }
                    table += "<td class=\"\"><a href=\"javascript:void(0);\" target=\"_self\" class=\"stepthree\">" + filterString(item.name) + "</a></td>";
                    if ((index + 1) % 4 == 0 || index == data.length - 1) {
                        table += "</tr>";
                    }
                })
                table += "</tbody>";
                //关闭动画
                $("#letterLoading").hide();
                //渲染
                $("#mapSearResult").html(table);
            }
        });
    })

    //监听点击全部症状后
    //默认加载动画
    $("#goToAllSymBtn").click(function () {
        var w = $("#symList > li:nth-child(1) > a").text();
        //清空缓存内容
        $(".myB312Order a").each(function () {
            $(this).attr("class", "");
        })
        loadEvent(w);
    });

    //只用于渲染全部症状的面板
    function loadEvent(word) {
        //清空缓存内容
        $("#allBodySymList").html("");
        //加载动画
        $("#bodyLoading").show();
        //请求数据
        $.ajax({
            url: host+"/part",
            data: "word=" + word,
            async: true,
            dataType: "json",
            type: "post",
            success: function (d) {
                //关闭加载动画
                $("#bodyLoading").hide();
                var data = d;
                //渲染表格
                var ul = "";
                $.each(data, function (index, item) {
                    ul += "<li><a style=\"padding: 0 20px;\" href=\"javascript:void(0);\" target=\"_self\" class=\"stepthree\">" + filterString(item.name) + "</a></li>";
                })
                $("#allBodySymList").html(ul);
            }
        });

    }

    //监听列表点击事件
    //切换视图
    $("#symList a").click(function () {
        $("#symList a").each(function () {
            $(this).attr("class", "");
        });
        $(this).attr("class", "select");
        loadEvent($(this).text())
    });

    //监听点击事件
    //跳转到第三步
    $("#mapSearResult,#allBodySymList,#searchHints").on("click", ".stepthree", function () {
        //loading层
        layer.msg('加载中', {
            icon: 16
            ,shade: 0.01
        });
        var sex = $("#s2_sex_show").text();
        var age = $("#s2_age_show").text();
        var job = $("#s2 > div > div.myBox2 > div.workBox > div.workSelect > input").val();
        window.location.href = "./index_3.html?sex="+sex+"&age="+age+"&job="+job+"&word="+$(this).text();
    });

    //字母排序
    //点击监听
    $(".myB312Order a").on('click', function () {
        //清空内容
        $("#mapSearResult").html("");
        //加载动画
        $("#letterLoading").show();
        //字母样式切换
        $(".myB312Order a").each(function () {
            $(this).attr("class", "");
        })
        $(this).attr("class", "on");
        //字母参数
        var zm = $(this).text();
        //再次请求再次加载症状
        //加载症状
        $.ajax({
            url: host+"/part",
            data: "word=" + $("div.myB312_top > strong").attr("v") + "&zm=" + zm,
            async: true,
            dataType: "json",
            type: "post",
            success: function (d) {
                //关闭加载动画
                $("#letterLoading").hide();
                var data = d
                //渲染表格
                var table = "<tbody>";
                $.each(data, function (index, item) {
                    if (index % 4 == 0) {
                        table += "<tr>";
                    }
                    table += "<td class=\"\"><a href=\"javascript:void(0);\" target=\"_self\" class=\"stepthree\">" + filterString(item.name) + "</a></td>";
                    if ((index + 1) % 4 == 0 || index == data.length - 1) {
                        table += "</tr>";
                    }
                })
                table += "</tbody>";
                $("#mapSearResult").html(table);
            }
        });
    })

    //监听输入框变化
    //根据症状词实时检索
    $("#searchWord").bind("input propertychange change",function(event){
        var word = $(this).val().toString().trim();
        if (word==null || word.length==0){
            return;
        }
        //异步加载
        $.ajax({
            url: host+"/match",
            data: "word=" + word,
            async: true,
            dataType: "json",
            type: "post",
            success: function (data) {
                var d = data;
                var txt = "";
                $.each(d,function (index,item) {
                    if (index<8){
                        txt += '<a href="javascript:void(0);" target="_self" class="stepthree" >'+filterString(item.name)+"</a>";
                    }
                });
                $("#searchHints").css("display","block").html(txt);
            }
        });
    });

});

/**
 * 获取URL参数
 * @param name
 * @returns {*}
 * @constructor
 */
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);//此处解码为decodeURI()
    return null;
}

/**
 * 过滤字符串乱码
 * @param str
 * @returns {*}
 */
function filterString(str) {
    switch (str){
        case "一过性意识蒙�":
            str = "一过性意识蒙眬";
            break;
        case "干��音":
            str = "干啰音";
            break;
        case "湿��音":
            str = "湿啰音";
            break;
        case "肺部��音":
            str = "肺部啰音";
            break;
        case "鼻�Z":
            str = "鼻衂";
            break;
        case "�N动脉搏动减弱或消失":
            str = "腘动脉搏动减弱或消失";
            break;
        case "��音":
            str = "啰音";
            break;
    }
    return str;
}