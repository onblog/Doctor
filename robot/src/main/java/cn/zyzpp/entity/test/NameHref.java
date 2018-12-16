package cn.zyzpp.entity.test;

import javax.persistence.*;
import java.util.List;

/**
 * Create by yster@foxmail.com 2018/8/13/013 20:37
 */
@Entity
@Table(name = "name_href")
public class NameHref {
    @Id
    @GeneratedValue()
    private int id;
    @Column(name = "name")
    private String name;
    private String href;
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name="position")
    private List<String> part;

    public NameHref() {
    }

    public NameHref(String name, String href) {
        this.name = name;
        this.href = href;
    }



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHref() {
        return href;
    }

    public void setHref(String href) {
        this.href = href;
    }

    public List<String> getPart() {
        return part;
    }

    public void setPart(List<String> part) {
        this.part = part;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
