package cn.zyzpp.spider;

import cn.zyzpp.entity.test.NameHref;
import cn.zyzpp.repository.test.NameHrefRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit4.SpringRunner;


/**
 * Create by yster@foxmail.com 2018/8/14/014 20:46
 */

@RunWith(SpringRunner.class)
@SpringBootTest
public class SpiderSymptomService extends AbstractSpiderServer {
    @Autowired
    NameHrefRepository nameHrefRepository;

    @Test
    public void test(){
        Pageable pageable = new PageRequest(0,1000,Sort.Direction.ASC,"id");
        Page<NameHref> nameHrefs = nameHrefRepository.findAll(pageable);
        while (nameHrefs.hasNext()){
            for (NameHref nameHref : nameHrefs.getContent()){
                if (nameHref.getId()>398112){
                    spider(nameHref.getHref(),nameHref.getName());
                }else{
                    spider(nameHref.getName(),nameHref.getHref());
                }
            }
            nameHrefs = nameHrefRepository.findAll(pageable = pageable.next());
        }
    }

    private void spider(String name, String href) {
        if (href.indexOf("http")!=-1){
            return;
        }
        try {
            getManege(name,href);
        } catch (Exception e) {
            //e.printStackTrace();
            logger.error(name+e.getMessage());
        }
    }

}
