package com.clothingstore.api.spec;

import com.clothingstore.api.entity.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecification {

    public static Specification<Product> hasCategorySlug(String categorySlug) {
        return (root, query, cb) -> {
            if (categorySlug == null || categorySlug.isBlank()) return cb.conjunction();
            return cb.equal(root.get("category").get("slug"), categorySlug);
        };
    }

    public static Specification<Product> minPrice(BigDecimal min) {
        return (root, query, cb) -> {
            if (min == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("basePrice"), min);
        };
    }

    public static Specification<Product> maxPrice(BigDecimal max) {
        return (root, query, cb) -> {
            if (max == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("basePrice"), max);
        };
    }

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

}