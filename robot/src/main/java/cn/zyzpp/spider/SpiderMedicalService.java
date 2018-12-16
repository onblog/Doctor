package cn.zyzpp.spider;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.util.ProjectPath;
import cn.zyzpp.util.TexUtil;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * 最新的爬取所有疾病类
 * 在Test测试
 * Create by yster@foxmail.com 2018/7/2/002 17:53
 */
public class SpiderMedicalService extends AbstractSpiderServer{
    private static Logger logger = LoggerFactory.getLogger(SpiderMedicalService.class);
//    private final static String jb_index = "http://jb39.com/jibing";
    private final static String index = "http://jb39.com";
    public final static int size = 58;

    /**
     * 爬虫入口方法
     *
     * @param i（科室ID）
     * @return 常见疾病集合
     */
    public List<Medical> getIndex(int i) {
        //选择科室
        Document document = SpiderUtil.getDocument(index+"/jibing");
        Element element = document.getElementsByClass("ul-jbks").get(0);
        Elements elements = element.getElementsByTag("a");
        String k_href = elements.get(i).attr("href");
        //跳转到疾病列表
        document = SpiderUtil.getDocument(index + k_href);
        //目录
        Element page = document.getElementsByClass("mulu-page").first();
        int num = 1;
        String p_href = null;
        if (page !=null){
            Element a = page.getElementsByTag("a").last();
            if (a!=null && a.text().equals("尾页")){
                int start = a.attr("href").lastIndexOf("-");
                int end = a.attr("href").lastIndexOf(".htm");
                //获取总页数
                num = Integer.parseInt(a.attr("href").substring(start+1,end));
                p_href = a.attr("href").substring(0,start);
                logger.info("科室有"+num+"页 "+ k_href);
            }
        }
        //遍历每一个疾病名
        List<Medical> medicalList = new ArrayList<>();
        for (int n = 1;n<=num;n++){
            if (n == 1){
                //疾病DIV
                element = document.getElementsByClass("mulu-body2").first();
            }else {
                //跳转到疾病列表
                document = SpiderUtil.getDocument(index + p_href + "-" + n + ".htm");
                element = document.getElementsByClass("mulu-body").first();
            }
            if (element==null){
                return null;
            }
            elements = element.getElementsByTag("a");
            for (Element element1 : elements) {
                String href = element1.attr("href");//疾病链接
                String name = element1.text();//疾病名字
                Medical medical = null;
                int c = 0;
                while (true){
                    if (c>99){
                        try {
                            TexUtil.write(name+"|"+href+"\n",ProjectPath.getRootPath("faild.txt"));
                            logger.warn("放弃并已记录："+name+"|"+href);
                        } catch (IOException e1) {
                            logger.error("IO："+e1.getMessage());
                        }
                        break;
                    }
                    try {
                        logger.info("正在爬：" + name + " " + href);
                        medical = getMedical(href, name);
                        break;
                    } catch (Exception e) {
                        c++;
                        logger.error("重新爬："+name+href);
                    }
                }
                //塞到疾病集合中
                medicalList.add(medical);
            }
        }

        return medicalList;
    }

}

