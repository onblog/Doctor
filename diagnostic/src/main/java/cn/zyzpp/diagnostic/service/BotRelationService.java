package cn.zyzpp.diagnostic.service;


import cn.zyzpp.diagnostic.node.BotRelation;

import java.util.List;

public interface BotRelationService {

    /**
     * 返回指向节点n的所有关系
     */
    List<BotRelation> findPointMeBySymptom(String name);

    /*
     * 返回节点n指向的所有关系
     */
    List<BotRelation> findPointYouBySymptom(String name);

}
