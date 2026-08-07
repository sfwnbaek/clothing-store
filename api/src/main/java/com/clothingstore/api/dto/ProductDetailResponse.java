package com.clothingstore.api.dto;

import com.clothingstore.api.entity.Product;
import com.clothingstore.api.entity.ProductImage;
import com.clothingstore.api.entity.ProductVariant;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ProductDetailResponse {

    private UUID id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private String brand;
    private String categoryName;
    private String categorySlug;
    private List<ProductVariantResponse> variants;
    private List<String> imageUrls;

    public static ProductDetailResponse from(Product product, List<ProductVariant> variants, List<ProductImage> images) {
        ProductDetailResponse response = new ProductDetailResponse();
        response.id = product.getId();
        response.name = product.getName();
        response.slug = product.getSlug();
        response.description = product.getDescription();
        response.basePrice = product.getBasePrice();
        response.brand = product.getBrand();
        if (product.getCategory() != null) {
            response.categoryName = product.getCategory().getName();
            response.categorySlug = product.getCategory().getSlug();
        }
        response.variants = variants.stream()
                .map(ProductVariantResponse::from)
                .collect(Collectors.toList());
        response.imageUrls = images.stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }

    public List<ProductVariantResponse> getVariants() { return variants; }
    public void setVariants(List<ProductVariantResponse> variants) { this.variants = variants; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}