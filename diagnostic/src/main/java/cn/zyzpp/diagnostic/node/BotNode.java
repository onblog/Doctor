package cn.zyzpp.diagnostic.node;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;

import java.io.Serializable;
import java.util.List;

/**
 * Create by yster@foxmail.com 2018/6/16/016 20:18
 */
@NodeEntity(label = "Bot")
public class BotNode implements Serializable {
    @GraphId
    private Long id;
    @Property(name = "name")
    private String name;//名称
    @Property(name = "kind")
    private String kind;//（疾病、症状）
    @Property(name = "family")
    private List<String> family;//科室
    @Property(name = "part")
    private List<String> part;//部位

    public BotNode() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public List<String> getFamily() {
        return family;
    }

    public void setFamily(List<String> family) {
        this.family = family;
    }

    public List<String> getPart() {
        return part;
    }

    public void setPart(List<String> part) {
        this.part = part;
    }
}
