package com.jojo.dao;

import com.jojo.pojo.Collection;
import java.util.List;

public interface CollectionMapper {
    int deleteByPrimaryKey(Integer cid);

    int insert(Collection record);

    Collection selectByPrimaryKey(Integer cid);

    List<Collection> selectAll();

    int updateByPrimaryKey(Collection record);
}