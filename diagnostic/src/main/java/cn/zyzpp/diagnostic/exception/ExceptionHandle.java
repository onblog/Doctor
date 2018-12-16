package cn.zyzpp.diagnostic.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Create by yster@foxmail.com 2018/7/14/014 18:57
 */
//@ControllerAdvice
public class ExceptionHandle {

    @ExceptionHandler(value = Exception.class)
    @ResponseBody
    public Object handle(Exception e){
        if(e instanceof RobotException){
            return  new ResultUtil(((RobotException)e).getCode(),e.getMessage());
        }else{
            return new ResultUtil(500,e.getMessage()) ;
        }
    }
}
