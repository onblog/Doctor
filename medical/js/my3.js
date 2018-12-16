$(function () {
    //初始化个人信息
    if (GetQueryString("sex")!=null&&GetQueryString("sex").length>0) {
        $("#s3_sex_show").text(GetQueryString("sex"));
    }
    if (GetQueryString("age")!=null&&GetQueryString("age").length>0) {
        $("#s3_age_show").text(GetQueryString("age"));
    }
    if (GetQueryString("job")!=null&&GetQueryString("job").length>0) {
        $("#s3_job_show").val(GetQueryString("job"));
    }
    //全部重选
    $("#reselectAll").click(function () {
        window.location.href="../index_2.html?sex="+$("#s3_sex_show").text()+"&age="+$("#s3_age_show").text()+"&job="+$("#s3_job_show").val();
    });
    //重新自查
    $("#restart").click(function () {
        window.location.href="../index.html";
    });
    //初始化选择的症状
    if (GetQueryString("word")!=null&&GetQueryString("word").length>0) {
        var word = GetQueryString("word");
        word = "<li class=\"default\"><span>"+word+"</span></li>";
        $("#my3_s1").append(word);
    }

    //初始化全部症状
    loadSymptom();

    //监听症状词添加
    $(".my_2l").on("click",".xgzz",function () {
        //动态添加已选择症状
        var word = $(this).text();
        word = "<li class=\"default\"><span>"+word+"</span></li>";
        $("#my3_s1").append(word);
        $(this).parent().hide();
        //更新全部症状
        loadSymptom();
    })

    //监听个人信息的改变
    $("#s3_sex_show,#s3_age_show").bind('DOMNodeInserted', function(e) {
        // alert(' element now contains: ' +$(e.target).text());
        //更新全部症状
        loadSymptom();
    })

});

/**
 * 获取URL参数
 * @param name
 */
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);//此处解码为decodeURI()
    return null;
}

/**
 * 发送终极请求
 */
function loadSymptom() {
    //加载动画
    $("#resultLoading").show();
    $("#relatedSymLoading").show();
    //清空缓存
    $(".myResult").html("");
    $(".my_2l").html("");
    //封装年龄
    var age = $("#s3_age_show").text();
    var agelist = [];
    if (age.indexOf("~")!=-1&&age.indexOf("岁")!=-1){
        agelist=[20,60];
    }else if (age.indexOf("65岁")!=-1){
        agelist=[65,100];
    }else {
        agelist=[1,10];
    }
    //封装症状词
    var arrayObj = new Array();
    $("#my3_s1 span").each(function () {
        arrayObj.push($(this).text());
    });
    //封装请求实体
    var json ={
        "sex":$("#s3_sex_show").text(),
        "age":agelist,
        "job":$("#s3_job_show").val(),
        "symptom":arrayObj
    };
    $.ajax({
        url: host+"/anaylze",
        data: JSON.stringify(json),
        async: true,
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        type: "POST",
        success: function (d) {
            //关闭加载动画
            $("#resultLoading").hide()
            $("#relatedSymLoading").hide()
            var data = d;
            //检测是否为空
            if (data.MEDICAL.length<1){
                layer.alert('根据您提供的个人信息,经系统分析后暂无相关疾病符合！',{
                    skin: 'layui-layer-molv'
                    ,closeBtn: 0
                    ,anim: 0 //动画类型
                });
            }
            var li = "";
            //更新相关症状列表
            $.each(data.SYSPTOM,function (index,item) {
                li += "<li><i></i><a href=\"javascript:void(0);\" target=\"_self\" class=\"xgzz\">"+filterString(item)+"</a></li>";
            });
            $(".my_2l").html(li)
            //更新症状详情列表
            li = "";
            $.each(data.MEDICAL,function (index,item) {
                li += "<li><span><span class='txt' intro=\""+item.intro+"\" cause='"+item.cause+"' diagnose='"+item.diagnose+"' cure='"+item.cure+"'prevent='"+item.prevent+"' complication='"+item.complication+"'symptom='"+item.symptom+"'></span></span></span>" +
                    "<strong><a href=\"javascript:void(0);\" class=\"myResult_title\" onclick='tab(this,1)'>"+item.name+"</a><span class=\"myResult_right\"> [<a href=\"javascript:void(0);\" onclick='tab(this,2)'>病因</a>] [<a href=\"javascript:void(0);\" onclick='tab(this,3)'>症状</a>] [<a href=\"javascript:void(0);\" onclick='tab(this,4)'>诊断</a>] [<a href=\"javascript:void(0);\" onclick='tab(this,5)'>并发症</a>] [<a href=\"javascript:void(0);\" onclick='tab(this,6)'>治疗</a>] [<a href=\"javascript:void(0);\" onclick='tab(this,7)'>预防</a>] </span></strong>" +
                    "<p>"+item.intro.substring(0,65)+"...[<a href=\"javascript:void(0);\" onclick='tab(this,1)'>查看详情</a>]</p> <div class=\"press\"><span>可能性：</span> <div class=\"pressBg\"><span class=\"pressColor\" style=\"width:"+item.score*100+"%;\"></span> </div><span id=\"graph\" onclick=\"graph('"+item.name+"')\">知识图谱</span> </div> </li>";
                $(".myResult").html(li);
            })
        }
    });
}

/**
 * 详情选项卡
 * @param obj
 * @param i
 */
function tab(obj,i) {
    var txt = $(obj).parents("li").find(".txt");
    layer.tab({
        area: ['68.2%', '80%'],
        tab: [{
            title: '简介',
            content: txtyh(txt,"intro")
        }, {
            title: '病因',
            content: txtyh(txt,"cause")
        }, {
            title: '症状',
            content: txtyh(txt,"symptom")
        }, {
            title: '诊断',
            content: txtyh(txt,"diagnose")
        }, {
            title: '并发症',
            content: txtyh(txt,"complication")
        }, {
            title: '治疗',
            content: txtyh(txt,"cure")
        }, {
            title: '预防',
            content: txtyh(txt,"prevent")
        }],
        anim: 1,
        closeBtn: 2,
        offset: '10%',
        shadeClose: true,
        shade: 0.2,
        success: function(layero){
            $(layero).find("span").each(function (index) {
                if (index+1==i){
                    $(this).attr("class","layui-this")
                }else {
                    $(this).attr("class","")
                }
            })
            $(".layui-layer-tabmain").find("li").each(function (index) {
                if (index+1==i){
                    $(this).attr("class","layui-layer-tabli layui-this")
                }else{
                    $(this).attr("class","layui-layer-tabli")
                }
            })
            layer.msg("点击其它区域可以关闭")//,{offset: 't'}
        }
    });
}

/**
 * 知识图谱
 * @param name
 */
function graph(name) {
    layer.open({
        type: 2,
        title: false, //不显示标题 false
        area: ['85%', '85%'],
        closeBtn: 0,
        offset: '10%',
        shadeClose: true,//点击阴影关闭
        shade: 0.2,
        content: './d3/index.html?name='+name,
        success: function(layero){
            layer.msg("点击其它区域可以关闭")
        }
    });
}

/**
 * 显示的详情文字
 * @param txt
 * @param word
 * @returns {*}
 */
function txtyh(txt,word) {
    var y = txt.attr(word)+" ";
    var x = y.replace(/\s+/g,"<br>&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\s+/g,"<br>&nbsp;&nbsp;&nbsp;&nbsp;");
    if (x.substring(0,4)=="<br>"){
        x = x.substring(4)
    }
    x = "<p id='word'><img src=\"./images/doctor.png\" style=\"float:right;height: 100%;\">"+x+"<br></p>";
    return x;
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