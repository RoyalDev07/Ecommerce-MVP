from django.conf.urls import url, include
from django.urls import path
from rest_framework import routers
from api import views

from rest_framework_simplejwt import views as jwt_views
#from jogging.api import views

router = routers.DefaultRouter()

router.register(r'entry', views.EntryViewSet, 'entry-detail')
router.register(r'user', views.UserViewSet)
# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),

    path('signin', views.SignInView.as_view()),
    path('signup', views.SignUpView.as_view()),
    path('get_user/', views.UserView.as_view()),
    path('get_user_id/', views.UserId.as_view()),

    path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]