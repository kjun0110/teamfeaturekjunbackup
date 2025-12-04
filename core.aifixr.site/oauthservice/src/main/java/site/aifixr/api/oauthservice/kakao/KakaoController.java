package site.aifixr.api.oauthservice.kakao;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import site.aifixr.api.oauthservice.config.KakaoConfig;
import site.aifixr.api.oauthservice.kakao.KakaoService.OAuthUserResponse;

import java.util.Map;

@RestController
@RequestMapping("/kakao")
@RequiredArgsConstructor
@Slf4j
public class KakaoController {
    private final KakaoService kakaoService;
    private final KakaoConfig kakaoConfig;

    /**
     * 카카오 로그인 URL 생성
     * GET /kakao/login
     */
    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> getKakaoLoginUrl() {
        try {
            // Validate configuration
            if (kakaoConfig.getClientId() == null || kakaoConfig.getClientId().isEmpty()) {
                log.error("KAKAO_CLIENT_ID is not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Kakao OAuth is not properly configured. Please set KAKAO_CLIENT_ID."));
            }

            if (kakaoConfig.getRedirectUri() == null || kakaoConfig.getRedirectUri().isEmpty()) {
                log.error("KAKAO_REDIRECT_URI is not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Kakao redirect URI is not configured."));
            }

            log.info("Generating Kakao login URL with client_id: {}, redirect_uri: {}",
                    kakaoConfig.getClientId().substring(0, Math.min(4, kakaoConfig.getClientId().length())) + "...",
                    kakaoConfig.getRedirectUri());

            String loginUrl = UriComponentsBuilder
                    .fromUriString(kakaoConfig.getAuthorizeUri())
                    .queryParam("client_id", kakaoConfig.getClientId())
                    .queryParam("redirect_uri", kakaoConfig.getRedirectUri())
                    .queryParam("response_type", "code")
                    .build()
                    .toUriString();

            log.info("Generated Kakao login URL: {}", loginUrl.replaceAll("client_id=[^&]+", "client_id=***"));
            return ResponseEntity.ok(Map.of("url", loginUrl));
        } catch (Exception e) {
            log.error("Error generating Kakao login URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate login URL: " + e.getMessage()));
        }
    }

    /**
     * 카카오 로그인 콜백 처리
     * GET /kakao/callback?code=AUTHORIZATION_CODE
     */
    @GetMapping("/callback")
    public ResponseEntity<OAuthUserResponse> kakaoCallback(@RequestParam String code) {
        try {
            OAuthUserResponse response = kakaoService.processKakaoLogin(code);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Kakao login failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
