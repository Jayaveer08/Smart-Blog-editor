from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.ai_schema import AIRequest
from app.services.ai_service import build_prompt, stream_ai_response, log_ai_usage
from app.utils.security import get_current_user


router = APIRouter(
    prefix="/ai",   # 👈 match your other routes (/api/posts)
    tags=["AI"]
)

@router.post("/stream")
async def stream_ai(
    req: AIRequest,
    current_user=Depends(get_current_user)
):
    user_id = current_user["user_id"]

    prompt = await build_prompt(req.text, req.action)

    # 🔥 Log usage BEFORE streaming
    await log_ai_usage(
        user_id=user_id,
        action=req.action,
        input_length=len(req.text)
    )

    return StreamingResponse(
        stream_ai_response(prompt),
        media_type="text/plain"
    )
