package com.clothingstore.api.controller;

import com.clothingstore.api.dto.CategoryRequest;
import com.clothingstore.api.entity.Category;
import com.clothingstore.api.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Autowired private CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setSizeType(request.getSizeType());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found"));
            category.setParent(parent);
        }

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Category> uploadCategoryImage(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Files.copy(file.getInputStream(), uploadPath.resolve(filename));

        category.setImageUrl("/uploads/" + filename);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
                
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setSizeType(request.getSizeType());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found"));
            category.setParent(parent);
        }

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}