package cn.zyzpp.entity.test;

import cn.zyzpp.repository.test.NameHrefRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class NameHrefTest {

    @Autowired
    NameHrefRepository nameHrefRepository;

    @Test
    public void getHref() {
        NameHref nameHref = new NameHref();
        nameHref.setId(1);
        String name = "博客园2号";
        nameHref.setName(name);
//        nameHref.setHref("http://www.cnblogs.com");
//        ArrayList<String> objects = new ArrayList<>();
//        objects.add("安卓");
//        objects.add("苹果");
//        nameHref.setPart(objects);
        nameHrefRepository.save(nameHref);

//        NameHref byName = nameHrefRepository.findAllByName(name);
//        byName.setHref("http://www.baidu.com");
//        nameHrefRepository.save(byName);

    }
}