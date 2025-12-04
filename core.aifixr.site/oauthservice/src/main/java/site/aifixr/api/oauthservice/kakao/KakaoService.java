package site.aifixr.api.oauthservice.kakao;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import site.aifixr.api.oauthservice.config.KakaoConfig;
import site.aifixr.api.oauthservice.jwt.JwtTokenProvider;
import site.aifixr.api.oauthservice.kakao.dto.KakaoTokenResponse;
import site.aifixr.api.oauthservice.kakao.dto.KakaoUserInfo;

@Service
@RequiredArgsConstructor
@Slf4j
public class KakaoService {
    private final KakaoConfig kakaoConfig;
    private final RestTemplate restTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Authorization Code로 Access Token 요청
     */
    public KakaoTokenResponse getAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoConfig.getClientId());
        params.add("client_secret", kakaoConfig.getClientSecret());
        params.add("redirect_uri", kakaoConfig.getRedirectUri());
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<KakaoTokenResponse> response = restTemplate.postForEntity(
                    kakaoConfig.getTokenUri(),
                    request,
                    KakaoTokenResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                log.error("Failed to get access token. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to get access token from Kakao");
            }
        } catch (Exception e) {
            log.error("Error getting access token from Kakao", e);
            throw new RuntimeException("Error getting access token from Kakao", e);
        }
    }

    /**
     * Access Token으로 사용자 정보 조회
     */
    public KakaoUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoUserInfo> response = restTemplate.exchange(
                    kakaoConfig.getUserInfoUri(),
                    HttpMethod.GET,
                    request,
                    KakaoUserInfo.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                log.error("Failed to get user info. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to get user info from Kakao");
            }
        } catch (Exception e) {
            log.error("Error getting user info from Kakao", e);
            throw new RuntimeException("Error getting user info from Kakao", e);
        }
    }

    /**
     * 카카오 로그인 처리 (메인 로직)
     */
    public OAuthUserResponse processKakaoLogin(String code) {
        // 1. Access Token 획득
        KakaoTokenResponse tokenResponse = getAccessToken(code);

        // 2. 사용자 정보 조회
        KakaoUserInfo userInfo = getUserInfo(tokenResponse.getAccessToken());

        // 3. 카카오 사용자 정보 추출
        String kakaoId = userInfo.getId().toString();
        String email = userInfo.getKakaoAccount() != null
                ? userInfo.getKakaoAccount().getEmail()
                : null;
        String nickname = userInfo.getKakaoAccount() != null
                && userInfo.getKakaoAccount().getProfile() != null
                        ? userInfo.getKakaoAccount().getProfile().getNickname()
                        : null;
        String profileImage = userInfo.getKakaoAccount() != null
                && userInfo.getKakaoAccount().getProfile() != null
                        ? userInfo.getKakaoAccount().getProfile().getProfileImageUrl()
                        : null;

        // 4. JWT 토큰 생성 (카카오 ID를 String으로 사용)
        String jwtAccessToken = jwtTokenProvider.createAccessToken(kakaoId, email);
        String jwtRefreshToken = jwtTokenProvider.createRefreshToken(kakaoId);

        // 5. 응답 생성
        return OAuthUserResponse.builder()
                .accessToken(jwtAccessToken)
                .refreshToken(jwtRefreshToken)
                .user(OAuthUserResponse.UserInfo.builder()
                        .id(kakaoId)
                        .email(email)
                        .nickname(nickname)
                        .profileImage(profileImage)
                        .provider("kakao")
                        .build())
                .build();
    }

    /**
     * 카카오 OAuth 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OAuthUserResponse {
        private String accessToken;
        private String refreshToken;
        private UserInfo user;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class UserInfo {
            private String id;
            private String email;
            private String nickname;
            private String profileImage;
            private String provider; // "kakao"
        }
    }
}
