package cn.zyzpp.diagnostic.analyze.impl;

import cn.zyzpp.diagnostic.analyze.AnaylzeService;
import cn.zyzpp.diagnostic.entity.Medical;
import cn.zyzpp.diagnostic.entity.Parameter;
import cn.zyzpp.diagnostic.entity.PartClass;
import cn.zyzpp.diagnostic.feign.AccessDataService;
import cn.zyzpp.diagnostic.node.BotRelation;
import cn.zyzpp.diagnostic.service.BotRelationService;
import cn.zyzpp.diagnostic.util.AnaylzeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Create by yster@foxmail.com 2018/8/5/005 12:01
 */
@Service
public class AnaylzeServiceImpl implements AnaylzeService {
    Logger logger = LoggerFactory.getLogger(getClass().getName());

    @Autowired
    private BotRelationService botRelationService;
    @Autowired
    private AccessDataService accessDataService;

    @Autowired
    private PartClass partClass;

    final String WOMAN = "女";
    final String MAN = "男";
    final String ZZ = "症状";
    final int OLD = 65;//是否老年
    final int CHILD = 12;//是否小儿
    final int MAX = 20;//返回给客户端最大条数

    /**
     * 开始分析
     *
     * @param parameter
     * @return 可能患有的疾病集合
     */
    @Override
    @Cacheable(value = "emp" ,key = "targetClass + methodName +#p0")
    public List<Medical> makeAnaylze(Parameter parameter) {
        //获取症状词
        List<String> list = parameter.getSymptom();
        //所有关系的结束节点集合
        List<List<BotRelation>> listList = new ArrayList<>();
        //遍历获取导致症状的疾病与联系
        for (String s : list) {
            List<BotRelation> botRelations = botRelationService.findPointMeBySymptom(s);
            listList.add(botRelations);
        }
        //排除一部分疾病
        screen(parameter, listList);
        //如果开始节点是症状则删除
        deleteNoStart(listList);
        //词频统计
        Map<String, Integer> map = wordCount(listList);
        //统计结果拷贝
        Map<String, Integer> cloneMap = AnaylzeUtil.cloneMap(map);
        //排序,得出疾病名集合
        List<String> stringList = AnaylzeUtil.sort(map);
        //依照初步排序结果获取疾病的信息
        List<Medical> medicalList = new ArrayList<>();
        for (String name : stringList.subList(0, stringList.size() > MAX ? MAX : stringList.size())) {
            //调用EUREKA服务获取示实例
            Medical medical = accessDataService.query(name);
            //设置相关性得分
            medical.setScore(gainScore(medical, parameter));
            medicalList.add(medical);
            //打印
            //logger.info(medicalList.size() + " " + medical.toString());
        }
        //在词频统计结果相同的条目中根据相关性得分再进行排序
        List<Medical> medicalListAgain = sortAgain(cloneMap, medicalList);
        logger.info("智能诊断系统分析完成");
        return medicalListAgain;
    }

    /**
     * 在词频统计的基础上根据相关性得分再排序
     *
     * @param cloneMap
     * @param medicalList
     * @return
     */
    private List<Medical> sortAgain(Map<String, Integer> cloneMap, List<Medical> medicalList) {
        //把结果集合与匹配次数进行映射
        for (Medical medical : medicalList) {
            medical.setNumber(cloneMap.get(medical.getName()));
        }
        //匹配次数集合
        List<Integer> num = new ArrayList<>();
        for (Medical i : medicalList) {
            if (!num.contains(i.getNumber())) {
                num.add(i.getNumber());
            }
        }
        //再进行冒泡排序
        for (int i = 0; i < num.size() - 2; i++) {
            for (int j = num.size() - 1; j > i; j--) {
                if (num.get(j)>num.get(j-1)){
                    int k = num.get(j);
                    num.set(j,num.get(j-1));
                    num.set(j-1,k);
                }
            }
        }
        //依照匹配次数分段按顺序保存
        List<List<Medical>> medicals = new ArrayList<>();
        for (int n : num) {
            List<Medical> medicalArrayList = new ArrayList<>();
            for (Medical medical : medicalList) {
                if (medical.getNumber() == n) {
                    medicalArrayList.add(medical);
                }
            }
            medicals.add(medicalArrayList);
        }
        //分段再次排序
        medicalList.clear();
        for (List<Medical> list : medicals) {
            //冒泡排序
            for (int j = 0; j < list.size() - 2; j++) {
                for (int i = list.size() - 1; i > j; i--) {
                    if (list.get(i).getScore() > list.get(i - 1).getScore()) {
                        Medical m = list.get(i);
                        list.set(i, list.get(i - 1));
                        list.set(i - 1, m);
                    }
                }
            }
            for (Medical medical : list) {
                medicalList.add(medical);
                logger.info("排序：" + medicalList.size() + " " + medical.getName() + " " + medical.getNumber() + " " + medical.getScore());
            }
        }
        return medicalList;
    }


    /**
     * 相关性得分
     *
     * @param medical
     * @param parameter
     * @return
     */
    private double gainScore(Medical medical, Parameter parameter) {
        List<String> symptom_list = medical.getSymptom_list();
        List<String> stringList = parameter.getSymptom();
        double num = 0;//重复数据
        for (String symptom : symptom_list) {
            if (stringList.contains(symptom)) {
                num++;
            }
        }
        double score = num / medical.getSymptom_list().size();
        return Double.parseDouble(String.format("%.8f", score));
    }

    /**
     * 删除开始节点为症状的关系
     *
     * @param listList
     */
    private void deleteNoStart(List<List<BotRelation>> listList) {
        for (List<BotRelation> botRelationList : listList) {
            //每一个症状词对应的关系集合
            Iterator<BotRelation> iterator = botRelationList.iterator();
            while (iterator.hasNext()) {
                //使用迭代器删除元素
                BotRelation botRelation = iterator.next();
                String kind = botRelation.getStartNode().getKind();
                //如果属性为症状则从集合中删除
                if (ZZ.equals(kind)) {
                    iterator.remove();
                    break;
                }
            }
        }
    }

    /**
     * 利用年龄性别等排除一部分
     *
     * @param parameter
     * @param listList
     */
    private void screen(Parameter parameter, List<List<BotRelation>> listList) {
        String sex = parameter.getSex();
        int age = parameter.getAge().get(0);
        //性别排除
        switch (sex) {
            case WOMAN:
                iteratorDelete(listList, partClass.getMan());
                break;
            case MAN:
                iteratorDelete(listList, partClass.getWoman());
                break;
        }
        //老年科排除
        if (age < OLD) {
            iteratorDelete(listList, partClass.getOld());
        }
        //小儿科排除
        if(age > CHILD){
            iteratorDelete(listList, partClass.getChild());
        }
    }

    /**
     * 循环做排除
     *
     * @param listList
     * @param man
     */
    private void iteratorDelete(List<List<BotRelation>> listList, List<String> man) {
        for (List<BotRelation> botRelationList : listList) {
            //每一个症状词对应的关系集合
            Iterator<BotRelation> iterator = botRelationList.iterator();
            while (iterator.hasNext()) {
                //使用迭代器删除元素
                BotRelation botRelation = iterator.next();
                List<String> familyList = botRelation.getStartNode().getFamily();
                //遍历，如果科室不符合则从集合中删除
                for (String m : man) {
                    if (familyList.contains(m)) {
                        iterator.remove();
                        break;
                    }
                }
            }
        }
    }


    /**
     * 词频统计算法
     *
     * @param listList
     * @return
     */
    private Map<String, Integer> wordCount(List<List<BotRelation>> listList) {
        //保存结果
        Map<String, Integer> map = new HashMap<>();
        //取出一行
        for (List<BotRelation> botRelations : listList) {
            //取出每个词
            for (BotRelation botRelation : botRelations) {
                //如果已存在该词，则++
                if (map.containsKey(botRelation.getStartNode().getName())) {
                    Integer i = map.get(botRelation.getStartNode().getName());
                    map.put(botRelation.getStartNode().getName(), i + 1);
                } else {
                    //不存在赋值1
                    map.put(botRelation.getStartNode().getName(), 1);
                }
            }
        }
        return map;
    }

}
