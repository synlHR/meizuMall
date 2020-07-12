package com.jojo.dao;

import com.jojo.pojo.Collections;
import java.util.List;

public interface CollectionsMapper {
    int deleteByPrimaryKey(Integer cid);

    int insert(Collections record);

    Collections selectByPrimaryKey(Integer cid);

    List<Collections> selectAll();

    int updateByPrimaryKey(Collections record);
}