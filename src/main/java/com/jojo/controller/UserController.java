package com.jojo.controller;

import com.jojo.pojo.User;
import com.jojo.service.UserService;
import com.jojo.util.Md5Util;
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
    public ResultVo getVerifyCode(String telPhone,Integer loginOrRegist,HttpSession session){
//        System.out.println(telPhone+"---"+loginOrRegist);
        return userService.getVerifyCode(telPhone,loginOrRegist,session);
    }

    @RequestMapping("/login")
    public ResultVo login(@RequestBody User loginUser,HttpSession session){
        ResultVo resultVo = userService.login(loginUser,session);
        return resultVo;
    }

    @RequestMapping("/regist")
    public ResultVo regist(@RequestBody User registUser){
        System.out.println(registUser.getUsername()+"---"+registUser.getPassword());
        ResultVo resultVo = userService.regist(registUser);
        return resultVo;
    }

    @RequestMapping("/testPassword")
    public ResultVo testPassword(String password, HttpSession session){
        return userService.testPassword(password,session);

    }

    @RequestMapping("/changePassword")
    public ResultVo changePassword(String password,HttpSession session){
        return userService.changePassword(password,session);
    }

    @RequestMapping("/updateUsername")
    public ResultVo updateUsername(String username,HttpSession session){
        return userService.updateUsername(username,session);
    }
}
