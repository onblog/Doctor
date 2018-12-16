package cn.zyzpp.matchword.controller;

import cn.zyzpp.matchword.entity.Medical;
import cn.zyzpp.matchword.service.MedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * Create by yster@foxmail.com 2018/8/4/004 19:55
 */
@Controller
public class MedicalController {

    @Autowired
    private MedicalService medicalService;

    /**
     * 针对症状检索
     * @param word
     * @return
     */
    @RequestMapping(value = "/match",produces="application/json;charset=UTF-8")
    @ResponseBody
    public List<Medical> queryName(String word){
        return medicalService.findAllByNameLike(word);
    }

    /**
     * 针对部位检索
     * @param word
     * @return
     */
    @RequestMapping(value = "/part",produces="application/json;charset=UTF-8")
    @ResponseBody
    public List<Medical> queryPart(String word,String zm){
        if (zm != null && zm.length()>0) {
            return medicalService.findAllByPartLike(word,zm);
        }else {
            return medicalService.findAllByPartLike(word);
        }
    }


}
