package cn.zyzpp.entity.medical.node;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;

/**
 * Create by yster@foxmail.com 2018/7/30/030 18:03
 */
@NodeEntity(label = "medical")
public class MedicalNode {
    @GraphId
    private Long id;
    @Property(name = "name")
    private String name;//节点名
    @Property(name = "intro")
    private String intro;//节点介绍
    @Property(name = "major")
    private boolean major;//是否是主节点

    public MedicalNode() {
        this.major = false;
    }

    public MedicalNode(String name, String intro) {
        this.id = -1l;
        this.name = name;
        this.intro = intro;
        this.major = false;
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

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    public boolean isMajor() {
        return major;
    }

    public void setMajor(boolean major) {
        this.major = major;
    }
}
