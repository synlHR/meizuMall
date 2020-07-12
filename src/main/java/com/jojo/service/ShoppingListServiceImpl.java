package com.jojo.service;

import com.jojo.dao.ImageMapper;
import com.jojo.dao.PhoneMapper;
import com.jojo.dao.ShoppingMapper;
import com.jojo.pojo.Image;
import com.jojo.pojo.Phone;
import com.jojo.pojo.Shopping;
import com.jojo.util.ResultVo;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShoppingListServiceImpl implements ShoppingListService {

    @Autowired
    private ShoppingMapper shoppingMapper;

    @Autowired
    private PhoneMapper phoneMapper;

    @Autowired
    private ImageMapper imageMapper;

    @Override
    public ResultVo getShoppingList(Integer uid) {
        List<Shopping> shoppingList = shoppingMapper.selectByUid(uid);
        System.out.println(shoppingList);
        for(Shopping shopping:shoppingList){
            Phone phone = phoneMapper.selectByPrimaryKey(shopping.getPid());
            shopping.setPhone(phone);
            List<Image> imageList = imageMapper.selectByCid(shopping.getCid());
            String imageUrl = imageList.get(0).getUrl();
            shopping.setImageUrl(imageUrl);
        }
        return ResultVo.success("success",shoppingList);
    }

    @Override
    public void updateShoppingBySID(@Param("sid")Integer sid, @Param("num")Integer num) {
        shoppingMapper.updateShoppingBySID(sid,num);
    }
}
