package com.example._puzzle;

import java.io.File;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		File envFile = new File(".env");
        if (envFile.exists()) {
            Dotenv dotenv = Dotenv.load();
            System.setProperty("DB_USER", dotenv.get("DB_USER"));
            System.setProperty("DB_PASS", dotenv.get("DB_PASS"));
            System.setProperty("DB_URL", dotenv.get("DB_URL"));
        } else {
            System.setProperty("DB_USER", System.getenv("DB_USER"));
            System.setProperty("DB_PASS", System.getenv("DB_PASS"));
            System.setProperty("DB_URL", System.getenv("DB_URL"));
        }
		SpringApplication.run(Application.class, args);
	}

}
