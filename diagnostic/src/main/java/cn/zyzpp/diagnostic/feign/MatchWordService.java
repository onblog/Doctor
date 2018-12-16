package cn.zyzpp.diagnostic.feign;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "MATCHWORD")
public interface MatchWordService {
    @RequestMapping(value = "/match")
    String matchWord(@RequestParam("word") String word);

    @RequestMapping(value = "/part")
    String queryPart(@RequestParam("word") String word,@RequestParam("zm") String zm);
}
