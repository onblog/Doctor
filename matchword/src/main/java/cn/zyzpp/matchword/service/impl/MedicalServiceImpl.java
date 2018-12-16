package cn.zyzpp.matchword.service.impl;

import cn.zyzpp.matchword.entity.Medical;
import cn.zyzpp.matchword.repository.MedicalRepository;
import cn.zyzpp.matchword.service.MedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Create by yster@foxmail.com 2018/8/4/004 19:36
 */
@Service
@CacheConfig(cacheNames = {"match"})
public class MedicalServiceImpl implements MedicalService {
    @Autowired
    private MedicalRepository medicalRepository;

    @Override
    public void save(Medical medical){
        medicalRepository.save(medical);
    }

    @Override
    @Cacheable(key = "targetClass + methodName +#p0")
    public List<Medical> findAllByNameLike(String name){
        return medicalRepository.findAllByNameLike(name,new PageRequest(0,20));
    }

    @Override
    @Cacheable(key = "targetClass + methodName +#p0")
    public List<Medical> findAllByPartLike(String name){
        return medicalRepository.findAllByPartLike(name);
    }

    @Override
    public void delete(long id){
        medicalRepository.delete(id);
    }

    @Override
    public void deleteAll(){
        medicalRepository.deleteAll();
    }

    @Override
    public Long count(){
        return medicalRepository.count();
    }

    @Override
    @Cacheable(key = "targetClass +#p0 +#p1+ methodName")
    public List<Medical> findAllByPartLike(String word, String zm) {
        List<Medical> partLike = new ArrayList<>();
        partLike.addAll(findAllByPartLike(word));
        Iterator<Medical> iterator = partLike.iterator();
        while (iterator.hasNext()){
            Medical next = iterator.next();
            if (!zm.equals(next.getInitial())){
                iterator.remove();
            }
        }
        return partLike;
    }

}
