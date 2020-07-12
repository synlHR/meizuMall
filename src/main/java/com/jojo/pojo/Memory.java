package com.jojo.pojo;

import java.io.Serializable;

public class Memory implements Serializable {
    private Integer mid;

    private String memoryname;

    private Integer addprice;

    private static final long serialVersionUID = 1L;

    public Integer getMid() {
        return mid;
    }

    public void setMid(Integer mid) {
        this.mid = mid;
    }

    public String getMemoryname() {
        return memoryname;
    }

    public void setMemoryname(String memoryname) {
        this.memoryname = memoryname == null ? null : memoryname.trim();
    }

    public Integer getAddprice() {
        return addprice;
    }

    public void setAddprice(Integer addprice) {
        this.addprice = addprice;
    }
}