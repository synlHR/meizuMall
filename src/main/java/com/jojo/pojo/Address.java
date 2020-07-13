package com.jojo.pojo;

import java.io.Serializable;
import java.util.List;

public class Address implements Serializable {
    private Integer aid;

    private Integer uid;

    private String name;

    private String tel;

    private String province;

    private String city;

    private String country;

    private String addresDetail;

    private static final long serialVersionUID = 1L;

    public Integer getAid() {
        return aid;
    }

    public void setAid(Integer aid) {
        this.aid = aid;
    }

    public Integer getUid() {
        return uid;
    }

    public void setUid(Integer uid) {
        this.uid = uid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel == null ? null : tel.trim();
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province == null ? null : province.trim();
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city == null ? null : city.trim();
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country == null ? null : country.trim();
    }

    public String getAddresDetail() {
        return addresDetail;
    }

    public void setAddresDetail(String addresDetail) {
        this.addresDetail = addresDetail == null ? null : addresDetail.trim();
    }

    @Override
    public String toString() {
        return "Address{" +
                "aid=" + aid +
                ", uid=" + uid +
                ", name='" + name + '\'' +
                ", tel='" + tel + '\'' +
                ", province='" + province + '\'' +
                ", city='" + city + '\'' +
                ", country='" + country + '\'' +
                ", addresDetail='" + addresDetail+
                '}';
    }
}