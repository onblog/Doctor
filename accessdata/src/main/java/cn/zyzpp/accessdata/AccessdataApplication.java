package cn.zyzpp.accessdata;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient//开启服务提供者
@EnableCaching  //开启缓存
public class AccessdataApplication {

    public static void main(String[] args) {
        SpringApplication.run(AccessdataApplication.class, args);
    }
}
