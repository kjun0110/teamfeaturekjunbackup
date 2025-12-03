from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 서브라우터 import
import sys
from pathlib import Path

# 프로젝트 루트 경로 설정
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from services.crawlerservice.app.main import crawler_router
from services.chatbotservice.app.main import chatbot_router

app = FastAPI( #헤더임. 초반에는 비어있어도 되는 부분
    title="Gateway API",
    description="Gateway 서비스 API 문서",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (프로덕션에서는 특정 도메인으로 제한 권장)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 메인 라우터 생성
main_router = APIRouter()

@main_router.get("/") #얘는 화면이 아니라 글자만 깜빡거리는 거임. 이 부분은 게이트웨이 main에만 있는 것것
async def root():
    return {"message": "Gateway API 서비스 입니다."}



# 라우터를 앱에 포함
app.include_router(main_router)

# crawler-service 서브라우터 연결
app.include_router(crawler_router, prefix="/crawler")
# chatbot-service 서브라우터 연결
app.include_router(chatbot_router, prefix="/chatbot")



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)

