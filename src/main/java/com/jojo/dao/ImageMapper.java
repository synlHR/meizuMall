package com.jojo.dao;

import com.jojo.pojo.Image;
import java.util.List;

public interface ImageMapper {
    int deleteByPrimaryKey(Integer iid);

    int insert(Image record);

    Image selectByPrimaryKey(Integer iid);

    List<Image> selectAll();

    int updateByPrimaryKey(Image record);

    List<Image> selectByCid(Integer cid);
}