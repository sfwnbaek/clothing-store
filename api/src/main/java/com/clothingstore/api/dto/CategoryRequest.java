package com.clothingstore.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class CategoryRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private UUID parentId;

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public UUID getParentId() { return parentId; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }
}