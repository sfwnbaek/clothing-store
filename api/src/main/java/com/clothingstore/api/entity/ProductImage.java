package com.clothingstore.api.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public ProductVariant getVariant() { return variant; }
    public void setVariant(ProductVariant variant) { this.variant = variant; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}