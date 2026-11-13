package com.energiadc;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class EnergiaDcApplication {
    public static void main(String[] args) {
        Dotenv.configure().ignoreIfMissing().load().entries()
                .forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        try { Files.createDirectories(Path.of("data")); }
        catch (IOException ex) { throw new IllegalStateException("Não foi possível criar a pasta local do banco.", ex); }
        SpringApplication.run(EnergiaDcApplication.class, args);
    }
}
