package cn.zyzpp.diagnostic.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Create by yster@foxmail.com 2018/8/6/006 18:01
 */
public class AnaylzeUtil {
    /**
     * 按照词频大小排序
     *
     * @param map
     * @return
     */
    public static List<String> sort(Map<String, Integer> map) {
        List<String> arrayList = new ArrayList<>();
        while (map.size() > 0) {
            int max = 0;
            String m = null;
            for (String s : map.keySet()) {
                Integer i = map.get(s);
                if (i > max) {
                    max = i;
                    m = s;
                }
            }
            map.remove(m);
            arrayList.add(m);
        }
        return arrayList;
    }
    /**
     * Map对象克隆
     *
     * @param map
     * @return
     */
    public static Map<String, Integer> cloneMap(Map<String, Integer> map) {
        Map<String, Integer> map1 = new HashMap<>();
        for (String s : map.keySet()) {
            map1.put(s, map.get(s));
        }
        return map1;
    }
}
