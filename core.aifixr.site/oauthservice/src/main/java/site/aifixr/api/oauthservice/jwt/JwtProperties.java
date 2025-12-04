package site.aifixr.api.oauthservice.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {
    private String secret;
    private Long accessTokenExpiration = 3600000L; // 1시간 (밀리초)
    private Long refreshTokenExpiration = 604800000L; // 7일 (밀리초)
}
