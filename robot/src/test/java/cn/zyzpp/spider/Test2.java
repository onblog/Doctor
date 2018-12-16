package cn.zyzpp.spider;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

/**
 * Create by yster@foxmail.com 2018/7/25/025 11:48
 */
public class Test2 {
    @Test
    public void test() throws IOException {
        //Document document = SpiderUtil.getDocument("http://jb39.com/jibing/FengShiXingDuoJiTong269871.htm");
        Document document = Jsoup.parse(new File("D:\\IDEA\\workSpace\\robots\\robots\\src\\main\\resources\\demo.html"), "gb2312", "http://jb39.com");
//        Elements select = document.select(".ul-ss-3").select(".jb-xx-bw");
        Elements select = document.getElementsByClass("ul-ss-3 jb-xx-bw");
        if (select.size()==0){
            System.out.println(0);
            System.out.println(document);
        }else {
            String text = select.text();
            System.out.println(text);
        }
    }
    @Test
    public void test2(){
        Document document = SpiderUtil.getDocument("http://jb39.com/jibing/JiXingSheBianTaoTiYan269516.htm");
        Element select = document.select(".ul-ss-3.jb-xx-zz").first();
        if (select==null){
            return;
        }
        Elements a = select.getElementsByTag("a");
        for (Element element: a){
            System.out.println(element.text());
        }
    }
}
