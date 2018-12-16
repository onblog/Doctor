package cn.zyzpp.diagnostic.entity;

import java.util.List;

/**
 *
 * 封装返回的疾病实体
 * Create by yster@foxmail.com 2018/7/23/023 20:08
 */
public class Medical {
    private long id;//Id
    private String name;//病名
    private List<String> part;//部位
    private List<String> family;//科室
    private Double score;//相关性得分
    private int number; //匹配的症状词数

    private String intro;//简介

    private String cause;// 病因

    private String diagnose;//诊断

    private String cure;//治疗

    private String prevent;//预防

    private String complication;//并发症

    private String symptom;//症状

    /*
    简介
     */
    private List<String> intro_list;

    /*
    病因
     */
    private List<String> cause_list;

    /*
    诊断
     */
    private List<String> diagnose_list;

    /*
    治疗
     */
    private List<String> cure_list;

    /*
    预防
     */
    private List<String> prevent_list;

    /*
    并发症词集合
     */
    private List<String> complication_list;
    /**
     * 症状词集合
     */
    private List<String> symptom_list;

    public Medical() {
    }
    public Medical(String name){
        this.name = name;
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

    public List<String> getComplication_list() {
        return complication_list;
    }

    public void setComplication_list(List<String> complication_list) {
        this.complication_list = complication_list;
    }

    public List<String> getSymptom_list() {
        return symptom_list;
    }

    public void setSymptom_list(List<String> symptom_list) {
        this.symptom_list = symptom_list;
    }

    public List<String> getFamily() {
        return family;
    }

    public void setFamily(List<String> family) {
        this.family = family;
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }

    public String getDiagnose() {
        return diagnose;
    }

    public void setDiagnose(String diagnose) {
        this.diagnose = diagnose;
    }

    public String getCure() {
        return cure;
    }

    public void setCure(String cure) {
        this.cure = cure;
    }

    public String getPrevent() {
        return prevent;
    }

    public void setPrevent(String prevent) {
        this.prevent = prevent;
    }

    public String getComplication() {
        return complication;
    }

    public void setComplication(String complication) {
        this.complication = complication;
    }

    public String getSymptom() {
        return symptom;
    }

    public void setSymptom(String symptom) {
        this.symptom = symptom;
    }

    public List<String> getCause_list() {
        return cause_list;
    }

    public void setCause_list(List<String> cause_list) {
        this.cause_list = cause_list;
    }

    public List<String> getDiagnose_list() {
        return diagnose_list;
    }

    public void setDiagnose_list(List<String> diagnose_list) {
        this.diagnose_list = diagnose_list;
    }

    public List<String> getCure_list() {
        return cure_list;
    }

    public void setCure_list(List<String> cure_list) {
        this.cure_list = cure_list;
    }

    public List<String> getPrevent_list() {
        return prevent_list;
    }

    public void setPrevent_list(List<String> prevent_list) {
        this.prevent_list = prevent_list;
    }

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    public List<String> getIntro_list() {
        return intro_list;
    }

    public void setIntro_list(List<String> intro_list) {
        this.intro_list = intro_list;
    }


    public List<String> getPart() {
        return part;
    }

    public void setPart(List<String> part) {
        this.part = part;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    @Override
    public String toString() {
        return "Medical{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", part=" + part +
                ", family=" + family +
                ", score='" + score + '\'' +
                ", cause='" + cause + '\'' +
                ", diagnose='" + diagnose + '\'' +
                ", cure='" + cure + '\'' +
                ", prevent='" + prevent + '\'' +
                ", complication='" + complication + '\'' +
                ", symptom='" + symptom + '\'' +
                '}';
    }

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
    }
}
