package com.jojo.service;

import com.jojo.dao.UserMapper;
import com.jojo.pojo.User;
import com.jojo.util.Md5Util;
import com.jojo.util.ResultVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


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
    public ResultVo login(User loginUser) {
        User user = userMapper.selectByUsername(loginUser.getUsername());
        if(user == null){
            return ResultVo.error("该用户未注册，请先注册");
        }
        if(!user.getPassword().equals(Md5Util.secret(loginUser.getUsername(),loginUser.getPassword()))){
            return ResultVo.error("用户名或密码错误");
        }

        return ResultVo.success("登录成功",loginUser);
    }
}
