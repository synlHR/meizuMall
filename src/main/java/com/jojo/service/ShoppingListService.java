package com.jojo.service;

import com.jojo.util.ResultVo;
import org.apache.ibatis.annotations.Param;

import javax.servlet.http.HttpSession;

public interface ShoppingListService {
    public ResultVo getShoppingList(Integer uid);

    void updateShoppingBySID(@Param("sid")Integer sid, @Param("num")Integer num);
}
