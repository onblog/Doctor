package cn.zyzpp.diagnostic.service.feign;

import cn.zyzpp.diagnostic.entity.Medical;
import cn.zyzpp.diagnostic.feign.AccessDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Create by yster@foxmail.com 2018/9/14/014 20:26
 */
@Service
@CacheConfig(cacheNames = {"cache"})//缓存
public class AccessDataServiceImpl {
    @Autowired
    private AccessDataService accessDataService;

    @Cacheable(key = "targetClass + methodName +#p0")
    public Medical findMedicalToSymptomByName(String name){
        return accessDataService.query(name);
    }

}
