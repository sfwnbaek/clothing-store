package com.clothingstore.api.controller;

import com.clothingstore.api.entity.PromoBanner;
import com.clothingstore.api.repository.PromoBannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/banners")
public class AdminBannerController {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Autowired private PromoBannerRepository promoBannerRepository;

    @GetMapping
    public List<PromoBanner> getAllBanners() {
        return promoBannerRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<PromoBanner> createBanner(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String headline,
            @RequestParam(required = false) String linkUrl
    ) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Files.copy(file.getInputStream(), uploadPath.resolve(filename));

        PromoBanner banner = new PromoBanner();
        banner.setImageUrl("/uploads/" + filename);
        banner.setHeadline(headline);
        banner.setLinkUrl(linkUrl);

        return ResponseEntity.ok(promoBannerRepository.save(banner));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<PromoBanner> toggleActive(@PathVariable UUID id) {
        return promoBannerRepository.findById(id)
                .map(banner -> {
                    banner.setActive(!banner.isActive());
                    return ResponseEntity.ok(promoBannerRepository.save(banner));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable UUID id) {
        if (!promoBannerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        promoBannerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }

}