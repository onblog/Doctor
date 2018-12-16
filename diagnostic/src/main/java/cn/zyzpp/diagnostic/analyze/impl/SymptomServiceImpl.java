package cn.zyzpp.diagnostic.analyze.impl;

import cn.zyzpp.diagnostic.analyze.SymptomService;
import cn.zyzpp.diagnostic.entity.Medical;
import cn.zyzpp.diagnostic.entity.Parameter;
import cn.zyzpp.diagnostic.util.AnaylzeUtil;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Create by yster@foxmail.com 2018/8/6/006 17:55
 */
@Service
public class SymptomServiceImpl implements SymptomService {

    final int XG_MAX = 100;//相关症状最大值

    /**
     * 相关症状分析系统
     * @param medicals
     * @param parameter
     * @return
     */
    @Override
    @Cacheable(value = "emp" ,key = "targetClass + methodName +#p0")
    public List<String> sysptoms(List<Medical> medicals, Parameter parameter) {
        Map<String, Integer> map = new HashMap<>();
        //词频统计
        for (Medical medical : medicals) {
            for (String s : medical.getSymptom_list()) {
                if (map.containsKey(s)) {
                    int i = map.get(s);
                    map.put(s, i + 1);
                } else {
                    map.put(s, 1);
                }
            }
        }
        //剔除
        List<String> symptom = parameter.getSymptom();
        for (String s : symptom) {
            if (map.containsKey(s)) {
                map.remove(s);
            }
        }
        //排序
        List<String> sort = AnaylzeUtil.sort(map);
        return sort.subList(0, sort.size() > XG_MAX ? XG_MAX : sort.size());
    }

}
