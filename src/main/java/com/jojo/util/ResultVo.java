package com.jojo.util;



/**
 * 返回给前端json数据的公共规范类:有可能成功或者失败
 */
public class ResultVo {
    /**
     * code:响应的状态码
     */
    private Integer code;
    /**
     * 状态描述
     */
    private String msg;
    /**
     * 返回值(返回给前端的数据)
     */
    private Object data;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    /**
     * 构造方法私有化
     *
     */
    private ResultVo(){}

    public static ResultVo success(String msg){
        return success(msg,null);
    }
    /**
     * 接口调用成功，执行success方法
     * 状态码：0  代表成功
     */
    public static ResultVo success(String msg,Object data){
        return createVo(0,msg,data);
    }
    /**
     * 接口调用失败，执行error方法
     * 状态码：1 代表失败
     */
    public static ResultVo error(String msg,Object data){
        return createVo(1,msg,data);
    }
    public static ResultVo error(String msg){
        return error(msg,null);
    }
    private static ResultVo createVo(Integer code,String msg,Object data){
        ResultVo resultVo = new ResultVo();
        resultVo.setCode(code);
        resultVo.setMsg(msg);
        resultVo.setData(data);
        return resultVo;
    }
}
