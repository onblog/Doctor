$(function () {
    $("#startToDiagnosis").click(function () {
        //loading层
        layer.msg('加载中', {
            icon: 16
            ,shade: 0.01
        });
        var sex = $(".radioEd").text();
        var age = $("#s1_age_show").text();
        var job = $("#s1 > div > div.myBox1 > div.myTab.myTab1 > div.myCon > div.workBox > div.workSelect > input").val();
        window.location.href = "./index_2.html?sex="+sex+"&age="+age+"&job="+job;
    })
})