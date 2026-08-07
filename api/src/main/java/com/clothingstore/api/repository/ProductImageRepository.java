package com.clothingstore.api.repository;

import com.clothingstore.api.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProductIdOrderByDisplayOrder(UUID productId);

}