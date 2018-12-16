package cn.zyzpp.diagnostic.entity.graph;

/**
 * Create by yster@foxmail.com 2018/9/14/014 21:08
 */
public class Link {
    private int source;
    private int target;
    private String relation;

    public Link(int source, int target, String relation) {
        this.source = source;
        this.target = target;
        this.relation = relation;
    }

    public int getSource() {
        return source;
    }

    public void setSource(int source) {
        this.source = source;
    }

    public int getTarget() {
        return target;
    }

    public void setTarget(int target) {
        this.target = target;
    }

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }
}
