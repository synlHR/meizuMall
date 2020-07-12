package com.jojo.pojo;

import java.io.Serializable;

public class Image implements Serializable {
    private Integer iid;

    private Integer cid;

    private String url;

    private static final long serialVersionUID = 1L;

    public Integer getIid() {
        return iid;
    }

    public void setIid(Integer iid) {
        this.iid = iid;
    }

    public Integer getCid() {
        return cid;
    }

    public void setCid(Integer cid) {
        this.cid = cid;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url == null ? null : url.trim();
    }
}