package cn.zyzpp.entity.disease;

import javax.persistence.*;

/**
 * Create by yster@foxmail.com 2018/5/31/031 21:53
 */
@Entity
@Table(name = "propertiy")
public class Propertiy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int number;  //序号
    private String name;    //属性名
    @Column(columnDefinition="TEXT", nullable=true)
    private String value;   //属性值

    @ManyToOne(cascade = {CascadeType.ALL},fetch = FetchType.EAGER)
    @JoinColumn(name = "c_id")
    private Disease disease;  //所属科室

    public Propertiy() {
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

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Disease getDisease() {
        return disease;
    }

    public void setDisease(Disease disease) {
        this.disease = disease;
    }

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
    }

    @Override
    public String toString() {
        return "Propertiy{" +
                "id=" + id +
                ", number=" + number +
                ", name='" + name + '\'' +
                ", value='" + value + '\'' +
                '}';
    }
}
