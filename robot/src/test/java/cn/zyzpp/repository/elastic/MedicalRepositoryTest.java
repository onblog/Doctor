package cn.zyzpp.repository.elastic;

import cn.zyzpp.entity.medical.Medical;
import cn.zyzpp.entity.medical.Msymptom;
import cn.zyzpp.repository.medical.MsymptomRepository;
import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinCaseType;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import net.sourceforge.pinyin4j.format.HanyuPinyinToneType;
import net.sourceforge.pinyin4j.format.HanyuPinyinVCharType;
import net.sourceforge.pinyin4j.format.exception.BadHanyuPinyinOutputFormatCombination;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.annotation.Resource;
import java.util.List;


@RunWith(SpringRunner.class)
@SpringBootTest
public class MedicalRepositoryTest {
    Logger logger = LoggerFactory.getLogger(getClass());
    @Resource(name = "elasticM")
    private MedicalRepository medicalRepository;
    @Autowired
    private cn.zyzpp.repository.medical.MedicalRepository medicalRepositoryMysql;
    @Autowired
    private MsymptomRepository msymptomRepository;

    int i = 0;

    @Test
    public void test() {
        //先删除全部
        medicalRepository.deleteAll();
        List<Medical> mysqlAll = medicalRepositoryMysql.findAll();
        for (Medical medical : mysqlAll){
            cn.zyzpp.entity.elastic.Medical m = new cn.zyzpp.entity.elastic.Medical(medical.getId(),medical.getName());
            m.setPart(medical.getPart());
            m.setFamily(medical.getFamily());
            String[] strings = new String[0];
            try {
                strings = PinyinHelper.toHanyuPinyinStringArray(medical.getName().charAt(0),getHanyuPinyinOutputFormat());
                m.setInitial(strings[0].substring(0,1));
            } catch (Exception badHanyuPinyinOutputFormatCombination) {
                //badHanyuPinyinOutputFormatCombination.printStackTrace();
            }
            medicalRepository.save(m);
            logger.info(mysqlAll.size()+" "+i+++" "+m.getFamily());
        }
    }

    @Test
    public void test2() {
        //先删除全部
        medicalRepository.deleteAll();
        List<Msymptom> mysqlAll = msymptomRepository.findAll();
        for (Msymptom msymptom : mysqlAll){
            cn.zyzpp.entity.elastic.Medical m = new cn.zyzpp.entity.elastic.Medical(msymptom.getId(),msymptom.getName());
            m.setPart(msymptom.getPart());
            m.setFamily(msymptom.getFamily());
            String[] strings = new String[0];
            try {
                strings = PinyinHelper.toHanyuPinyinStringArray(msymptom.getName().charAt(0),getHanyuPinyinOutputFormat());
                m.setInitial(strings[0].substring(0,1));
            } catch (Exception badHanyuPinyinOutputFormatCombination) {
                //badHanyuPinyinOutputFormatCombination.printStackTrace();
            }
            medicalRepository.save(m);
            logger.info(mysqlAll.size()+" "+i+++" "+m.getFamily());
        }
    }


    @Test
    public void pinyin() throws BadHanyuPinyinOutputFormatCombination {
        HanyuPinyinOutputFormat format = getHanyuPinyinOutputFormat();
        String[] strings = PinyinHelper.toHanyuPinyinStringArray('行',format);
        System.out.println(strings[0].substring(0,1));
    }

    private HanyuPinyinOutputFormat getHanyuPinyinOutputFormat() {
        HanyuPinyinOutputFormat format = new HanyuPinyinOutputFormat();
        //拼音大写
        format.setCaseType(HanyuPinyinCaseType.UPPERCASE);
        //无音标方式；WITH_TONE_NUMBER：1-4数字表示英标；WITH_TONE_MARK：直接用音标符（必须WITH_U_UNICODE否则异常
        format.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
        //用v表示ü
        format.setVCharType(HanyuPinyinVCharType.WITH_V);
        return format;
    }

}