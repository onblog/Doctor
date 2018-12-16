package cn.zyzpp.word;

import cn.zyzpp.entity.hospital.Illness;
import cn.zyzpp.entity.hospital.Symptom;
import cn.zyzpp.repository.hospital.IllnessRepository;
import cn.zyzpp.repository.hospital.SymptomRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.*;
import java.nio.charset.Charset;
import java.util.List;

/**
 * Create by yster@foxmail.com 2018/7/13/013 19:40
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class WordFileTest {
    @Autowired
    private IllnessRepository illnessRepository;
    @Autowired
    private SymptomRepository symptomRepository;
    String path;


    /**
     * 保存症状。疾病 关键词到文本文件
     */
    @Test
    public void test() throws IOException {
        File file = new File(path);
        //追加内容
        BufferedWriter bufferedWriter = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(file,true),Charset.forName("UTF-8")));

        List<Illness> illnessList = illnessRepository.findAll();
        for (Illness illness : illnessList){
            System.out.println(illness.getName());
            bufferedWriter.write(illness.getName()+"\r\n");
            bufferedWriter.flush();
        }
        List<Symptom> symptomList = symptomRepository.findDistinctBySymptom();
        for (Symptom symptom : symptomList){
            System.out.println(symptom.getSymptom());
            bufferedWriter.write(symptom.getSymptom()+"\r\n");
            bufferedWriter.flush();
        }
        bufferedWriter.close();
    }

    @Test
    public void test1() throws IOException {
        File file = new File(path);
        //追加内容
        BufferedWriter bufferedWriter = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(file,true),Charset.forName("UTF-8")));
        bufferedWriter.write("测试");
        bufferedWriter.flush();
        bufferedWriter.close();
    }



}
