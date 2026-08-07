package com.clothingstore.api.controller;

import com.clothingstore.api.dto.CategoryRequest;
import com.clothingstore.api.entity.Category;
import com.clothingstore.api.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    @Autowired private CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());

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