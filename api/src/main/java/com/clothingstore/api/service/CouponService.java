package com.clothingstore.api.service;

import com.clothingstore.api.entity.Coupon;
import com.clothingstore.api.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class CouponService {

    @Autowired private CouponRepository couponRepository;

    public Coupon validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalStateException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new IllegalStateException("This coupon is no longer active");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("This coupon has expired");
        }

        if (coupon.getMaxUses() != null && coupon.getTimesUsed() >= coupon.getMaxUses()) {
            throw new IllegalStateException("This coupon has reached its usage limit");
        }

        return coupon;
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal discount;
        if ("PERCENTAGE".equals(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        } else {
            discount = coupon.getDiscountValue();
        }

        // Never let a discount exceed the subtotal (no negative totals)
        return discount.min(subtotal);
    }

    public void recordUsage(Coupon coupon) {
        coupon.setTimesUsed(coupon.getTimesUsed() + 1);
        couponRepository.save(coupon);
    }

}