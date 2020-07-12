package com.jojo.util;

import org.apache.shiro.crypto.hash.Md5Hash;

public class Md5Util {

    /**
     * 加盐加密的方法,返回加盐加密之后的结果
     * @return   使用账号作为盐进行加密
     */
    public static String secret(String salt,String password){
        //参数依次是:原始密码  盐   散列迭代次数
        Md5Hash md5Hash = new Md5Hash(password, salt, 100);
        return md5Hash.toString();
    }

    public static void main(String[] args) {
        secret("18772883493","123456");
    }
}
