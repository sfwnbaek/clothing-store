package com.clothingstore.api.controller;

import com.clothingstore.api.entity.Product;
import com.clothingstore.api.entity.ProductImage;
import com.clothingstore.api.repository.ProductImageRepository;
import com.clothingstore.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products/{productId}/images")
public class AdminImageController {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Autowired private ProductRepository productRepository;
    @Autowired private ProductImageRepository productImageRepository;

    @PostMapping
    public ResponseEntity<ProductImage> uploadImage(
            @PathVariable UUID productId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Path targetPath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetPath);

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setUrl("/uploads/" + filename);
        image.setDisplayOrder(0);

        return ResponseEntity.ok(productImageRepository.save(image));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable UUID productId, @PathVariable UUID imageId) {
        return productImageRepository.findById(imageId)
                .map(image -> {
                    productImageRepository.delete(image);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

}