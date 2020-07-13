package com.jojo.service;

import com.jojo.util.ResultVo;

public interface OrderService {
    ResultVo addOrder(Integer[] ids, Double totalMoney);

    ResultVo getAddressByUid();

    ResultVo deleteAddressByAid(Integer aid);

    ResultVo getOrderDetailList(Integer oid);
}
