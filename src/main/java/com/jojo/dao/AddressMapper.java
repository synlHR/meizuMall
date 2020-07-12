package com.jojo.dao;

import com.jojo.pojo.Address;
import java.util.List;

public interface AddressMapper {
    int deleteByPrimaryKey(Integer aid);

    int insert(Address record);

    Address selectByPrimaryKey(Integer aid);

    List<Address> selectAll();

    int updateByPrimaryKey(Address record);
}