package com.clothingstore.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public class ProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private String description;

    @NotNull
    @Positive
    private BigDecimal basePrice;

    private String brand;
    private UUID categoryId;
    private boolean active = true;

    // Getters and setters
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

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}