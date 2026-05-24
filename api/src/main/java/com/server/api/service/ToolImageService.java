package com.server.api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.server.api.model.Tools;
import com.server.api.repository.ToolsRepository;

@Service
public class ToolImageService {

    private static final Set<String> ALLOWED = Set.of("image/png", "image/jpeg", "image/webp");
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final ToolsRepository toolsRepository;
    private final Path uploadRoot;

    public ToolImageService(ToolsRepository toolsRepository,
                            @Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.toolsRepository = toolsRepository;
        this.uploadRoot = Paths.get(uploadDir, "tools").toAbsolutePath().normalize();
        Files.createDirectories(this.uploadRoot);
    }

    public Tools save(UUID toolId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Imagem maior que 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Tipo não suportado. Use png, jpeg ou webp.");
        }

        Tools tool = toolsRepository.findById(toolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferramenta não encontrada"));

        String ext = switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };

        String filename = toolId + "." + ext;
        Path dest = uploadRoot.resolve(filename).normalize();
        if (!dest.startsWith(uploadRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Caminho inválido");
        }

        deleteIfExists(tool.getImagePath());

        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        tool.setImagePath(filename);
        return toolsRepository.save(tool);
    }

    public LoadedImage load(UUID toolId) throws IOException {
        Tools tool = toolsRepository.findById(toolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferramenta não encontrada"));
        String name = tool.getImagePath();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sem imagem");
        }
        Path p = uploadRoot.resolve(name).normalize();
        if (!p.startsWith(uploadRoot) || !Files.exists(p)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado");
        }
        String contentType = Files.probeContentType(p);
        if (contentType == null) contentType = "application/octet-stream";
        return new LoadedImage(Files.readAllBytes(p), contentType);
    }

    public void delete(UUID toolId) {
        toolsRepository.findById(toolId).ifPresent(t -> {
            deleteIfExists(t.getImagePath());
            t.setImagePath(null);
            toolsRepository.save(t);
        });
    }

    private void deleteIfExists(String name) {
        if (name == null || name.isBlank()) return;
        try {
            Path p = uploadRoot.resolve(name).normalize();
            if (p.startsWith(uploadRoot)) Files.deleteIfExists(p);
        } catch (IOException ignored) {}
    }

    public record LoadedImage(byte[] bytes, String contentType) {}
}
