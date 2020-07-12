package com.jojo.controller;


import com.jojo.pojo.Image;
import com.jojo.service.ShoppingListService;
import com.jojo.util.ResultVo;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController//即是controller,又能返回json对象
@RequestMapping("/phones")
public class PhoneController {

    @Autowired
    private ShoppingListService shoppingListService;

    @RequestMapping("/getShoppingList")
    public ResultVo getPhoneList(){
        Integer uid = 1;
        ResultVo resultVo = shoppingListService.getShoppingList(uid);
        System.out.println(resultVo);
        return resultVo;
    }

    @RequestMapping("/updateShoppingBySID")
    public void updateShoppingBySID(@Param("sid")Integer sid,@Param("num")Integer num){
        System.out.println(sid + " " + num);
        shoppingListService.updateShoppingBySID(sid,num);
    }
}
