package cn.zyzpp.entity.d3;

/**
 * Create by yster@foxmail.com 2018/7/8/008 22:52
 */
public class D3Relation {
    private long source;
    private long target;
    private String relation;
    private double value;

    public D3Relation() {
    }

    public D3Relation(long source, long target) {
        this.source = source;
        this.target = target;
    }

    public D3Relation(long source, long target, String relation, double value) {
        this.source = source;
        this.target = target;
        this.relation = relation;
        this.value = value;
    }

    public long getSource() {
        return source;
    }

    public void setSource(long source) {
        this.source = source;
    }

    public long getTarget() {
        return target;
    }

    public void setTarget(long target) {
        this.target = target;
    }

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }
}
