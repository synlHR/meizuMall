package com.jojo.controller;

import com.jojo.pojo.User;
import com.jojo.service.UserService;
import com.jojo.util.ResultVo;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @RequestMapping("/getLoginUsername")
    public ResultVo getLoginUsername(String username){
        User user = userService.selectByUsername(username);
        if(user != null){
//            session.setAttribute("unLoginUser",user);
            return ResultVo.success("账号存在",user);
        }
        return ResultVo.error("用户不存在，请先注册");
    }

    @RequestMapping("/getUserByUsername")
    public ResultVo getUserByUsername(String telPhone){
        User user = userService.selectByUsername(telPhone);
//        System.out.println(user.getUsername());
        if(user != null){
            return ResultVo.error("该用户已存在，请直接登录");
        }
        return ResultVo.success("");
    }

    @RequestMapping("/getVerifyCode")
    public ResultVo getVerifyCode(String telPhone,Integer loginOrRegist){
        System.out.println(telPhone);
        if("".equals(telPhone) || telPhone == null){
            return ResultVo.error("手机号不能为空");
        }else if(telPhone.length() != 11){
            return ResultVo.error("手机号输入有误，请检查输入");
        }
        if(loginOrRegist == 1){ //代表登录时验证码
            User user = userService.selectByUsername(telPhone);
            if(user == null){
                return ResultVo.error("账号不存在,请先注册");
            }
        }
        Integer verifyCode = (int)((Math.random()*9+1)*100000);
        System.out.println(verifyCode);
        return ResultVo.success("成功",verifyCode);

    }

    @RequestMapping("/login")
    public ResultVo login(@RequestBody User loginUser,HttpSession session){
//        System.out.println(loginUser.getUsername()+"---"+loginUser.getPassword());
        session.setAttribute("loginUser",loginUser);
        ResultVo resultVo = userService.login(loginUser);
        return resultVo;
    }

    @RequestMapping("/regist")
    public ResultVo regist(@RequestBody User registUser){
        System.out.println(registUser.getUsername()+"---"+registUser.getPassword());
        ResultVo resultVo = userService.regist(registUser);
        return resultVo;
    }
}
