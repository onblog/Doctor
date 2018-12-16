package cn.zyzpp.spider2;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.repository.medical.MedicalRepository;
import cn.zyzpp.spider.SpiderUtil;
import cn.zyzpp.util.ProjectPath;
import cn.zyzpp.util.TexUtil;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.*;
import java.util.List;

/**
 * 最新的爬取所有疾病类
 * 在Test测试
 * Create by yster@foxmail.com 2018/7/2/002 17:53
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpiderMedicalService2 {
    private static Logger logger = LoggerFactory.getLogger(SpiderMedicalService2.class);
    private final static String index = "http://jb39.com";
    public final static int size = 58;
    @Autowired
    MedicalRepository medicalRepository;

    @Test
    public void main2() throws Exception {
        int[] i1 = {0, 10};
        int[] i2 = {10, 20};
        int[] i3 = {20, 30};
        int[] i4 = {30, 40};
        int[] i5 = {40, 50};
        int[] i6 = {50, size};
        for (int[] i = i2; i[0] < i[1]; i[0]++) {
            getIndex(i[0]);
        }
    }

    /**
     * 爬虫入口方法
     *
     * @param i（科室ID）
     * @return 常见疾病集合
     */
    public void getIndex(int i) throws Exception {
        //选择科室
        Document document = SpiderUtil.getDocument(index + "/jibing");
        Elements element1 = document.getElementsByClass("ul-jbks");
        while (element1.isEmpty()) {
            document = SpiderUtil.getDocument(index + "/jibing");
            element1 = document.getElementsByClass("ul-jbks");
        }
        Elements elements = element1.first().getElementsByTag("a");
        String k_href = elements.get(i).attr("href");
        //跳转到疾病列表
        document = SpiderUtil.getDocument(index + k_href);
        while (document.getElementsByClass("post-title").isEmpty()) {
            document = SpiderUtil.getDocument(index + k_href);
        }
        //目录
        Element page = document.getElementsByClass("mulu-page").first();
        int num = 1;
        String p_href = null;
        if (page != null) {
            Element a = page.getElementsByTag("a").last();
            if (a != null && a.text().equals("尾页")) {
                int start = a.attr("href").lastIndexOf("-");
                int end = a.attr("href").lastIndexOf(".htm");
                //获取总页数
                int k = 0;//没啥用
                num = Integer.parseInt(a.attr("href").substring(start + 1, end));
                p_href = a.attr("href").substring(0, start);
                logger.info("科室有" + num + "页 " + k_href);
            }
        }
        //遍历每一个疾病名
        for (int n = 1; n <= num; n++) {
            Element element = null;
            if (n == 1) {
                //疾病DIV
                element = document.getElementsByClass("mulu-body").first();
                for (Element e : document.getElementsByClass("mulu-body2").first().getElementsByTag("li")) {
                    element.append(e.html());
                }
            } else {
                //跳转到疾病列表
                document = SpiderUtil.getDocument(index + p_href + "-" + n + ".htm");
                while (document.getElementsByClass("mulu-body").isEmpty()) {
                    document = SpiderUtil.getDocument(index + p_href + "-" + n + ".htm");
                }
                element = document.getElementsByClass("mulu-body").first();
            }
            if (element == null) {
                return;
            }
            elements = element.getElementsByTag("a");
            for (Element e : elements) {
                String href = e.attr("href");//疾病链接
                String name = e.text();//疾病名字
                int c = 0;
                while (true) {
                    if (c > 199) {
                        try {
                            TexUtil.write(name + "|" + href + "\n", ProjectPath.getRootPath("faild2.txt"));
                            logger.warn("放弃并已记录：" + name + "|" + href);
                        } catch (IOException e1) {
                            logger.error("IO：" + e1.getMessage());
                        }
                        break;
                    }
                    try {
                        logger.info("正在爬：" + name + " " + href);
                        getMedical(href, name);
                        break;
                    } catch (Exception e1) {
                        c++;
                        logger.error("重新爬：" + name + href);
                    }
                }
            }
        }
    }

    private void getMedical(String href, String name) throws Exception {
        Document document = SpiderUtil.getDocument(index + href);
        if (document.select(".post-title").isEmpty()) {
            throw new Exception("异常："+document.html());
        }
        Elements select = document.select("ul.ul-ss-3.jb-xx-zz");
        if (select.isEmpty()){
            select = document.select("div.jb-zz");
        }
        Elements a = select.first().getElementsByTag("a");
        if (a.isEmpty()) {
            return;
        }
        //从数据库获取实体
        Medical medical = medicalRepository.findAllByName(name);
        if (medical == null){
            return;
        }
        List<String> symptomList = medical.getSymptom_list();
        //标识是否有所改动
        boolean b = false;
        for (Element e : a) {
            if (!symptomList.contains(e.text())) {
                symptomList.add(e.text());
                b = true;
            }
        }
        if (b) {
            logger.info("更新success");
            medicalRepository.save(medical);
        }
    }
    @Test
    public void test9() throws Exception {
        FileReader fileReader = new FileReader(new File("D:\\IDEA\\workSpace\\robots\\robot\\target\\test-classes\\faild2.txt"));
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        String line = bufferedReader.readLine();
        while (line != null){
            String[] split = line.split("\\|");
            int c = 0;
            while (true) {
                if (c > 9) {
                    try {
                        TexUtil.write(split[0] + "|" + split[1] + "\n", ProjectPath.getRootPath("faild3.txt"));
                        logger.warn("放弃并已记录：" + split[0] + "|" + split[1]);
                    } catch (IOException e1) {
                        logger.error("IO：" + e1.getMessage());
                    }
                    break;
                }
                try {
                    logger.info("正在爬：" + split[0] + " " + split[1]);
                    getMedical(split[1], split[0]);
                    break;
                } catch (Exception e1) {
                    c++;
                    e1.printStackTrace();
                }
            }
            line = bufferedReader.readLine();
        }
    }
}

