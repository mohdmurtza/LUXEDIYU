# store/admin.py
from django.contrib import admin
from .models import Category, Product, Customer, Order

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'price', 'stock', 'is_featured', 'created_at']
    list_filter = ['category', 'brand', 'is_featured', 'created_at']
    search_fields = ['name', 'description', 'brand']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'city', 'state', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    list_filter = ['state', 'created_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'product_name', 'total_price', 'status', 'payment_method', 'order_date']
    list_filter = ['status', 'payment_method', 'order_date']
    search_fields = ['order_id', 'customer__email', 'customer__phone', 'product_name']
    readonly_fields = ['order_id', 'order_date']
    
    fieldsets = (
        ('Order Info', {
            'fields': ('order_id', 'customer', 'product_name', 'quantity', 'total_price')
        }),
        ('Product Details', {
            'fields': ('product_price', 'color', 'size', 'product_image')
        }),
        ('Status', {
            'fields': ('status', 'payment_method', 'payment_status', 'order_date', 'delivery_date')
        }),
    )