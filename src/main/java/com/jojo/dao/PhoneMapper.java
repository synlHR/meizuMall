package com.jojo.dao;

import com.jojo.pojo.Phone;
import java.util.List;

public interface PhoneMapper {
    int deleteByPrimaryKey(Integer pid);

    int insert(Phone record);

    Phone selectByPrimaryKey(Integer pid);

    List<Phone> selectAll();

    int updateByPrimaryKey(Phone record);
}