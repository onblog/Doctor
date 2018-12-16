package cn.zyzpp.repository.medical;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.entity.medical.Msymptom;
import cn.zyzpp.util.ProjectPath;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.*;
import java.nio.charset.Charset;
import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MedicalRepositoryTest {
    Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private MedicalRepository medicalRepository;
    @Autowired
    private MsymptomRepository msymptomRepository;

    private static String path1 = ProjectPath.getRootPath("/medical_word.txt");
    private static String path2 = ProjectPath.getRootPath("/msymptom_word.txt");

    @Test
    public void test() throws IOException {
        int page = 0;
        Sort sort = new Sort(Sort.Direction.ASC, "id");
        Page<Medical> medicalPage = medicalRepository.findAll(new PageRequest(page++, 1000,sort));
        //写入txt文件
        write(medicalPage.getContent(),path1);
        while (!medicalPage.isLast()) {
            //再读取一页
            medicalPage = medicalRepository.findAll(new PageRequest(page++, 1000));
            //写入Tet文件
            write(medicalPage.getContent(),path1);
        }
    }

    @Test
    public void test2() throws IOException {
        int page = 0;
        Sort sort = new Sort(Sort.Direction.ASC, "id");
        Page<Msymptom> msymptomPage = msymptomRepository.findAll(new PageRequest(page++, 1000, sort));
        //写入txt文件
        write(msymptomPage.getContent(),path2);
        while (msymptomPage.hasNext()) {
            //再读取一页
            msymptomPage = msymptomRepository.findAll(new PageRequest(page++, 1000, sort));
            //写入Tet文件
            write(msymptomPage.getContent(),path2);
        }
    }

    public void write(List<?> content, String path) throws IOException {
        BufferedWriter bufferedWriter = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(new File(path),true),Charset.forName("UTF-8")));
        int i=0;
        for (Object object : content) {
            if (object instanceof Medical){
                Medical medical = (Medical)object;
                bufferedWriter.write(medical.getName()+"\r\n");
                logger.info(i++ + " " + medical.getName());
            }
            if (object instanceof Msymptom){
                Msymptom msymptom = (Msymptom)object;
                bufferedWriter.write(msymptom.getName()+"\r\n");
                logger.info(i++ + " " + msymptom.getName());
            }
        }
        bufferedWriter.flush();
        bufferedWriter.close();
    }


}