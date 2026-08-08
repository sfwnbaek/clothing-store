package com.clothingstore.api.controller;

import com.clothingstore.api.dto.CategoryResponse;
import com.clothingstore.api.entity.Category;
import com.clothingstore.api.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Category> getCategoryBySlug(@PathVariable String slug) {
        return categoryRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}