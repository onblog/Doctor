package cn.zyzpp.diagnostic.exception;

/**
 * Create by yster@foxmail.com 2018/7/14/014 19:00
 */
public enum ResultEnum {
    PARM_ERROR(1, "参数错误"),
    MISSING(2,"缺少参数"),
    ;

    private Integer code;
    private String msg;

    private ResultEnum(Integer code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public Integer getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }

    @Override
    public String toString() {
        return "ResultEnum{" +
                "code=" + code +
                ", msg='" + msg + '\'' +
                '}';
    }
}
