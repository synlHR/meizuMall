package com.jojo.service;

import com.jojo.dao.UserMapper;
import com.jojo.pojo.User;
import com.jojo.util.Md5Util;
import com.jojo.util.ResultVo;
import com.jojo.util.VerifyCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;


@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public ResultVo regist(User registUser) {

        registUser.setPassword(Md5Util.secret(registUser.getUsername(), registUser.getPassword()));

        int insert = userMapper.insert(registUser);
        if(insert > 0){
            return ResultVo.success("注册成功");
        }
        return ResultVo.error("注册失败");

    }

    @Override
    public User selectByUsername(String username) {
        User user = userMapper.selectByUsername(username);

        return user;
    }

    @Override
    public ResultVo login(User loginUser, HttpSession session) {
        User user = userMapper.selectByUsername(loginUser.getUsername());
        if(user == null){
            return ResultVo.error("该用户未注册，请先注册");
        }
        if(!user.getPassword().equals(Md5Util.secret(loginUser.getUsername(),loginUser.getPassword()))){
            return ResultVo.error("用户名或密码错误");
        }
        loginUser.setPassword(Md5Util.secret(loginUser.getUsername(),loginUser.getPassword()));
        User user1 = userMapper.selectByUsername(loginUser.getUsername());
        loginUser.setUid(user1.getUid());
        session.setAttribute("loginUser",loginUser);
        System.out.println("登录时"+user.getUsername()+"---"+user.getPassword());
        return ResultVo.success("登录成功",loginUser);
    }

    @Override
    public ResultVo getVerifyCode(String telPhone, Integer loginOrRegist, HttpSession session) {
        System.out.println(telPhone);
        if("".equals(telPhone) || telPhone == null){
            return ResultVo.error("手机号不能为空");
        }else if(telPhone.length() != 11){
            return ResultVo.error("手机号输入有误，请检查输入");
        }
        User user = userMapper.selectByUsername(telPhone);
        if(loginOrRegist == 1){ //代表登录时验证码
            if(user == null){
                return ResultVo.error("账号不存在,请先注册");
            }
        }else if(loginOrRegist == 2){
            User loginUser = (User) session.getAttribute("loginUser");
            System.out.println(loginUser.getUsername()+"---"+telPhone);
            if(!loginUser.getUsername().equals(telPhone)){
                return ResultVo.error("手机号输入有误，请检查输入");
            }
        }else if(loginOrRegist == 3){
            if(user != null){
                return ResultVo.error("该手机号已经被注册");
            }
        }
//        System.out.println(telPhone+"!!!!");
//        Integer verifyCode = VerifyCode.getVerifyCode(telPhone);
        int verifyCode = (int)((Math.random()*9+1)*100000);
        System.out.println(verifyCode);
        return ResultVo.success("成功",verifyCode);
    }

    @Override
    public ResultVo testPassword(String password, HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
//        System.out.println(loginUser.getUsername());
        User user = userMapper.selectByUsername(loginUser.getUsername());
        String truePassword = user.getPassword();
        if(!truePassword.equals(Md5Util.secret(loginUser.getUsername(),password))){
            return ResultVo.error("原密码错误");
        }
        return ResultVo.success("");
    }

    @Override
    public ResultVo changePassword(String password, HttpSession session) {
        User loginUser = (User)session.getAttribute("loginUser");
        loginUser.setPassword(Md5Util.secret(loginUser.getUsername(),password));
        userMapper.updatePasswordById(loginUser);
//        session.setAttribute("loginUser",loginUser);
        session.removeAttribute("loginUser");
        return ResultVo.success("密码更新成功，请重新登录");
    }

    @Override
    public ResultVo updateUsername(String username, HttpSession session) {
        User loginUser = (User) session.getAttribute("loginUser");
        User user = userMapper.selectByUsername(loginUser.getUsername());
//        Integer uid = user.getUid();
        user.setUsername(username);
        user.setPassword(Md5Util.secret(user.getUsername(),user.getPassword()));
        System.out.println("修改手机号时"+user.getUsername()+"---"+user.getPassword());
        userMapper.updateUsername(user);
        userMapper.updatePasswordById(user);
        session.removeAttribute("loginUser");
        return ResultVo.success("手机号修改成功，请重新登录");
    }
}
