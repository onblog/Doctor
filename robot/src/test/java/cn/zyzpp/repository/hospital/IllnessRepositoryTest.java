package cn.zyzpp.repository.hospital;

import cn.zyzpp.entity.hospital.Illness;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class IllnessRepositoryTest {
    /**
     * 删除Mysql重复数据
     */
    @Autowired
    private IllnessRepository illnessRepository;
    @Test
    public void findListByCountName() {
        List<Illness> illnessList = illnessRepository.findListByCountName();
        for (Illness illness : illnessList){
            illnessRepository.delete(illness.getId());
        }
        System.out.println("删除成功");
    }
}