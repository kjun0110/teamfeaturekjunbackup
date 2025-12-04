const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function createMainHandlers(setIsLoginModalOpen: (value: boolean) => void) {
  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginRequired = () => {
    setIsLoginModalOpen(true);
  };

  const handleExplore = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    // Simulate login action
    console.log('Login action triggered');
    setIsLoginModalOpen(false);
    // In a real app, this would redirect to login page or open login form
  };

  const handleKakaoLogin = async () => {
    try {
      // 1. 카카오 로그인 URL 가져오기
      const url = `${API_URL}/api/oauth/kakao/login`;
      console.log('Requesting Kakao login URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Response error:', response.status, errorText);
        throw new Error(`서버 오류 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      const loginUrl = data.url;
      if (!loginUrl) {
        throw new Error('로그인 URL을 받지 못했습니다.');
      }

      // 2. 현재 페이지 URL을 state로 저장 (로그인 후 돌아올 페이지)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('loginReturnUrl', window.location.pathname);
      }

      // 3. 카카오 로그인 페이지로 리다이렉트
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Kakao login error:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`로그인에 실패했습니다.\n\n${errorMessage}\n\n서버가 실행 중인지 확인해주세요.`);
    }
  };

  return {
    handleLoginClick,
    handleLoginRequired,
    handleExplore,
    handleLogin,
    handleKakaoLogin,
  };
}

