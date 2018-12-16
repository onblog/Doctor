package cn.zyzpp.accessdata.controller;

import cn.zyzpp.accessdata.medical.Medical;
import cn.zyzpp.accessdata.service.MedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Create by yster@foxmail.com 2018/8/5/005 17:08
 */
@RestController
public class MedicalController {
    @Autowired
    private MedicalService medicalService;

    @RequestMapping(value = "/query",produces = "application/json; charset=UTF-8")
    public Medical findMedicalByName(String name){
        return medicalService.findAllByName(name);
    }

}
