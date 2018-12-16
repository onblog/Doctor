package cn.zyzpp.entity.elastic;

import org.springframework.data.elasticsearch.annotations.Document;

import java.util.List;

/**
 * Create by yster@foxmail.com 2018/6/9/009 20:39
 */
@Document(indexName = "diseases",type = "disease")
public class EsDisease {
    private long id;
    private String name; //疾病名
    private List<String> symptom; //症状词集合

    public EsDisease() {
    }

    public EsDisease(long id, String name, List<String> symptom) {
        this.id = id;
        this.name = name;
        this.symptom = symptom;
    }

    public EsDisease(long id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getSymptom() {
        return symptom;
    }

    public void setSymptom(List<String> symptom) {
        this.symptom = symptom;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "EsDisease{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", symptom=" + symptom +
                '}';
    }
}
