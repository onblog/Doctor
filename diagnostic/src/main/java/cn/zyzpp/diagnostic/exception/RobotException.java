package cn.zyzpp.diagnostic.exception;

/**
 * Create by yster@foxmail.com 2018/7/14/014 18:52
 */
public class RobotException extends RuntimeException {
    private Integer code;

    public RobotException(ResultEnum resultEnum) {
        super(resultEnum.getMsg());
        this.code=resultEnum.getCode();
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }


}
