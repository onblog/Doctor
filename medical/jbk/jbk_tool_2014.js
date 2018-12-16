// JavaScript Document
$(function() {
    $(".radioBox a").click(function() {
        $(".radioBox a").removeClass("radioEd");
        $(this).addClass("radioEd");
        return false;
    });

    $(".selectJs").click(function() {
        $("div.select").hide();
        $(this).find(".select").show();
    });
    $(".selectJs .select a").click(function() {
        var newText=$(this).text();
        var oldText=$(this).parents(".selectJs").find("span").text();
        $(this).parents(".selectJs").find("span").text(newText);
        if(newText==oldText) {
            $(this).parents(".selectJs").attr("changed", "false");
        }
        else {
            $(this).parents(".selectJs").attr("changed", "true");
        }
        $(this).parent(".select").hide();
        if($(this).text()=="男") {
            $(".man_z,.man_b,.peopMan").show();
            $(".woman_z,.woman_b,.peopWoman").hide();
        } else if($(this).text()=="女") {
            $(".man_z,.man_b,.peopMan").hide();
            $(".woman_z,.woman_b,.peopWoman").show();
        };
        return false;
    });
    //$(".selectJs .select").mouseleave(function(){
    //		$(this).hide();
    //	});

    $(".workList a").click(function() {
        var newText=$(this).text();
        var oldText=$(".workText").val();
        $(".workText").val(newText).attr("disabled", "disabled");
        if(newText!=oldText) {
            $(this).closest(".workBox").attr("changed", "true");
        }
        else {
            $(this).closest(".workBox").attr("changed", "false");
        }
        $(".workForm").slideUp(200);
        return false;
    });
    $(".workList a.otherInput").click(function() {
        $(".workText").removeAttr("disabled").val("其它：");
        return false;
    });
    $(".workForm .close").bind("click", function() {
        $(".workForm").slideUp(200);
        return false;
    });
    $(document).bind("click", function(e) {
        var target=$(e.target);
        if(target.closest(".workBox").length==0) {
            $(".workForm").slideUp(200);
        };
        if(target.attr("id")!="searchWord") {
            $(".mySearList").hide();
        };
        if(target.closest(".selectJs").length==0) {
            $("div.select").hide();
        };
    });


    $(".workSelect").click(function() {
        $(this).parent().find(".workForm").slideDown(200);
    });

    $(".peopWoman").click(function() {
        $(".man_z,.man_b").show();
        $(".woman_z,.woman_b").hide();
        $(this).hide();
        $(".peopMan").show();
        $(this).parents(".myTool").find(".selectJs:first span").text("男");
        return false;
    });
    $(".peopMan").click(function() {
        $(".man_z,.man_b").hide();
        $(".woman_z,.woman_b").show();
        $(this).hide();
        $(".peopWoman").show();
        $(this).parents(".myTool").find(".selectJs:first span").text("女");
        return false;
    });

    $(".man_z>a,.man_b>a,.woman_z>a,.woman_b>a").css("position", "absolute");
    $(".man_z>a").hover(function() {
        var $aThis="man_z mz_b"+($(this).index()+1);
        $(".man_z").removeClass().addClass($aThis);
        return false;
    });
    $(".man_b>a").hover(function() {
        var $aThis="man_b mb_b"+($(this).index()+1);
        $(".man_b").removeClass().addClass($aThis);
        return false;
    });
    $(".man_b>a.mb71").hover(function() {
        $(".man_b").removeClass().addClass("man_b mb_b7");
        return false;
    });
    $(".woman_z>a").hover(function() {
        var $aThis="woman_z wmz_b"+($(this).index()+1);
        $(".woman_z").removeClass().addClass($aThis);
        return false;
    });
    $(".woman_b>a").hover(function() {
        var $aThis="woman_b wmb_b"+($(this).index()+1);
        $(".woman_b").removeClass().addClass($aThis);
        return false;
    });
    $(".woman_b>a.wmb71").hover(function() {
        $(".woman_b").removeClass().addClass("woman_b wmb_b7");
        return false;
    });

    /*
    $(".myResult li:gt(4)").hide();
    $(".myReBut a").click(function(){
    $(".myResult li:hidden:lt(4)").show();
    if($(".myResult li:hidden").length == 0){
    $(this).remove();
    };
    return false;
    });
    */


    //    /* search */
    //    $(".mySearSuim").click(function() {
    //        $(".myBox2_2").slideUp(300).prev(".myBox2_12").slideDown(300);
    //        return false;
    //    });
    //    $(".mySearSuim").dblclick(function() {
    //        $(".myBox2_2").slideUp(300).prev(".myBox2_12").slideDown(300).find(".myB212_con:first").show().next(".myB212_con").hide();
    //        return false;
    //    });
    $(".myB212_top .rePic").click(function() {
        $(".myBox2_12").slideUp(300).next(".myBox2_2").slideDown(300);
        $(".myBox2_22").hide();
        return false;
    });
    $(".myB312_top .rePic").click(function() {
        $(".myBox3_12").slideUp(300).next(".myBox2_2").slideDown(300);
        $("#searchBox").removeClass("weak_search");
        return false;
    });


    $(".searchResult tr:odd td").addClass("odd");
    $(".searchResult tr td").hover(function() {
        $(this).toggleClass("hover");
    });

    $(".peopBall").click(function() {
        $(".myBox2_2").slideUp(300).next(".myBox2_22").slideDown(300);
        return false;
    });
    $(".myB222_top .rePic").click(function() {
        $(".myBox2_22").slideUp(300).prev(".myBox2_2").slideDown(300);
        $("#searchBox").removeClass("weak_search");
        return false;
    });


    //    $("#symList li a, .symCon_second li a").click(function() {
    //        $(this).parents("ul").find("a").removeClass("select");
    //        $(this).addClass("select");
    //        return false;
    //    });


    /* scroll */
    var symli=$("#symList li").length/3-5;
    var symNum=0;
    $("#symDown").addClass("symNone");
    $("#symUp").click(function() {
        if(symNum<symli) {
            $(this).removeClass("symNone");
            $("#symList").animate({ marginTop: "-=99px" }, 200);
            symNum++;
            $("#symDown").removeClass("symNone");
        } else {
            $(this).addClass("symNone");
        };
        return false;
    });
    $("#symDown").click(function() {
        if(symNum>0) {
            $(this).removeClass("symNone");
            $("#symList").animate({ marginTop: "+=99px" }, 200);
            symNum--;
            $("#symUp").removeClass("symNone");
        } else {
            $(this).addClass("symNone");
        };
        return false;
    });


    $(".symTlist li:odd a").addClass("odd");
    $(".symTlist li a").hover(function() {
        $(this).toggleClass("hover");
    });

    //    $(".mySearText").click(function() {
    //        $(this).next(".mySearList").css("display", "block");
    //    });
    $(".mySearList a").click(function() {
        $(".mySearText").val($(this).text());
        $(this).parent(".mySearList").hide();
        return false;
    });

    //    $(".mySearBut").click(function() {
    //        $(".myBox3_12").show();
    //        $(".myBox2_2").hide();
    //    });
    $(".myBox3_12 .rePic").click(function() {
        $(".myBox3_12").hide();
        $(".myBox2_2").show();
    });
    $(".myResult li .my3_iBut").hover(function() {
        $(this).find(".my3_i").toggle();
    });

    $(".myReTcon a.tipClose").click(function() {
        $("#correctOrNot").attr("status", "closed");
        $(this).parents(".myReTip").fadeOut(300);
        return false;
    });
    $(".myReTcon a.tipTBut1, .myReTcon a.tipTBut2").click(function() {
        $("#correctOrNot").attr("status", "closed");
        var ttimer;
        $(this).parents(".myReTip").hide();
        $(".myReTip2").fadeIn(500);
        ttimer=window.setTimeout(function() {
            $(".myReTip2").fadeOut(500);
        }, 3000);
        return false;
    });





});

document.createElement('datalist');

/* 加载个性化滚动条 */
function scrollShow(obj) {
    $(obj).jscroll({
        W: "10px"
	  , BgUrl: "url(http://image.39.net/jbk/new2013/images/s_bg2.gif)"
	  , Bg: "right 0 repeat-y"
	  , Bar: { Bd: { Out: "#d4d4d4", Hover: "#a7a7a7" }
			, Bg: { Out: "-45px 0 repeat-y", Hover: "-45px 0 repeat-y", Focus: "-45px 0 repeat-y"}
	  }
			, Btn: { btn: false
				  , uBg: { Out: "right 0 repeat-y", Hover: "right 0 repeat-y", Focus: "right 0 repeat-y" }
				  , dBg: { Out: "right 0 repeat-y", Hover: "right 0 repeat-y", Focus: "right 0 repeat-y"}
			}
	  , Fn: function() { }
    });
}
