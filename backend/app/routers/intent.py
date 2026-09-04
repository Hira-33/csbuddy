from fastapi import APIRouter, Depends

from app.deps import get_classifier
from app.models import IntentRequest, IntentResponse
from app.services.classifier import IntentClassifier

router = APIRouter(prefix="/intent", tags=["intent"])


@router.post("", response_model=IntentResponse)
def predict_intent(
    request: IntentRequest,
    classifier: IntentClassifier = Depends(get_classifier),
):
    result = classifier.predict(request.text)
    return IntentResponse(**result)
