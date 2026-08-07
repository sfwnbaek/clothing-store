package com.clothingstore.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true)
    private String sku;

    private String size;

    private String color;

    @Column(name = "price_override")
    private BigDecimal priceOverride;

    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty = 0;

    @Version
    @Column(nullable = false)
    private Integer version = 0;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getPriceOverride() { return priceOverride; }
    public void setPriceOverride(BigDecimal priceOverride) { this.priceOverride = priceOverride; }

    public Integer getStockQty() { return stockQty; }
    public void setStockQty(Integer stockQty) { this.stockQty = stockQty; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}