package com.clothingstore.api.dto;

import com.clothingstore.api.entity.Category;

import java.util.UUID;

public class CategoryResponse {

    private UUID id;
    private String name;
    private String slug;
    private String sizeType;
    private String imageUrl;

    public static CategoryResponse from(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.id = category.getId();
        response.name = category.getName();
        response.slug = category.getSlug();
        response.sizeType = category.getSizeType();
        response.imageUrl = category.getImageUrl();
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getSizeType() { return sizeType; }
    public void setSizeType(String sizeType) { this.sizeType = sizeType; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}