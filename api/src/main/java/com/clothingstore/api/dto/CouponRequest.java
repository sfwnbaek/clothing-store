package com.clothingstore.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class CouponRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String discountType; // PERCENTAGE or FIXED_AMOUNT

    @NotNull
    @Positive
    private java.math.BigDecimal discountValue;

    private Integer maxUses;
    private LocalDateTime expiresAt;

    // Getters and setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public java.math.BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(java.math.BigDecimal discountValue) { this.discountValue = discountValue; }

    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}