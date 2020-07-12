package com.jojo.dao;

import com.jojo.pojo.Memory;
import java.util.List;

public interface MemoryMapper {
    int deleteByPrimaryKey(Integer mid);

    int insert(Memory record);

    Memory selectByPrimaryKey(Integer mid);

    List<Memory> selectAll();

    int updateByPrimaryKey(Memory record);
}