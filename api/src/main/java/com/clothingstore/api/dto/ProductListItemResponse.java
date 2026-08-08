package com.clothingstore.api.dto;

import com.clothingstore.api.entity.Product;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ProductListItemResponse {

    private UUID id;
    private String name;
    private String slug;
    private BigDecimal basePrice;
    private String brand;
    private List<String> imageUrls;
    private UUID categoryId;

    public static ProductListItemResponse from(Product product, List<String> imageUrls) {
        ProductListItemResponse response = new ProductListItemResponse();
        response.id = product.getId();
        response.name = product.getName();
        response.slug = product.getSlug();
        response.basePrice = product.getBasePrice();
        response.brand = product.getBrand();
        response.imageUrls = imageUrls;
        if (product.getCategory() != null) {
            response.categoryId = product.getCategory().getId();
        }
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
}