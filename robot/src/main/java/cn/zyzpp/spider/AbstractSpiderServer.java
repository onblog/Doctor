package cn.zyzpp.spider;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.entity.medical.Msymptom;
import cn.zyzpp.repository.medical.MedicalRepository;
import cn.zyzpp.repository.medical.MsymptomRepository;
import cn.zyzpp.util.ProjectPath;
import cn.zyzpp.util.TexUtil;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 症状类
 * Create by yster@foxmail.com 2018/8/13/013 17:04
 */
public abstract class AbstractSpiderServer {
    protected Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    private MsymptomRepository msymptomRepository;
    @Autowired
    private MedicalRepository medicalRepository;
    private final static String ALL = "all";
    private final static String index = "http://jb39.com";
    private final static String WORD = "util";

    protected void getManege(String name, String href) throws Exception {
        int i = 0;
        while (true){ //死循环，直到成功为止
            if (i>50){
                TexUtil.write(name+"|"+href+"\r\n",ProjectPath.getRootPath("faild2.txt"));
                logger.error("失败已记录 "+name+href);
                break;
            }
            //判断是否已存在
            if (medicalRepository.existsMedicalByName(name)||msymptomRepository.existsMsymptomByName(name)){
                break;
            }
            try {
                //获取爬完的对象
                Object manage = manage(name, href);
                //为空则不符合条件，停止循环不再管。
                if (manage==null){
                    break;
                }
                logger.info("已爬取："+name+href);
                //爬取成功去保存
                try {
                    if (manage instanceof Medical){
                        medicalRepository.save((Medical) manage);
                    }else {
                        msymptomRepository.save((Msymptom) manage);
                    }
                } catch (Exception e) {
                    //保存异常也不用管
                    //logger.error("save database exception:"+e.getMessage());
                }
                //停止死循环
                break;
            } catch (Exception e) {
                i++;
                logger.error("重新爬："+name+href);
            }
        }
    }

    private Object manage(String name, String href) throws Exception {
        logger.info("正在爬 "+name+href);
        String zz = "/zhengzhuang";
        String jb = "/jibing";
        //zhengzhuang
        if (href.substring(0,zz.length()).equals(zz)){
            Msymptom sysptom = getSysptom(name, href);
            return sysptom;
        }
        //jibing
        if (href.substring(0,jb.length()).equals(jb)){
            Medical medical = getMedical(href,name);
            return medical;
        }
        return null;
    }

    /**
     * 爬症状
     * @param name
     * @param href
     * @return
     * @throws Exception
     */
    private Msymptom getSysptom(String name, String href) throws Exception {
        Msymptom msymptom = new Msymptom();
        msymptom.setId(-1);
        msymptom.setName(name);
        Document document = SpiderUtil.getDocument(index + href);
        msymptom.setFamily(getFamily(document,href, ".zz-xx-ks","jb-ks"));
        msymptom.setPart(getFamily(document,href, ".zz-xx-bw","jb-bw"));
        Map<String, Object> intro = getBrief(href, null);
        msymptom.setIntro((String) intro.get(ALL));
        msymptom.setIntro_list((List<String>) intro.get(WORD));
        Map<String, Object> casue = getBrief(href, "/zhengzhuang-bingyin");
        msymptom.setCause((String) casue.get(ALL));
        msymptom.setCause_list((List<String>) casue.get(WORD));
        Map<String, Object> diagnose = getBrief(href, "/zhengzhuang-zhenduan");
        msymptom.setDiagnose((String) diagnose.get(ALL));
        msymptom.setDiagnose_list((List<String>) diagnose.get(WORD));
        Map<String, Object> examine = getBrief(href, "/zhengzhuang-jiancha");
        msymptom.setExamine((String) examine.get(ALL));
        msymptom.setExamine_list((List<String>) examine.get(WORD));
        return msymptom;
    }

    /**
     * 爬疾病
     * @param href
     * @param name
     * @return
     * @throws Exception
     */
    protected Medical getMedical(String href, String name) throws Exception {
        Medical medical = new Medical();
        medical.setId(-1);
        medical.setName(name);
        Document document = SpiderUtil.getDocument(index + href);
        medical.setFamily(getFamily(document,href, ".jb-xx-ks","jb-ks"));
        medical.setPart(getFamily(document,href, ".jb-xx-bw","jb-bw"));
        Map<String, Object> intro = getBrief(href, null);
        medical.setIntro((String) intro.get(ALL));
        medical.setIntro_list((List<String>) intro.get(WORD));
        Map<String, Object> casue = getBrief(href, "/jibing-bingyin");
        medical.setCause((String) casue.get(ALL));
        medical.setCause_list((List<String>) casue.get(WORD));
        Map<String, Object> diagnose = getBrief(href, "/jibing-zhenduan");
        medical.setDiagnose((String) diagnose.get(ALL));
        medical.setDiagnose_list((List<String>) diagnose.get(WORD));
        Map<String, Object> cure = getBrief(href, "/jibing-zhiliao");
        medical.setCure((String) cure.get(ALL));
        medical.setCure_list((List<String>) cure.get(WORD));
        Map<String, Object> prevent = getBrief(href, "/jibing-yufang");
        medical.setPrevent((String) prevent.get(ALL));
        medical.setPrevent_list((List<String>) prevent.get(WORD));
        Map<String, Object> complication = getBrief(href, "/jibing-zhengzhuang");
        medical.setComplication((String) complication.get(ALL));
        medical.setComplication_list((List<String>) complication.get(WORD));
        Map<String, Object> symptom = getBrief(href, "/jibing-zhengzhuang");
        medical.setSymptom((String) symptom.get(ALL));
        medical.setSymptom_list((List<String>) symptom.get(WORD));
        return medical;
    }

    /**
     * 部位+科室
     *
     * @param href
     * @return
     */
    protected List<String> getFamily(Document document,String href, String clas, String by) throws Exception {
        Element first = document.select(".ul-ss-3").select(clas).first();
        if (first==null) {
            if (by!=null && document.getElementsByClass(by).first() != null){
                first = document.getElementsByClass(by).first();
            }else {
                logger.warn("无部位/科室 " + index + href);
            }
        }
        //是否有词
        Elements elements = first.getElementsByTag("a");
        if (elements.size() == 0) {
            logger.warn( "无关键词"+index + href);
            return null;
        }
        //遍历词
        List<String> symptomList = new ArrayList<>();
        for (Element element1 : elements) {
            symptomList.add(element1.text());
        }
        return symptomList;
    }


    /**
     * 症状并发症等含有通用词的
     *
     * @param href
     * @return
     */
    protected Map<String, Object> getBrief(String href, String word) throws Exception {
        String url = (word == null) ? (index + href) : (index + word + href.substring(href.lastIndexOf("/")));
        //症状详情页
        Document document = SpiderUtil.getDocument(url);
        Elements select = document.select("div.spider");
        if (select.size() == 0) {
            if (document.select("div.jb-body").size()!=0){
                select = document.select("div.jb-body");
            }else{
                logger.error("异常：详情页无详情 "+url);
            }
        }
        Element first = select.first();
        //爬取所有描述
        Map<String, Object> map = new HashMap<>();
        map.put(ALL, first.text());
        //判断是否有词
        Elements elements = first.getElementsByTag("a");
        if (elements.size()== 0) {
//            logger.warn("正常无spider<a> "+url);
            return map;
        }
        //遍历词
        List<String> symptomList = new ArrayList<>();
        for (Element element1 : elements) {
            symptomList.add(element1.text());
            //新的词链接
            String href1 = element1.attr("href");
            //保存新词到本地txt文件
            TexUtil.write(element1.text()+"\r\n"+href1+"\r\n",ProjectPath.getRootPath("/word_link.txt"));
        }
        map.put(WORD, symptomList);
        return map;
    }
}
