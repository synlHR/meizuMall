package com.jojo.service;

import com.jojo.pojo.User;
import com.jojo.util.ResultVo;

import javax.servlet.http.HttpSession;

public interface UserService {

    ResultVo regist(User registUser);

    User selectByUsername(String username);

    ResultVo login(User loginUser, HttpSession session);

    ResultVo getVerifyCode(String telPhone, Integer loginOrRegist, HttpSession session);

    ResultVo testPassword(String password, HttpSession session);

    ResultVo changePassword(String password, HttpSession session);

    ResultVo updateUsername(String username, HttpSession session);
}
