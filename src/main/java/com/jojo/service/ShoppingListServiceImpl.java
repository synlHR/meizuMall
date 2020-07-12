package com.jojo.service;

import com.jojo.dao.PhoneMapper;
import com.jojo.dao.ShoppingMapper;
import com.jojo.pojo.Phone;
import com.jojo.pojo.Shopping;
import com.jojo.util.ResultVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShoppingListServiceImpl implements ShoppingListService {

    @Autowired
    private ShoppingMapper shoppingMapper;

    @Autowired
    private PhoneMapper phoneMapper;

    @Override
    public ResultVo getShoppingList() {
        List<Shopping> shoppingList = shoppingMapper.selectByUid(1);
        for(Shopping shopping:shoppingList){
            Phone phone = phoneMapper.selectByPrimaryKey(shopping.getPid());
            shopping.setPhone(phone);
        }
        return ResultVo.success("success",shoppingList);
    }
}
