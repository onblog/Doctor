package cn.zyzpp.diagnostic.entity;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import java.util.List;

/**
 * @PropertySource注解加载指定的配置文件只能是properties格式，对于yml格式无效。
 * Create by yster@foxmail.com 2018/8/5/005 13:56
 */
@Configuration
@PropertySource("classpath:application-part.properties")
@ConfigurationProperties(prefix = "maps")
public class PartClass {
    private List<String> woman ;
    private List<String> man ;
    private List<String> child ;
    private List<String> old ;

    public List<String> getWoman() {
        return woman;
    }

    public void setWoman(List<String> woman) {
        this.woman = woman;
    }

    public List<String> getMan() {
        return man;
    }

    public void setMan(List<String> man) {
        this.man = man;
    }

    public List<String> getChild() {
        return child;
    }

    public void setChild(List<String> child) {
        this.child = child;
    }

    public List<String> getOld() {
        return old;
    }

    public void setOld(List<String> old) {
        this.old = old;
    }

}
