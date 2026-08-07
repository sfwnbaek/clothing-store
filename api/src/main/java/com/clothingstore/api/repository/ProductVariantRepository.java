package com.clothingstore.api.repository;

import com.clothingstore.api.entity.Product;
import com.clothingstore.api.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProduct(Product product);

    List<ProductVariant> findByProductId(UUID productId);

}