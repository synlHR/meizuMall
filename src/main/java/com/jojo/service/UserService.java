package com.jojo.service;

import com.jojo.pojo.User;
import com.jojo.util.ResultVo;

public interface UserService {

    ResultVo regist(User registUser);

    User selectByUsername(String username);

    ResultVo login(User loginUser);
}
