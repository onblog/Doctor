package cn.zyzpp.accessdata.service.impl;

import cn.zyzpp.accessdata.medical.Medical;
import cn.zyzpp.accessdata.repository.MedicalRepository;
import cn.zyzpp.accessdata.service.MedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;


/**
 * Create by yster@foxmail.com 2018/8/5/005 16:52
 */
@Service
public class MedicalServiceImpl implements MedicalService {
    @Autowired
    private MedicalRepository medicalRepository;

    @Override
    @Cacheable(value = "emp" ,key = "targetClass + methodName +#p0")
    public Medical findAllByName(String name){
        return medicalRepository.findAllByName(name);
    }
}
