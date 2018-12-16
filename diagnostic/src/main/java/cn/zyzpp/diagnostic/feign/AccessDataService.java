package cn.zyzpp.diagnostic.feign;

import cn.zyzpp.diagnostic.entity.Medical;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "ACCESSDATA")
public interface AccessDataService {

    @RequestMapping(value = "/query")
    Medical query(@RequestParam("name") String name);
}
