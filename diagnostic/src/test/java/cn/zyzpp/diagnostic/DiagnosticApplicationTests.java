package cn.zyzpp.diagnostic;

import cn.zyzpp.diagnostic.node.BotNode;
import cn.zyzpp.diagnostic.repository.BotRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class DiagnosticApplicationTests {

	@Autowired
    BotRepository botRepository;

	@Test
	public void contextLoads(){
        BotNode node = botRepository.findAllByName("局部头痛");
        System.out.println(node.getName());
    }


}
