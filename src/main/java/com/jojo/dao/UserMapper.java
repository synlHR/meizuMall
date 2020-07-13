package com.jojo.dao;

import com.jojo.pojo.User;
import java.util.List;

public interface UserMapper {
    int deleteByPrimaryKey(Integer uid);

    int insert(User record);

    User selectByPrimaryKey(Integer uid);

    List<User> selectAll();

    int updateByPrimaryKey(User record);


    User selectByUsername(String username);

    void updatePasswordById(User loginUser);

    void updateUsername(User user);
}