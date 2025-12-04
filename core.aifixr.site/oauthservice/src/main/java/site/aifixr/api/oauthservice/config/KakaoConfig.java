package site.aifixr.api.oauthservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "oauth.kakao")
@Getter
@Setter
public class KakaoConfig {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String tokenUri;
    private String userInfoUri;
    private String authorizeUri;
}
