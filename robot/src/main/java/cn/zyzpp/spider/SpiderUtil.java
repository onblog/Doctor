package cn.zyzpp.spider;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;

/**
 * Create by yster@foxmail.com 2018/7/2/002 18:46
 */
public class SpiderUtil {
    private final static int TIMEOUT = 20000;//1000=1秒
    private final static String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36";
    private final static String Connection = "Connection";
    private final static String close = "close";
    private final static String alive = "keep-alive";
    private final static String[] Accept = {"Accept","text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"};
    private final static String[] Cache_Control = {"Cache-Control","no-cache"};
    private final static String[] Accept_Encoding = {"Accept-Encoding","gzip, deflate"};
    private final static String[] Pragma = {"Pragma","no-cache"};
    private final static String[] Host = {"Host","jb39.com"};
    private final static String DEFAULT_CHARSET = "GB2312";


    public static Document getDocument(String url){
        Document document = null;
        try {
            document = Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header(Connection,alive)
                    .header(Accept[0],Accept[1])
//                    .header(Cache_Control[0],Cache_Control[1])
                    .header(Accept_Encoding[0],Accept_Encoding[1])
//                    .header(Pragma[0],Pragma[1])
                    .header(Host[0],Host[1])
                    .timeout(TIMEOUT)
                    .method(org.jsoup.Connection.Method.GET)
                    .execute()
                    .charset(DEFAULT_CHARSET)
                    .parse();
        } catch (IOException e) {
            System.out.println("Exception URL:"+url);
            e.printStackTrace();
        }
        return document;
    }

}
