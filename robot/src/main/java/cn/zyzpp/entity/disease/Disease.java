package cn.zyzpp.entity.disease;

import javax.persistence.*;
import java.util.List;

/**
 * 疾病
 * Create by yster@foxmail.com 2018/5/31/031 21:07
 */
@Entity
@Table(name = "Disease")
public class Disease {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;    //名称
    private String kind;    //类别：检查，疾病，症状

    @OneToMany(cascade = {CascadeType.ALL},fetch = FetchType.LAZY)
    @JoinColumn(name = "c_id")
    private List<Propertiy> propertiys; //属性名、属性值

    @ManyToOne(cascade = {CascadeType.ALL},fetch = FetchType.EAGER)
    @JoinColumn(name = "d_id")
    private Department department;  //所属科室

    public Disease() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public List<Propertiy> getPropertiys() {
        return propertiys;
    }

    public void setPropertiys(List<Propertiy> propertiys) {
        this.propertiys = propertiys;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    @Override
    public String toString() {
        return "Disease{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", kind='" + kind + '\'' +
                '}';
    }
}
