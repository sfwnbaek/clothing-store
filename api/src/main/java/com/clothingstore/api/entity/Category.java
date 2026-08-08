package com.clothingstore.api.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(name = "size_type", nullable = false)
    private String sizeType = "APPAREL";

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public Category getParent() { return parent; }
    public void setParent(Category parent) { this.parent = parent; }
    
    public String getSizeType() { return sizeType; }
    public void setSizeType(String sizeType) { this.sizeType = sizeType; }
}