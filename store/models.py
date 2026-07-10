# store/models.py
from django.db import models
from django.urls import reverse

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    image = models.ImageField(upload_to='products/')
    image1 = models.ImageField(upload_to='products/', blank=True, null=True)
    image2 = models.ImageField(upload_to='products/', blank=True, null=True)
    image3 = models.ImageField(upload_to='products/', blank=True, null=True)
    color = models.CharField(max_length=50, default='Gold')
    size = models.CharField(max_length=50, default='One Size')
    stock = models.IntegerField(default=1)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    review_count = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    def get_discount_percent(self):
        if self.original_price:
            return int((self.original_price - self.price) / self.original_price * 100)
        return 0
    
    def get_absolute_url(self):
        return reverse('product_detail', kwargs={'slug': self.slug})


# store/models.py
from django.db import models
from django.contrib.auth.models import User


# ===================== CUSTOMER & ORDER MODELS =====================

class Customer(models.Model):
    """Customer details - saved when they place an order"""
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_address(self):
        return f"{self.address}, {self.city}, {self.state} - {self.pincode}"

class Order(models.Model):
    """Order details - saved when customer places order"""
    
    STATUS_CHOICES = [
        ('Confirmed', 'Confirmed'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHODS = [
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('cod', 'Cash on Delivery'),
    ]
    
    # Order identification
    order_id = models.CharField(max_length=50)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    
    # Product details at time of order
    product_name = models.CharField(max_length=200)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    color = models.CharField(max_length=50)
    size = models.CharField(max_length=50)
    product_image = models.URLField(blank=True, null=True)
    
    # Order totals
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment & Status
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_status = models.CharField(max_length=20, default='Pending')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Confirmed')
    
    # Dates
    order_date = models.DateTimeField(auto_now_add=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    shipped_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Order {self.order_id} - {self.product_name}"
    
    @property
    def order_total(self):
        """Total for this specific order item"""
        return self.product_price * self.quantity
    
    class Meta:
        ordering = ['-order_date']
        verbose_name_plural = 'Orders'