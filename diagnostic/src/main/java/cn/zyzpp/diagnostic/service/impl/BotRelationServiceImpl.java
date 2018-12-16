package cn.zyzpp.diagnostic.service.impl;

import cn.zyzpp.diagnostic.node.BotRelation;
import cn.zyzpp.diagnostic.repository.BotRelationRepository;
import cn.zyzpp.diagnostic.service.BotRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Create by yster@foxmail.com 2018/7/14/014 20:22
 */
@Service
@CacheConfig(cacheNames = {"myCache"})//缓存
public class BotRelationServiceImpl implements BotRelationService {
    @Autowired
    private BotRelationRepository botRelationRepository;

    @Override
    @Cacheable(key = "targetClass + methodName +#p0")
    public List<BotRelation> findPointMeBySymptom(String name) {
        return botRelationRepository.findPointMeBySymptom(name);
    }

    @Override
    @Cacheable(key = "targetClass + methodName +#p0")
    public List<BotRelation> findPointYouBySymptom(String name) {
        return botRelationRepository.findPointYouBySymptom(name);
    }

}
