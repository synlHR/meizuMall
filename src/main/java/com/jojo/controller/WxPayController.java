package com.jojo.controller;

import com.github.wxpay.sdk.MyWXConfig;
import com.github.wxpay.sdk.WXPay;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import io.goeasy.GoEasy;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/pay")
public class WxPayController {
    @RequestMapping("/generateCode")
    public void generateCode(Integer oid, HttpServletResponse response){
        MyWXConfig myWXConfig = new MyWXConfig();//加载商家的应用id  商家id 密钥
        try {
            WXPay wxpay = new WXPay(myWXConfig);
            Map<String, String> data = new HashMap<String, String>();
            data.put("body", "魅族手机");//商品描述
            data.put("out_trade_no", System.currentTimeMillis()+"");//商户订单号 唯一
            data.put("device_info", "");
            data.put("fee_type", "CNY");//人民币
            data.put("total_fee", "1");//金额，这里写一分钱，大家可以随意测试
            data.put("spbill_create_ip", "123.12.12.123");
            data.put("notify_url", "http://38awdi.natappfree.cc/pay/notifyPay");//通知商家平台是否成功支付的地址
            data.put("trade_type", "NATIVE");  // 此处指定为扫码支付
            data.put("product_id", "12");
            //调用统一下单接口
            Map<String, String> resp = wxpay.unifiedOrder(data);
            //resp:包含支付生成的短链接，可以根据此短链接生成二维码
            //使用zxing根据短链接生成支付二维码，并返回给前端
            HashMap<EncodeHintType,Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET,"utf-8");//设置编码格式
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);//容错率级别
            //边距
            hints.put(EncodeHintType.MARGIN,2);
            //生成二维码图片 encode:将具体的二维码内容和一些图片的参数传入生成二维码
            BitMatrix bitMatrix = new MultiFormatWriter().encode(resp.get("code_url"), BarcodeFormat.QR_CODE,200,200);
            //将生成的图片通过响应输入流，反馈给前端
            MatrixToImageWriter.writeToStream(bitMatrix,"png",response.getOutputStream());
            System.out.println("二维码创建完成");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    /**
     * 付钱之后才会进入此接口
     */
    @RequestMapping("/notifyPay")
    public void notifyPay(HttpServletRequest request, HttpServletResponse response){
        System.out.println("进入了通知商家的后台");
        try {
            ServletInputStream inputStream = request.getInputStream();
            //使用inputStream读取微信通知的内容
            byte [] buffer = new byte[1024];
            while(inputStream.read(buffer)!=-1){
                System.out.println(new String(buffer));
            }
            //通知平台的前端支付成功（使用第三方的消息推送goeasy告诉所有能够接收此消息的人，支付成功或者失败）;
            //查看goeasy的官方文档
            GoEasy goEasy = new GoEasy("http://rest-hangzhou.goeasy.io","BC-6b81de867ffe45c6bcab6c69719314f4");// Common key
            //使用goEasy的频倒发送消息
            goEasy.publish("jojo", "success");
            //给微信回复消息，是否收到微信的通知
            //使用官网给出的范例
            response.getWriter().write("<xml>\n" +
                    "  <return_code><![CDATA[SUCCESS]]></return_code>\n" +
                    "  <return_msg><![CDATA[OK]]></return_msg>\n" +
                    "</xml>");
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
