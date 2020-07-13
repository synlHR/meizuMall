package com.jojo.controller;

import com.jojo.pojo.Address;
import com.jojo.pojo.OrderAddVo;
import com.jojo.service.OrderService;
import com.jojo.util.ResultVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;


    @RequestMapping("/add")
    public ResultVo add(@RequestBody OrderAddVo orderAddVo){
        ResultVo resultVo = orderService.addOrder(orderAddVo.getIds(),orderAddVo.getTotalMoney());
        System.out.println(resultVo);
        return resultVo;
    }

    @RequestMapping("/getAddressByUid")
    public ResultVo getAddressByUid(){
        ResultVo resultVo = orderService.getAddressByUid();
        return resultVo;
    }

    @RequestMapping("/deleteAddressByAid")
    public ResultVo deleteAddressByAid(Integer aid){
        ResultVo resultVo = orderService.deleteAddressByAid(aid);
        return resultVo;
    }

    @RequestMapping("/getOrderDetailList")
    public ResultVo getOrderDetailList(Integer oid){
        ResultVo resultVo = orderService.getOrderDetailList(oid);
        return resultVo;
    }

    @RequestMapping("/updateAddressByAid")
    public ResultVo updateAddressByAid(@RequestBody Address address){
        System.out.println(address.toString());
        ResultVo resultVo = orderService.updateAddressByAid(address);
        return resultVo;
    }

    @RequestMapping("/addNewAddress")
    public ResultVo addNewAddress(@RequestBody Address address){
        ResultVo resultVo = orderService.addNewAddress(address);
        return resultVo;
    }
}
