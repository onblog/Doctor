package cn.zyzpp.spider;

import cn.zyzpp.entity.disease.Department;
import cn.zyzpp.entity.disease.Disease;
import cn.zyzpp.entity.disease.Propertiy;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * 爬虫代码
 * 针对 http://www.baikemy.com
 * 运行在测试模块
 * Create by yster@foxmail.com 2018/6/1/001 16:17
 */
public class SpiderService{
    private final Logger logger = LoggerFactory.getLogger(getClass().getName());

    private final int TIMEOUT = 20000;
    private final String index_Url = "http://www.baikemy.com";
    private final String depar_Url = "/disease/list/0/0"; //科室种类
    private final String div_class = "dd.yiyao_w870";
    private final String a_tag = "a";
    private final String a_href = "href";
    private final String div_panel = "div.panel-body";
    private final String div_jb = "div.jb-mb";
    private final String div_content = "div.lemma-main-content";
    private final String span_con = "span.headline-content";
    private final String p = "p";
    private final String div_para = "div.para";
    private final String page_index = "?pageIndex=";
    private final String page_count = "&pageCount=";
    private final String clearFix = "div.bigPage";
    private final String div_dh = "div.jb-dh";
    private final String p_default = "默认";
    private String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36";
    private String Connection = "Connection";
    private String close = "close";


    /**
     * 获取科室
     * 传入科室ID
     */
    public Department queryAllDepar(int i){
        Document document = getDocument(depar_Url);
        Element element = document.select(div_class).first();
        Elements elements = element.getElementsByTag(a_tag);
        Department department = null;
        if (i < elements.size()) {
            Element e = elements.get(i);
            logger.info("***** 第"+ i +"科 ********");
            department = new Department();
            department.setId(-1);
            department.setName(e.text());//获取科室名称
            logger.info("正在爬取科室：" + department.getName());
            department.setDiseases(queryDiseases(e.attr(a_href)));//单独获取疾病
        }
        return department;
    }

    /**
     * 获取所有疾病
     * @param
     * @return
     * @throws IOException
     */
    private List<Disease> queryDiseases(String attr) {
        List<Disease> diseaseList = new ArrayList<>();
        Disease disease;
        Document doc = getDocument(attr);
        Element first = doc.select(clearFix).first();
        int count = 1;//默认有一页
        if (first.getElementsByTag(a_tag)!=null&&first.getElementsByTag(a_tag).first()!=null) {
            String href = first.getElementsByTag(a_tag).first().attr(a_href);
            count = Integer.parseInt(href.substring(href.indexOf(page_count) + 11));//总页数
        }
        for (int i=1; i<=count; i++) {//分页爬取
            Document document = getDocument(attr+page_index+i+page_count+count);
            Element select = document.select(div_panel).first();
            Elements elements = select.getElementsByTag(a_tag);
            for (Element e : elements) {
                disease = new Disease();
                disease.setId(-1);
                disease.setName(e.text());
                logger.info("正在爬取疾病：" + disease.getName());
                String[] s = queryKindAndUrl(e.attr(a_href));
                disease.setKind(s[0]);//获取疾病类别
                disease.setPropertiys(queryPropertiys(s[1]));//获取疾病属性
                diseaseList.add(disease);
            }
        }
        return diseaseList;
    }

    /**
     * 获取疾病属性
     * @param attr
     * @return
     * @throws IOException
     */
    private List<Propertiy> queryPropertiys(String attr){
        List<Propertiy> propertiyList = new ArrayList<>();
        Propertiy propertiy;
        Document document = getDocument(attr);
        Elements elements = document.select(div_content);
        for (Element element : elements){
            propertiy = new Propertiy();
            if (element.select(span_con)!=null && element.select(span_con).first()!=null) {
                propertiy.setName(element.select(span_con).first().text());
            }else{
                propertiy.setName(p_default);
            }
            //爬取属性
            propertiy.setId(-1);
            propertiy.setNumber(propertiyList.size()+1);
            propertiy.setValue(getValue(element));
            propertiyList.add(propertiy);
        }
        return propertiyList;
    }

    /**
     * 获取疾病种类和属性链接
     * @param attr
     * @return
     * @throws IOException
     */
    private String[] queryKindAndUrl(String attr) {
        Document document = getDocument(attr);
        String[] strings = new String[2];
        //种类
        Element select = document.select(div_jb).first();
        Element e = select.getElementsByTag(a_tag).get(2);
        strings[0] = e.text();
        //链接
        Element selec = document.select(div_dh).first();
        strings[1] = selec.getElementsByTag(a_tag).get(1).attr(a_href);
        return strings;
    }

    private Document getDocument(String attr){
        Document document = null;
        try {
            document = Jsoup.connect(index_Url+attr)
                    .userAgent(userAgent)
                    .header(Connection,close)
                    .timeout(TIMEOUT)
                    .get();
        } catch (IOException e) {
            System.out.println(index_Url+attr);
            e.printStackTrace();
        }
        return document;
    }

    /**
     * 属性值
     * @param element
     * @return
     */
    private String getValue(Element element) {
        Elements ps = element.select(div_para).first().getElementsByTag(p);
        StringBuffer stringBuffer = new StringBuffer();
        for (int i=0; i<ps.size(); i++){
            stringBuffer.append(ps.get(i).text());
            if(i<ps.size()-1) {
                stringBuffer.append("<br>");
            }
        }
        return stringBuffer.toString();
    }

}
