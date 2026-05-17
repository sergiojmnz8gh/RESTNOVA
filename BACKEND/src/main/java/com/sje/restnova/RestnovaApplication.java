package com.sje.restnova;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class RestnovaApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestnovaApplication.class, args);
	}

}

