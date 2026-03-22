from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IDSViewSet, SpecificationViewSet, SearchView, TagViewSet, UserLibraryViewSet

router = DefaultRouter()
router.register(r'ids', IDSViewSet, basename='ids')
router.register(r'specifications', SpecificationViewSet, basename='specification')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'library', UserLibraryViewSet, basename='library')
router.register(r'search', SearchView, basename='search')

urlpatterns = [
    path('', include(router.urls)),
]
