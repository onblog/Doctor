$(function () {
    //监听用户反馈
    $(".feedbackBox_btn").click(function () {
        $(".feedbackBox_wrap").animate({width:'248px'},"1"); //width("248px");
    })
    //关闭反馈
    $(".feedbackBox_hide").click(function () {
        $(".feedbackBox_wrap").animate({width:'0'},"500");
    })
    //提交反馈
    $("#tjfk").click(function () {
        if ( $("#feedback_content").val().length<1){
            layer.tips('啥也没写', '#feedback_content');
            return;
        }
        var myReg=/^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/;
        if (!myReg.test($("#feedback_email").val())){
            layer.tips('邮箱格式不对', '#feedback_email');
            return;
        }
        //反馈成功
        $(".feedbackBox_write").hide();
        $(".feedbackBox_success").animate({margin:'0px'},"500")//css("margin-left","0px")
        var t = function () {
            $(".feedbackBox_success").animate({margin: '0 0 0 -300px'}, "500")//css("margin-left","-300px")
        };
        $(".feedbackBox_hide").click(t);
    })
})