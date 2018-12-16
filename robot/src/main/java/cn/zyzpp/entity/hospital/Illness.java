package cn.zyzpp.entity.hospital;

import javax.persistence.*;
import java.util.List;

/**
 * 一个疾病对应的实体类
 * Create by yster@foxmail.com 2018/7/2/002 16:06
 */
@Entity
@Table(name = "illness")
public class Illness {
    @Id
    @GeneratedValue
    private long id;//疾病自增Id
    @Column(name = "name")
    private String name;//病名
    @OneToMany(cascade = {CascadeType.ALL},fetch = FetchType.EAGER)
    @JoinColumn(name = "s_id")
    private List<Symptom> symptom;//症状词集合

    public Illness() {
    }

    public Illness(Long id, String name,List<Symptom> symptom) {
        this.name = name;
        this.id = id;
        this.symptom = symptom;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Symptom> getSymptom() {
        return symptom;
    }

    public void setSymptom(List<Symptom> symptom) {
        this.symptom = symptom;
    }

}
