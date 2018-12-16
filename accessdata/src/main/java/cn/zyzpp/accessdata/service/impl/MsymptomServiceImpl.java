package cn.zyzpp.accessdata.service.impl;

import cn.zyzpp.accessdata.medical.Msymptom;
import cn.zyzpp.accessdata.repository.MsymptomRepository;
import cn.zyzpp.accessdata.service.MsymptomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Create by yster@foxmail.com 2018/8/5/005 16:53
 */
@Service
public class MsymptomServiceImpl implements MsymptomService {

    @Autowired
    private MsymptomRepository msymptomRepository;

    @Override
    @Cacheable(value = "emp" ,key = "targetClass + methodName +#p0")
    public Msymptom findAllByName(String name){
        return msymptomRepository.findAllByName(name);
    }
}
