package cn.zyzpp.diagnostic.exception;

/**
 * Create by yster@foxmail.com 2018/7/14/014 19:57
 */
public class ResultUtil {
    private int code;
    private String msg;

    public ResultUtil(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
