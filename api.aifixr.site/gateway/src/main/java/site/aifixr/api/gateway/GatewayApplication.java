package site.aifixr.api.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}

	/**
	 * IP address-based Key Resolver for Rate Limiting
	 * Moved from RateLimiterKeyResolver.java to keep all configuration in one place
	 */
	@Bean
	public KeyResolver ipKeyResolver() {
		return exchange -> {
			String ipAddress = "unknown";
			var remoteAddr = exchange.getRequest().getRemoteAddress();
			if (remoteAddr != null && remoteAddr.getAddress() != null) {
				ipAddress = remoteAddr.getAddress().getHostAddress();
			}
			return Mono.just(ipAddress);
		};
	}

	/**
	 * CORS WebFilter for handling preflight requests
	 * Using allowedOriginPatterns to support both specific origins and wildcards
	 */
	@Bean
	public CorsWebFilter corsWebFilter() {
		CorsConfiguration corsConfig = new CorsConfiguration();

		// Use allowedOriginPatterns to support wildcards and specific origins
		corsConfig.setAllowedOriginPatterns(Arrays.asList(
				"http://localhost:*",
				"http://127.0.0.1:*",
				"http://localhost:3000",
				"http://localhost:3001",
				"http://127.0.0.1:3000",
				"http://127.0.0.1:3001"));

		corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		corsConfig.setAllowedHeaders(List.of("*"));
		corsConfig.setAllowCredentials(true); // Allow credentials for authenticated requests
		corsConfig.setMaxAge(3600L); // Cache preflight response for 1 hour
		corsConfig.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", corsConfig);

		return new CorsWebFilter(source);
	}

}
