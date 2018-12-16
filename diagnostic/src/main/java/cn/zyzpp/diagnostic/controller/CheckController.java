package cn.zyzpp.diagnostic.controller;

import cn.zyzpp.diagnostic.analyze.AnaylzeService;
import cn.zyzpp.diagnostic.analyze.SymptomService;
import cn.zyzpp.diagnostic.entity.Medical;
import cn.zyzpp.diagnostic.entity.Parameter;
import cn.zyzpp.diagnostic.entity.graph.Link;
import cn.zyzpp.diagnostic.entity.graph.Node;
import cn.zyzpp.diagnostic.feign.MatchWordService;
import cn.zyzpp.diagnostic.service.feign.AccessDataServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Create by yster@foxmail.com 2018/8/4/004 18:56
 */
@CrossOrigin(origins = "*", maxAge = 3600)//允许跨域请求
@RestController
public class CheckController {
    @Autowired
    private AnaylzeService anaylzeService;
    @Autowired
    private MatchWordService matchWordService;
    @Autowired
    private SymptomService symptomService;
    @Autowired
    private AccessDataServiceImpl accessDataService;

    /**
     * 调用关键词搜索服务
     *
     * @param word 字符串
     * @return 字符串集合
     */
    @RequestMapping(value = "/match", produces = "application/json;charset=UTF-8")
    public String wordMatch(String word) {
        return matchWordService.matchWord(word);
    }

    /**
     * 针对部位检索
     *
     * @param word
     * @return
     */
    @RequestMapping(value = "/part", produces = "application/json;charset=UTF-8")
    public String queryPart(String word, String zm) {
        return matchWordService.queryPart(word, zm);
    }

    /**
     * 医疗数据分析接口
     *
     * @param parameter
     * @return
     * @RequestBody定义收到的数据为JSON
     */
    @RequestMapping(value = "/anaylze", method = RequestMethod.POST)
    public Map<String, List> anaylze(@RequestBody Parameter parameter) {
        //疾病集合
        List<Medical> medicalList = anaylzeService.makeAnaylze(parameter);
        //相关症状
        List<String> sysptomList = symptomService.sysptoms(medicalList, parameter);
        Map<String, List> map = new HashMap<>();
        //封装
        map.put("MEDICAL", medicalList);
        map.put("SYSPTOM", sysptomList);
        return map;
    }

    /**
     * 知识图谱
     * 疾病 -> 症状集合
     *
     * @param name
     * @return
     */
    @RequestMapping(value = "/graph", method = RequestMethod.GET, produces = "application/json; charset=UTF-8")
    public Map<String,List> graph(String name) {
        Medical medical = accessDataService.findMedicalToSymptomByName(name);
        //面瘫 [病因] [症状] [诊断] [并发症] [治疗] [预防]
        List<Node> nodes = new ArrayList<>();
        List<Link> links = new ArrayList<>();
        nodes.add(new Node(0, medical.getName(), medical.getIntro(), 1));
        nodes.add(new Node(1, "病因", medical.getCause(), 2));
        nodes.add(new Node(2, "症状", medical.getSymptom(), 2));
        nodes.add(new Node(3, "诊断", medical.getDiagnose(), 2));
        nodes.add(new Node(4, "并发症", medical.getComplication(), 2));
        nodes.add(new Node(5, "治疗", medical.getCure(), 2));
        nodes.add(new Node(6, "预防", medical.getPrevent(), 2));
        for (int i = 0; i < 6; i++) {
            links.add(new Link(0, i + 1, "关系"));
        }
        Map<String, List> map = new HashMap<>();
        map.put("nodes", nodes);
        map.put("links", links);
        return map;
    }

}
