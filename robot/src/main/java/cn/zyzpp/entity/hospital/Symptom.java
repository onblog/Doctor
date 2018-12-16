package cn.zyzpp.entity.hospital;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Create by yster@foxmail.com 2018/7/2/002 16:30
 */
@Entity
@Table(name = "symptom")
public class Symptom {
    @Id
    @GeneratedValue
    private Long id;
    private String symptom;

    public Symptom(Long id, String symptom) {
        this.id = id;
        this.symptom = symptom;
    }

    public Symptom() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSymptom() {
        return symptom;
    }

    public void setSymptom(String symptom) {
        this.symptom = symptom;
    }

    @Override
    public String toString() {
        return "Symptom{" +
                "id=" + id +
                ", symptom='" + symptom + '\'' +
                '}';
    }
}
