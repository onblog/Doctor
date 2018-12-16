package cn.zyzpp.diagnostic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.feign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient//开启发现客户端
@EnableFeignClients//开启Feign
@EnableCaching  //开启缓存
public class DiagnosticApplication {

	public static void main(String[] args) {
		SpringApplication.run(DiagnosticApplication.class, args);
	}
}
