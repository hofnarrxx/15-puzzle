package com.example._puzzle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
    	System.setProperty("DB_USER", dotenv.get("DB_USER"));
    	System.setProperty("DB_PASS", dotenv.get("DB_PASS"));
    	System.setProperty("DB_URL", dotenv.get("DB_URL"));
		SpringApplication.run(Application.class, args);
	}

}
