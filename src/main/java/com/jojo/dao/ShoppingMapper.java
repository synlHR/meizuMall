package com.jojo.dao;

import com.jojo.pojo.Shopping;
import java.util.List;

public interface ShoppingMapper {
    int deleteByPrimaryKey(Integer sid);

    int insert(Shopping record);

    Shopping selectByPrimaryKey(Integer sid);

    List<Shopping> selectAll();

    int updateByPrimaryKey(Shopping record);
}