package com.jojo.controller;


import com.jojo.dao.ShoppingMapper;
import com.jojo.pojo.Shopping;
import com.jojo.service.ShoppingListService;
import com.jojo.util.ResultVo;
import org.apache.commons.collections.map.PredicatedSortedMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.sound.midi.Soundbank;

@Controller//即是controller,又能返回json对象
@RequestMapping("/phones")
public class PhoneController {

    @Autowired
    private ShoppingListService shoppingListService;

    @RequestMapping("/getShoppingList")
    @ResponseBody
    public ResultVo getPhoneList(){
        System.out.println("dasdsad");
        ResultVo resultVo = shoppingListService.getShoppingList();
        System.out.println(resultVo);
        return resultVo;
    }
}
