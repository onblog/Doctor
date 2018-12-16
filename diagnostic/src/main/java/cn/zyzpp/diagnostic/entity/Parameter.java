package cn.zyzpp.diagnostic.entity;

import java.util.List;

/**
 * 封装参数
 * {
 *   "sex":"男",
 *   "age":[
 *     20,
 *     30],
 *   "job":"农民",
 *   "symptom":[
 *     "吞酸","恶心","呕吐"]
 * }
 *
 * Create by yster@foxmail.com 2018/8/5/005 13:02
 */
public class Parameter {
    private String sex;//性别
    private List<Integer> age;//年龄区间
    private String job;//职业
    private List<String> symptom;//症状

    public Parameter() {
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public List<Integer> getAge() {
        return age;
    }

    public void setAge(List<Integer> age) {
        this.age = age;
    }

    public String getJob() {
        return job;
    }

    public void setJob(String job) {
        this.job = job;
    }

    public List<String> getSymptom() {
        return symptom;
    }

    public void setSymptom(List<String> symptom) {
        this.symptom = symptom;
    }
}
