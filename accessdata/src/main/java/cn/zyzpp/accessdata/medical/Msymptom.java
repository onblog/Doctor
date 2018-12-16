package cn.zyzpp.accessdata.medical;

import javax.persistence.*;
import java.util.List;

/**
 * 症状的实体
 * Create by yster@foxmail.com 2018/7/24/024 12:58
 */
@Entity
@Table(name = "msymptom")
public class Msymptom {
    @Id
    @GeneratedValue
    private long id;//Id
    @Column(name = "name",unique = true)
    private String name;//症状名
    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name="position")
    private List<String> part;//部位
    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn(name="position")
    private List<String> family;//科室

    @Column(columnDefinition="TEXT")
    private String intro;//简介
    @Column(columnDefinition="TEXT")
    private String cause;// 病因
    @Column(columnDefinition="TEXT")
    private String diagnose;//诊断
    @Column(columnDefinition="TEXT")
    private String examine;//检查

    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name="position")
    private List<String> intro_list;
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name="position")
    private List<String> cause_list;
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name="position")
    private List<String> diagnose_list;
    @ElementCollection(fetch = FetchType.LAZY)
    @OrderColumn(name="position")
    private List<String> examine_list;

    public Msymptom() {
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

    public List<String> getPart() {
        return part;
    }

    public void setPart(List<String> part) {
        this.part = part;
    }

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
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

    public String getExamine() {
        return examine;
    }

    public void setExamine(String examine) {
        this.examine = examine;
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

    public List<String> getExamine_list() {
        return examine_list;
    }

    public void setExamine_list(List<String> examine_list) {
        this.examine_list = examine_list;
    }

    public List<String> getFamily() {
        return family;
    }

    public void setFamily(List<String> family) {
        this.family = family;
    }

    public List<String> getIntro_list() {
        return intro_list;
    }

    public void setIntro_list(List<String> intro_list) {
        this.intro_list = intro_list;
    }
}
