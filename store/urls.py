from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('shop/', views.shop, name='shop'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),
    path('cart/', views.cart, name='cart'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),  # Remove the <int:product_id>
    path('', views.home, name='home'),
    path('Product/', views.Product, name='Product'),
    path('checkout/', views.checkout, name='checkout'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('category/<slug:slug>/', views.category_products, name='category_products'),
    path('razorpay-success/', views.razorpay_success, name='razorpay_success'),
    path('order-confirmation/', views.order_confirmation, name='order_confirmation'),  # With hyphen
    path('order_confirmed/', views.order_confirmation, name='order_confirmation'),

]