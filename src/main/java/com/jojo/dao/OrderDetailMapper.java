package com.jojo.dao;

import com.jojo.pojo.OrderDetail;
import java.util.List;

public interface OrderDetailMapper {
    int deleteByPrimaryKey(Integer odid);

    int insert(OrderDetail record);

    OrderDetail selectByPrimaryKey(Integer odid);

    List<OrderDetail> selectAll();

    int updateByPrimaryKey(OrderDetail record);

    void addOrderDetail(OrderDetail orderDetail);

    List<OrderDetail> getOrderDetailList(Integer oid);
}